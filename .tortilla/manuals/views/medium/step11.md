# Step 11: Google Maps &amp; Geolocation

In this step we will add the ability to send the current location in [Google Maps](https://www.google.com/maps/).

[{]: <helper> (diffStep 11.1)

#### [Step 11.1: Add cordova plugin for geolocation](../../../../commit/b35e4bf)
<br>
##### Changed package.json
<pre>
<i>@@ -50,6 +50,7 @@</i>
 ┊50┊50┊    &quot;cordova-plugin-console&quot;,
 ┊51┊51┊    &quot;cordova-plugin-statusbar&quot;,
 ┊52┊52┊    &quot;cordova-plugin-device&quot;,
<b>+┊  ┊53┊    &quot;cordova-plugin-geolocation&quot;,</b>
 ┊53┊54┊    &quot;ionic-plugin-keyboard&quot;,
 ┊54┊55┊    &quot;cordova-plugin-splashscreen&quot;
 ┊55┊56┊  ],
</pre>

[}]: #

## Geo Location

To get the devices location (aka `geo-location`) we will install a `Cordova` plug-in called `cordova-plugin-geolocation` which will provide us with these abilities:

## Angular 2 Google Maps

Since the location is going to be presented with `Google Maps`, we will install a package which will help up interact with it in `Angular 2`:

    $ npm install --save angular2-google-maps

Before you import the installed package to the app's `NgModule` be sure to generate an API key. An API key is a code passed in by computer programs calling an API to identify the calling program, its developer, or its user to the Web site. To generate an API key go to [Google Maps API documentation page](https://developers.google.com/maps/documentation/javascript/get-api-key) and follow the instructions. **Each app should have it's own API key**, as for now we can just use an API key we generated for the sake of this tutorial, but once you are ready for production, **replace the API key in the script below**:

[{]: <helper> (diffStep 11.3)

#### [Step 11.3: Import google maps module](../../../../commit/ef053a6)
<br>
##### Changed src&#x2F;app&#x2F;app.module.ts
<pre>
<i>@@ -1,4 +1,5 @@</i>
 ┊1┊1┊import { NgModule, ErrorHandler } from &#x27;@angular/core&#x27;;
<b>+┊ ┊2┊import { AgmCoreModule } from &#x27;angular2-google-maps/core&#x27;;</b>
 ┊2┊3┊import { MomentModule } from &#x27;angular2-moment&#x27;;
 ┊3┊4┊import { IonicApp, IonicModule, IonicErrorHandler } from &#x27;ionic-angular&#x27;;
 ┊4┊5┊import { ChatsPage } from &#x27;../pages/chats/chats&#x27;;
</pre>
<pre>
<i>@@ -26,7 +27,10 @@</i>
 ┊26┊27┊  ],
 ┊27┊28┊  imports: [
 ┊28┊29┊    IonicModule.forRoot(MyApp),
<b>+┊  ┊30┊    MomentModule,</b>
<b>+┊  ┊31┊    AgmCoreModule.forRoot({</b>
<b>+┊  ┊32┊      apiKey: &#x27;AIzaSyAWoBdZHCNh5R-hB5S5ZZ2oeoYyfdDgniA&#x27;</b>
<b>+┊  ┊33┊    })</b>
 ┊30┊34┊  ],
 ┊31┊35┊  bootstrap: [IonicApp],
 ┊32┊36┊  entryComponents: [
</pre>

[}]: #

## Attachments Menu

Before we proceed any further, we will add a new message type to our schema, so we can differentiate between a text message and a location message:

[{]: <helper> (diffStep 11.4)

#### [Step 11.4: Added location message type](../../../../commit/95d4a15)
<br>
##### Changed api&#x2F;server&#x2F;models.ts
<pre>
<i>@@ -6,7 +6,8 @@</i>
 ┊ 6┊ 6┊}
 ┊ 7┊ 7┊
 ┊ 8┊ 8┊export enum MessageType {
<b>+┊  ┊ 9┊  TEXT &#x3D; &lt;any&gt;&#x27;text&#x27;,</b>
<b>+┊  ┊10┊  LOCATION &#x3D; &lt;any&gt;&#x27;location&#x27;</b>
 ┊10┊11┊}
 ┊11┊12┊
 ┊12┊13┊export interface Chat {
</pre>

[}]: #

We want the user to be able to send a location message through an attachments menu in the `MessagesPage`, so let's implement the initial `MessagesAttachmentsComponent`, and as we go through, we will start filling it up:

[{]: <helper> (diffStep 11.5)

#### [Step 11.5: Added stub for messages attachment menu](../../../../commit/75fabb6)
<br>
##### Added src&#x2F;pages&#x2F;messages&#x2F;messages-attachments.ts
<pre>
<i>@@ -0,0 +1,15 @@</i>
<b>+┊  ┊ 1┊import { Component } from &#x27;@angular/core&#x27;;</b>
<b>+┊  ┊ 2┊import { AlertController, Platform, ModalController, ViewController } from &#x27;ionic-angular&#x27;;</b>
<b>+┊  ┊ 3┊</b>
<b>+┊  ┊ 4┊@Component({</b>
<b>+┊  ┊ 5┊  selector: &#x27;messages-attachments&#x27;,</b>
<b>+┊  ┊ 6┊  templateUrl: &#x27;messages-attachments.html&#x27;</b>
<b>+┊  ┊ 7┊})</b>
<b>+┊  ┊ 8┊export class MessagesAttachmentsComponent {</b>
<b>+┊  ┊ 9┊  constructor(</b>
<b>+┊  ┊10┊    private alertCtrl: AlertController,</b>
<b>+┊  ┊11┊    private platform: Platform,</b>
<b>+┊  ┊12┊    private viewCtrl: ViewController,</b>
<b>+┊  ┊13┊    private modelCtrl: ModalController</b>
<b>+┊  ┊14┊  ) {}</b>
<b>+┊  ┊15┊}</b>
</pre>

[}]: #

[{]: <helper> (diffStep 11.6)

#### [Step 11.6: Added messages attachment menu template](../../../../commit/128d85b)
<br>
##### Added src&#x2F;pages&#x2F;messages&#x2F;messages-attachments.html
<pre>
<i>@@ -0,0 +1,18 @@</i>
<b>+┊  ┊ 1┊&lt;ion-content class&#x3D;&quot;messages-attachments-page-content&quot;&gt;</b>
<b>+┊  ┊ 2┊  &lt;ion-list class&#x3D;&quot;attachments&quot;&gt;</b>
<b>+┊  ┊ 3┊    &lt;button ion-item class&#x3D;&quot;attachment attachment-gallery&quot;&gt;</b>
<b>+┊  ┊ 4┊      &lt;ion-icon name&#x3D;&quot;images&quot; class&#x3D;&quot;attachment-icon&quot;&gt;&lt;/ion-icon&gt;</b>
<b>+┊  ┊ 5┊      &lt;div class&#x3D;&quot;attachment-name&quot;&gt;Gallery&lt;/div&gt;</b>
<b>+┊  ┊ 6┊    &lt;/button&gt;</b>
<b>+┊  ┊ 7┊</b>
<b>+┊  ┊ 8┊    &lt;button ion-item class&#x3D;&quot;attachment attachment-camera&quot;&gt;</b>
<b>+┊  ┊ 9┊      &lt;ion-icon name&#x3D;&quot;camera&quot; class&#x3D;&quot;attachment-icon&quot;&gt;&lt;/ion-icon&gt;</b>
<b>+┊  ┊10┊      &lt;div class&#x3D;&quot;attachment-name&quot;&gt;Camera&lt;/div&gt;</b>
<b>+┊  ┊11┊    &lt;/button&gt;</b>
<b>+┊  ┊12┊</b>
<b>+┊  ┊13┊    &lt;button ion-item class&#x3D;&quot;attachment attachment-location&quot;&gt;</b>
<b>+┊  ┊14┊      &lt;ion-icon name&#x3D;&quot;locate&quot; class&#x3D;&quot;attachment-icon&quot;&gt;&lt;/ion-icon&gt;</b>
<b>+┊  ┊15┊      &lt;div class&#x3D;&quot;attachment-name&quot;&gt;Location&lt;/div&gt;</b>
<b>+┊  ┊16┊    &lt;/button&gt;</b>
<b>+┊  ┊17┊  &lt;/ion-list&gt;</b>
<b>+┊  ┊18┊&lt;/ion-content&gt;</b>
</pre>

[}]: #

[{]: <helper> (diffStep 11.7)

#### [Step 11.7: Added styles for messages attachment](../../../../commit/181b606)
<br>
##### Added src&#x2F;pages&#x2F;messages&#x2F;messages-attachments.scss
<pre>
<i>@@ -0,0 +1,46 @@</i>
<b>+┊  ┊ 1┊.messages-attachments-page-content {</b>
<b>+┊  ┊ 2┊  $icon-background-size: 60px;</b>
<b>+┊  ┊ 3┊  $icon-font-size: 20pt;</b>
<b>+┊  ┊ 4┊</b>
<b>+┊  ┊ 5┊  .attachments {</b>
<b>+┊  ┊ 6┊    width: 100%;</b>
<b>+┊  ┊ 7┊    margin: 0;</b>
<b>+┊  ┊ 8┊    display: inline-flex;</b>
<b>+┊  ┊ 9┊  }</b>
<b>+┊  ┊10┊</b>
<b>+┊  ┊11┊  .attachment {</b>
<b>+┊  ┊12┊    text-align: center;</b>
<b>+┊  ┊13┊    margin: 0;</b>
<b>+┊  ┊14┊    padding: 0;</b>
<b>+┊  ┊15┊</b>
<b>+┊  ┊16┊    .item-inner {</b>
<b>+┊  ┊17┊      padding: 0</b>
<b>+┊  ┊18┊    }</b>
<b>+┊  ┊19┊</b>
<b>+┊  ┊20┊    .attachment-icon {</b>
<b>+┊  ┊21┊      width: $icon-background-size;</b>
<b>+┊  ┊22┊      height: $icon-background-size;</b>
<b>+┊  ┊23┊      line-height: $icon-background-size;</b>
<b>+┊  ┊24┊      font-size: $icon-font-size;</b>
<b>+┊  ┊25┊      border-radius: 50%;</b>
<b>+┊  ┊26┊      color: white;</b>
<b>+┊  ┊27┊      margin-bottom: 10px</b>
<b>+┊  ┊28┊    }</b>
<b>+┊  ┊29┊</b>
<b>+┊  ┊30┊    .attachment-name {</b>
<b>+┊  ┊31┊      color: gray;</b>
<b>+┊  ┊32┊    }</b>
<b>+┊  ┊33┊  }</b>
<b>+┊  ┊34┊</b>
<b>+┊  ┊35┊  .attachment-gallery .attachment-icon {</b>
<b>+┊  ┊36┊    background: linear-gradient(#e13838 50%, #f53d3d 50%);</b>
<b>+┊  ┊37┊  }</b>
<b>+┊  ┊38┊</b>
<b>+┊  ┊39┊  .attachment-camera .attachment-icon {</b>
<b>+┊  ┊40┊    background: linear-gradient(#3474e1 50%, #387ef5 50%);</b>
<b>+┊  ┊41┊  }</b>
<b>+┊  ┊42┊</b>
<b>+┊  ┊43┊  .attachment-location .attachment-icon {</b>
<b>+┊  ┊44┊    background: linear-gradient(#2ec95c 50%, #32db64 50%);</b>
<b>+┊  ┊45┊  }</b>
<b>+┊  ┊46┊}</b>
</pre>

[}]: #

[{]: <helper> (diffStep 11.8)

#### [Step 11.8: Import MessagesAttachmentsComponent](../../../../commit/17f5cac)
<br>
##### Changed src&#x2F;app&#x2F;app.module.ts
<pre>
<i>@@ -7,6 +7,7 @@</i>
 ┊ 7┊ 7┊import { ChatsOptionsComponent } from &#x27;../pages/chats/chats-options&#x27;;
 ┊ 8┊ 8┊import { LoginPage } from &#x27;../pages/login/login&#x27;;
 ┊ 9┊ 9┊import { MessagesPage } from &#x27;../pages/messages/messages&#x27;;
<b>+┊  ┊10┊import { MessagesAttachmentsComponent } from &#x27;../pages/messages/messages-attachments&#x27;;</b>
 ┊10┊11┊import { MessagesOptionsComponent } from &#x27;../pages/messages/messages-options&#x27;;
 ┊11┊12┊import { ProfilePage } from &#x27;../pages/profile/profile&#x27;;
 ┊12┊13┊import { VerificationPage } from &#x27;../pages/verification/verification&#x27;;
</pre>
<pre>
<i>@@ -23,7 +24,8 @@</i>
 ┊23┊24┊    ProfilePage,
 ┊24┊25┊    ChatsOptionsComponent,
 ┊25┊26┊    NewChatComponent,
<b>+┊  ┊27┊    MessagesOptionsComponent,</b>
<b>+┊  ┊28┊    MessagesAttachmentsComponent</b>
 ┊27┊29┊  ],
 ┊28┊30┊  imports: [
 ┊29┊31┊    IonicModule.forRoot(MyApp),
</pre>
<pre>
<i>@@ -42,7 +44,8 @@</i>
 ┊42┊44┊    ProfilePage,
 ┊43┊45┊    ChatsOptionsComponent,
 ┊44┊46┊    NewChatComponent,
<b>+┊  ┊47┊    MessagesOptionsComponent,</b>
<b>+┊  ┊48┊    MessagesAttachmentsComponent</b>
 ┊46┊49┊  ],
 ┊47┊50┊  providers: [
 ┊48┊51┊    {provide: ErrorHandler, useClass: IonicErrorHandler},
</pre>

[}]: #

We will add a generic style-sheet for the attachments menu since it can also use us in the future:

[{]: <helper> (diffStep 11.9)

#### [Step 11.9: Added styles for the popover container](../../../../commit/f0c0283)
<br>
##### Changed src&#x2F;app&#x2F;app.scss
<pre>
<i>@@ -27,3 +27,15 @@</i>
 ┊27┊27┊  left: calc(100% - #{$options-popover-width} - #{$options-popover-margin}) !important;
 ┊28┊28┊  top: $options-popover-margin !important;
 ┊29┊29┊}
<b>+┊  ┊30┊</b>
<b>+┊  ┊31┊// Attachments Popover Component</b>
<b>+┊  ┊32┊// --------------------------------------------------</b>
<b>+┊  ┊33┊</b>
<b>+┊  ┊34┊$attachments-popover-width: 100%;</b>
<b>+┊  ┊35┊</b>
<b>+┊  ┊36┊.attachments-popover .popover-content {</b>
<b>+┊  ┊37┊  width: $attachments-popover-width;</b>
<b>+┊  ┊38┊  transform-origin: 300px 30px !important;</b>
<b>+┊  ┊39┊  left: calc(100% - #{$attachments-popover-width}) !important;</b>
<b>+┊  ┊40┊  top: 58px !important;</b>
<b>+┊  ┊41┊}</b>
</pre>

[}]: #

Now we will add a handler in the `MessagesPage` which will open the newly created menu, and we will bind it to the view:

[{]: <helper> (diffStep 11.1)

#### [Step 11.1: Add cordova plugin for geolocation](../../../../commit/b35e4bf)
<br>
##### Changed package.json
<pre>
<i>@@ -50,6 +50,7 @@</i>
 ┊50┊50┊    &quot;cordova-plugin-console&quot;,
 ┊51┊51┊    &quot;cordova-plugin-statusbar&quot;,
 ┊52┊52┊    &quot;cordova-plugin-device&quot;,
<b>+┊  ┊53┊    &quot;cordova-plugin-geolocation&quot;,</b>
 ┊53┊54┊    &quot;ionic-plugin-keyboard&quot;,
 ┊54┊55┊    &quot;cordova-plugin-splashscreen&quot;
 ┊55┊56┊  ],
</pre>

[}]: #

[{]: <helper> (diffStep 11.11)

#### [Step 11.11: Bind click event to showAttachments](../../../../commit/0af1eef)
<br>
##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.html
<pre>
<i>@@ -7,7 +7,7 @@</i>
 ┊ 7┊ 7┊    &lt;ion-title class&#x3D;&quot;chat-title&quot;&gt;{{title}}&lt;/ion-title&gt;
 ┊ 8┊ 8┊
 ┊ 9┊ 9┊    &lt;ion-buttons end&gt;
<b>+┊  ┊10┊      &lt;button ion-button icon-only class&#x3D;&quot;attach-button&quot; (click)&#x3D;&quot;showAttachments()&quot;&gt;&lt;ion-icon name&#x3D;&quot;attach&quot;&gt;&lt;/ion-icon&gt;&lt;/button&gt;</b>
 ┊11┊11┊      &lt;button ion-button icon-only class&#x3D;&quot;options-button&quot; (click)&#x3D;&quot;showOptions()&quot;&gt;&lt;ion-icon name&#x3D;&quot;more&quot;&gt;&lt;/ion-icon&gt;&lt;/button&gt;
 ┊12┊12┊    &lt;/ion-buttons&gt;
 ┊13┊13┊  &lt;/ion-navbar&gt;
</pre>

[}]: #

## Sending Location

A location is a composition of longitude, latitude and an altitude, or in short: `long, lat, alt`. Let's define a new `Location` model which will represent the mentioned schema:

[{]: <helper> (diffStep 11.12)

#### [Step 11.12: Added location model](../../../../commit/7f385e1)
<br>
##### Changed api&#x2F;server&#x2F;models.ts
<pre>
<i>@@ -31,3 +31,9 @@</i>
 ┊31┊31┊export interface User extends Meteor.User {
 ┊32┊32┊  profile?: Profile;
 ┊33┊33┊}
<b>+┊  ┊34┊</b>
<b>+┊  ┊35┊export interface Location {</b>
<b>+┊  ┊36┊  lat: number;</b>
<b>+┊  ┊37┊  lng: number;</b>
<b>+┊  ┊38┊  zoom: number;</b>
<b>+┊  ┊39┊}</b>
</pre>

[}]: #

Up next, would be implementing the actual component which will handle geo-location sharing:

[{]: <helper> (diffStep 11.13)

#### [Step 11.13: Implement location message component](../../../../commit/f1b4c39)
<br>
##### Added src&#x2F;pages&#x2F;messages&#x2F;location-message.ts
<pre>
<i>@@ -0,0 +1,74 @@</i>
<b>+┊  ┊ 1┊import { Component, OnInit, OnDestroy } from &#x27;@angular/core&#x27;;</b>
<b>+┊  ┊ 2┊import { Platform, ViewController } from &#x27;ionic-angular&#x27;;</b>
<b>+┊  ┊ 3┊import { Geolocation } from &#x27;ionic-native&#x27;;</b>
<b>+┊  ┊ 4┊import { Location } from &#x27;api/models&#x27;;</b>
<b>+┊  ┊ 5┊import { Observable, Subscription } from &#x27;rxjs&#x27;;</b>
<b>+┊  ┊ 6┊</b>
<b>+┊  ┊ 7┊const DEFAULT_ZOOM &#x3D; 8;</b>
<b>+┊  ┊ 8┊const EQUATOR &#x3D; 40075004;</b>
<b>+┊  ┊ 9┊const DEFAULT_LAT &#x3D; 51.678418;</b>
<b>+┊  ┊10┊const DEFAULT_LNG &#x3D; 7.809007;</b>
<b>+┊  ┊11┊const LOCATION_REFRESH_INTERVAL &#x3D; 500;</b>
<b>+┊  ┊12┊</b>
<b>+┊  ┊13┊@Component({</b>
<b>+┊  ┊14┊  selector: &#x27;location-message&#x27;,</b>
<b>+┊  ┊15┊  templateUrl: &#x27;location-message.html&#x27;</b>
<b>+┊  ┊16┊})</b>
<b>+┊  ┊17┊export class NewLocationMessageComponent implements OnInit, OnDestroy {</b>
<b>+┊  ┊18┊  lat: number &#x3D; DEFAULT_LAT;</b>
<b>+┊  ┊19┊  lng: number &#x3D; DEFAULT_LNG;</b>
<b>+┊  ┊20┊  zoom: number &#x3D; DEFAULT_ZOOM;</b>
<b>+┊  ┊21┊  accuracy: number &#x3D; -1;</b>
<b>+┊  ┊22┊  intervalObs: Subscription;</b>
<b>+┊  ┊23┊</b>
<b>+┊  ┊24┊  constructor(private platform: Platform, private viewCtrl: ViewController) {</b>
<b>+┊  ┊25┊  }</b>
<b>+┊  ┊26┊</b>
<b>+┊  ┊27┊  ngOnInit() {</b>
<b>+┊  ┊28┊    // Refresh location at a specific refresh rate</b>
<b>+┊  ┊29┊    this.intervalObs &#x3D; this.reloadLocation()</b>
<b>+┊  ┊30┊      .flatMapTo(Observable</b>
<b>+┊  ┊31┊        .interval(LOCATION_REFRESH_INTERVAL)</b>
<b>+┊  ┊32┊        .timeInterval())</b>
<b>+┊  ┊33┊      .subscribe(() &#x3D;&gt; {</b>
<b>+┊  ┊34┊        this.reloadLocation();</b>
<b>+┊  ┊35┊      });</b>
<b>+┊  ┊36┊  }</b>
<b>+┊  ┊37┊</b>
<b>+┊  ┊38┊  ngOnDestroy() {</b>
<b>+┊  ┊39┊    // Dispose subscription</b>
<b>+┊  ┊40┊    if (this.intervalObs) {</b>
<b>+┊  ┊41┊      this.intervalObs.unsubscribe();</b>
<b>+┊  ┊42┊    }</b>
<b>+┊  ┊43┊  }</b>
<b>+┊  ┊44┊</b>
<b>+┊  ┊45┊  calculateZoomByAccureacy(accuracy: number): number {</b>
<b>+┊  ┊46┊    // Source: http://stackoverflow.com/a/25143326</b>
<b>+┊  ┊47┊    const deviceHeight &#x3D; this.platform.height();</b>
<b>+┊  ┊48┊    const deviceWidth &#x3D; this.platform.width();</b>
<b>+┊  ┊49┊    const screenSize &#x3D; Math.min(deviceWidth, deviceHeight);</b>
<b>+┊  ┊50┊    const requiredMpp &#x3D; accuracy / screenSize;</b>
<b>+┊  ┊51┊</b>
<b>+┊  ┊52┊    return ((Math.log(EQUATOR / (256 * requiredMpp))) / Math.log(2)) + 1;</b>
<b>+┊  ┊53┊  }</b>
<b>+┊  ┊54┊</b>
<b>+┊  ┊55┊  reloadLocation() {</b>
<b>+┊  ┊56┊    return Observable.fromPromise(Geolocation.getCurrentPosition().then((position) &#x3D;&gt; {</b>
<b>+┊  ┊57┊      if (this.lat &amp;&amp; this.lng) {</b>
<b>+┊  ┊58┊        // Update view-models to represent the current geo-location</b>
<b>+┊  ┊59┊        this.accuracy &#x3D; position.coords.accuracy;</b>
<b>+┊  ┊60┊        this.lat &#x3D; position.coords.latitude;</b>
<b>+┊  ┊61┊        this.lng &#x3D; position.coords.longitude;</b>
<b>+┊  ┊62┊        this.zoom &#x3D; this.calculateZoomByAccureacy(this.accuracy);</b>
<b>+┊  ┊63┊      }</b>
<b>+┊  ┊64┊    }));</b>
<b>+┊  ┊65┊  }</b>
<b>+┊  ┊66┊</b>
<b>+┊  ┊67┊  sendLocation() {</b>
<b>+┊  ┊68┊    this.viewCtrl.dismiss(&lt;Location&gt;{</b>
<b>+┊  ┊69┊      lat: this.lat,</b>
<b>+┊  ┊70┊      lng: this.lng,</b>
<b>+┊  ┊71┊      zoom: this.zoom</b>
<b>+┊  ┊72┊    });</b>
<b>+┊  ┊73┊  }</b>
<b>+┊  ┊74┊}</b>
</pre>

[}]: #

Basically, what this component does is refreshing the current geo-location at a specific refresh rate. Note that in order to fetch the geo-location we use `Geolocation's` API, but behind the scene it uses ``cordova-plugin-geolocation`. The `sendLocation` method dismisses the view and returns the calculated geo-location. Now let's added the component's corresponding view:

[{]: <helper> (diffStep 11.14)

#### [Step 11.14: Added location message template](../../../../commit/d39282f)
<br>
##### Added src&#x2F;pages&#x2F;messages&#x2F;location-message.html
<pre>
<i>@@ -0,0 +1,22 @@</i>
<b>+┊  ┊ 1┊&lt;ion-header&gt;</b>
<b>+┊  ┊ 2┊  &lt;ion-toolbar color&#x3D;&quot;whatsapp&quot;&gt;</b>
<b>+┊  ┊ 3┊    &lt;ion-title&gt;Send Location&lt;/ion-title&gt;</b>
<b>+┊  ┊ 4┊</b>
<b>+┊  ┊ 5┊    &lt;ion-buttons end&gt;</b>
<b>+┊  ┊ 6┊      &lt;button ion-button class&#x3D;&quot;dismiss-button&quot; (click)&#x3D;&quot;viewCtrl.dismiss()&quot;&gt;&lt;ion-icon name&#x3D;&quot;close&quot;&gt;&lt;/ion-icon&gt;&lt;/button&gt;</b>
<b>+┊  ┊ 7┊    &lt;/ion-buttons&gt;</b>
<b>+┊  ┊ 8┊  &lt;/ion-toolbar&gt;</b>
<b>+┊  ┊ 9┊&lt;/ion-header&gt;</b>
<b>+┊  ┊10┊</b>
<b>+┊  ┊11┊&lt;ion-content class&#x3D;&quot;location-message-content&quot;&gt;</b>
<b>+┊  ┊12┊  &lt;ion-list&gt;</b>
<b>+┊  ┊13┊    &lt;sebm-google-map [latitude]&#x3D;&quot;lat&quot; [longitude]&#x3D;&quot;lng&quot; [zoom]&#x3D;&quot;zoom&quot;&gt;</b>
<b>+┊  ┊14┊      &lt;sebm-google-map-marker [latitude]&#x3D;&quot;lat&quot; [longitude]&#x3D;&quot;lng&quot;&gt;&lt;/sebm-google-map-marker&gt;</b>
<b>+┊  ┊15┊    &lt;/sebm-google-map&gt;</b>
<b>+┊  ┊16┊    &lt;ion-item (click)&#x3D;&quot;sendLocation()&quot;&gt;</b>
<b>+┊  ┊17┊      &lt;ion-icon name&#x3D;&quot;compass&quot; item-left&gt;&lt;/ion-icon&gt;</b>
<b>+┊  ┊18┊      &lt;h2&gt;Send your current location&lt;/h2&gt;</b>
<b>+┊  ┊19┊      &lt;p *ngIf&#x3D;&quot;accuracy !&#x3D;&#x3D; -1&quot;&gt;Accurate to {{accuracy}} meters&lt;/p&gt;</b>
<b>+┊  ┊20┊    &lt;/ion-item&gt;</b>
<b>+┊  ┊21┊  &lt;/ion-list&gt;</b>
<b>+┊  ┊22┊&lt;/ion-content&gt;</b>
</pre>

[}]: #

The `sebm-google-map` is the component which represents the map itself, and we provide it with `lat`, `lng` and `zoom`, so the map can be focused on the current geo-location. If you'll notice, we also used the `sebm-google-map-marker` component with the same data-models, so the marker will be shown right in the center of the map.

Now we will add some `CSS` to make sure the map is visible:

[{]: <helper> (diffStep 11.15)

#### [Step 11.15: Added location message stylesheet](../../../../commit/5eeef10)
<br>
##### Added src&#x2F;pages&#x2F;messages&#x2F;location-message.scss
<pre>
<i>@@ -0,0 +1,14 @@</i>
<b>+┊  ┊ 1┊.location-message-content {</b>
<b>+┊  ┊ 2┊  .scroll-content {</b>
<b>+┊  ┊ 3┊    margin-top: 44px;</b>
<b>+┊  ┊ 4┊  }</b>
<b>+┊  ┊ 5┊</b>
<b>+┊  ┊ 6┊  sebm-google-map {</b>
<b>+┊  ┊ 7┊    padding: 0;</b>
<b>+┊  ┊ 8┊  }</b>
<b>+┊  ┊ 9┊</b>
<b>+┊  ┊10┊  .sebm-google-map-container {</b>
<b>+┊  ┊11┊    height: 300px;</b>
<b>+┊  ┊12┊    margin-top: -15px;</b>
<b>+┊  ┊13┊  }</b>
<b>+┊  ┊14┊}</b>
</pre>

[}]: #

And we will import the component:

[{]: <helper> (diffStep 11.16)

#### [Step 11.16: Import NewLocationMessageComponent](../../../../commit/08a1b2d)
<br>
##### Changed src&#x2F;app&#x2F;app.module.ts
<pre>
<i>@@ -9,6 +9,7 @@</i>
 ┊ 9┊ 9┊import { MessagesPage } from &#x27;../pages/messages/messages&#x27;;
 ┊10┊10┊import { MessagesAttachmentsComponent } from &#x27;../pages/messages/messages-attachments&#x27;;
 ┊11┊11┊import { MessagesOptionsComponent } from &#x27;../pages/messages/messages-options&#x27;;
<b>+┊  ┊12┊import { NewLocationMessageComponent } from &#x27;../pages/messages/location-message&#x27;;</b>
 ┊12┊13┊import { ProfilePage } from &#x27;../pages/profile/profile&#x27;;
 ┊13┊14┊import { VerificationPage } from &#x27;../pages/verification/verification&#x27;;
 ┊14┊15┊import { PhoneService } from &#x27;../services/phone&#x27;;
</pre>
<pre>
<i>@@ -25,7 +26,8 @@</i>
 ┊25┊26┊    ChatsOptionsComponent,
 ┊26┊27┊    NewChatComponent,
 ┊27┊28┊    MessagesOptionsComponent,
<b>+┊  ┊29┊    MessagesAttachmentsComponent,</b>
<b>+┊  ┊30┊    NewLocationMessageComponent</b>
 ┊29┊31┊  ],
 ┊30┊32┊  imports: [
 ┊31┊33┊    IonicModule.forRoot(MyApp),
</pre>
<pre>
<i>@@ -45,7 +47,8 @@</i>
 ┊45┊47┊    ChatsOptionsComponent,
 ┊46┊48┊    NewChatComponent,
 ┊47┊49┊    MessagesOptionsComponent,
<b>+┊  ┊50┊    MessagesAttachmentsComponent,</b>
<b>+┊  ┊51┊    NewLocationMessageComponent</b>
 ┊49┊52┊  ],
 ┊50┊53┊  providers: [
 ┊51┊54┊    {provide: ErrorHandler, useClass: IonicErrorHandler},
</pre>

[}]: #

The component is ready. The only thing left to do would be revealing it. So we will add the appropriate handler in the `MessagesAttachmentsComponent`:

[{]: <helper> (diffStep 11.17)

#### [Step 11.17: Implement the sendLocation message to display the new location modal](../../../../commit/13ca5f1)
<br>
##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages-attachments.ts
<pre>
<i>@@ -1,5 +1,7 @@</i>
 ┊1┊1┊import { Component } from &#x27;@angular/core&#x27;;
 ┊2┊2┊import { AlertController, Platform, ModalController, ViewController } from &#x27;ionic-angular&#x27;;
<b>+┊ ┊3┊import { NewLocationMessageComponent } from &#x27;./location-message&#x27;;</b>
<b>+┊ ┊4┊import { MessageType } from &#x27;api/models&#x27;;</b>
 ┊3┊5┊
 ┊4┊6┊@Component({
 ┊5┊7┊  selector: &#x27;messages-attachments&#x27;,
</pre>
<pre>
<i>@@ -12,4 +14,22 @@</i>
 ┊12┊14┊    private viewCtrl: ViewController,
 ┊13┊15┊    private modelCtrl: ModalController
 ┊14┊16┊  ) {}
<b>+┊  ┊17┊</b>
<b>+┊  ┊18┊  sendLocation(): void {</b>
<b>+┊  ┊19┊    const locationModal &#x3D; this.modelCtrl.create(NewLocationMessageComponent);</b>
<b>+┊  ┊20┊    locationModal.onDidDismiss((location) &#x3D;&gt; {</b>
<b>+┊  ┊21┊      if (!location) {</b>
<b>+┊  ┊22┊        this.viewCtrl.dismiss();</b>
<b>+┊  ┊23┊</b>
<b>+┊  ┊24┊        return;</b>
<b>+┊  ┊25┊      }</b>
<b>+┊  ┊26┊</b>
<b>+┊  ┊27┊      this.viewCtrl.dismiss({</b>
<b>+┊  ┊28┊        messageType: MessageType.LOCATION,</b>
<b>+┊  ┊29┊        selectedLocation: location</b>
<b>+┊  ┊30┊      });</b>
<b>+┊  ┊31┊    });</b>
<b>+┊  ┊32┊</b>
<b>+┊  ┊33┊    locationModal.present();</b>
<b>+┊  ┊34┊  }</b>
 ┊15┊35┊}
</pre>

[}]: #

And we will bind it to its view:

[{]: <helper> (diffStep 11.18)

#### [Step 11.18: Bind click event to sendLocation](../../../../commit/b4fc6b0)
<br>
##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages-attachments.html
<pre>
<i>@@ -10,7 +10,7 @@</i>
 ┊10┊10┊      &lt;div class&#x3D;&quot;attachment-name&quot;&gt;Camera&lt;/div&gt;
 ┊11┊11┊    &lt;/button&gt;
 ┊12┊12┊
<b>+┊  ┊13┊    &lt;button ion-item class&#x3D;&quot;attachment attachment-location&quot; (click)&#x3D;&quot;sendLocation()&quot;&gt;</b>
 ┊14┊14┊      &lt;ion-icon name&#x3D;&quot;locate&quot; class&#x3D;&quot;attachment-icon&quot;&gt;&lt;/ion-icon&gt;
 ┊15┊15┊      &lt;div class&#x3D;&quot;attachment-name&quot;&gt;Location&lt;/div&gt;
 ┊16┊16┊    &lt;/button&gt;
</pre>

[}]: #

Now we will implement a new method in the `MessagesPage`, called `sendLocationMessage`, which will create a string representation of the current geo-location and send it to the server:

[{]: <helper> (diffStep 11.19)

#### [Step 11.19: Implement send location message](../../../../commit/e949dfe)
<br>
##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.ts
<pre>
<i>@@ -1,6 +1,6 @@</i>
 ┊1┊1┊import { Component, OnInit, OnDestroy, ElementRef } from &#x27;@angular/core&#x27;;
 ┊2┊2┊import { NavParams, PopoverController } from &#x27;ionic-angular&#x27;;
<b>+┊ ┊3┊import { Chat, Message, MessageType, Location } from &#x27;api/models&#x27;;</b>
 ┊4┊4┊import { Messages } from &#x27;api/collections&#x27;;
 ┊5┊5┊import { MeteorObservable } from &#x27;meteor-rxjs&#x27;;
 ┊6┊6┊import * as moment from &#x27;moment&#x27;;
</pre>
<pre>
<i>@@ -213,6 +213,16 @@</i>
 ┊213┊213┊    });
 ┊214┊214┊  }
 ┊215┊215┊
<b>+┊   ┊216┊  sendLocationMessage(location: Location): void {</b>
<b>+┊   ┊217┊    MeteorObservable.call(&#x27;addMessage&#x27;, MessageType.LOCATION,</b>
<b>+┊   ┊218┊      this.selectedChat._id,</b>
<b>+┊   ┊219┊      &#x60;${location.lat},${location.lng},${location.zoom}&#x60;</b>
<b>+┊   ┊220┊    ).zone().subscribe(() &#x3D;&gt; {</b>
<b>+┊   ┊221┊      // Zero the input field</b>
<b>+┊   ┊222┊      this.message &#x3D; &#x27;&#x27;;</b>
<b>+┊   ┊223┊    });</b>
<b>+┊   ┊224┊  }</b>
<b>+┊   ┊225┊</b>
 ┊216┊226┊  showAttachments(): void {
 ┊217┊227┊    const popover &#x3D; this.popoverCtrl.create(MessagesAttachmentsComponent, {
 ┊218┊228┊      chat: this.selectedChat
</pre>
<pre>
<i>@@ -221,7 +231,12 @@</i>
 ┊221┊231┊    });
 ┊222┊232┊
 ┊223┊233┊    popover.onDidDismiss((params) &#x3D;&gt; {
<b>+┊   ┊234┊      if (params) {</b>
<b>+┊   ┊235┊        if (params.messageType &#x3D;&#x3D;&#x3D; MessageType.LOCATION) {</b>
<b>+┊   ┊236┊          const location &#x3D; params.selectedLocation;</b>
<b>+┊   ┊237┊          this.sendLocationMessage(location);</b>
<b>+┊   ┊238┊        }</b>
<b>+┊   ┊239┊      }</b>
 ┊225┊240┊    });
 ┊226┊241┊
 ┊227┊242┊    popover.present();
</pre>

[}]: #

This requires us to update the `addMessage` method in the server so it can support location typed messages:

[{]: <helper> (diffStep 11.2)

#### [Step 11.2: Add angular 2 google maps package](../../../../commit/d041967)
<br>
##### Changed package.json
<pre>
<i>@@ -22,6 +22,7 @@</i>
 ┊22┊22┊    &quot;@angular/platform-browser-dynamic&quot;: &quot;2.2.1&quot;,
 ┊23┊23┊    &quot;@angular/platform-server&quot;: &quot;2.2.1&quot;,
 ┊24┊24┊    &quot;@ionic/storage&quot;: &quot;1.1.7&quot;,
<b>+┊  ┊25┊    &quot;angular2-google-maps&quot;: &quot;^0.17.0&quot;,</b>
 ┊25┊26┊    &quot;angular2-moment&quot;: &quot;^1.1.0&quot;,
 ┊26┊27┊    &quot;babel-runtime&quot;: &quot;^6.22.0&quot;,
 ┊27┊28┊    &quot;ionic-angular&quot;: &quot;2.0.0-rc.5&quot;,
</pre>

[}]: #

## Viewing Location Messages

The infrastructure is ready, but we can't yet see the message, therefore, we will need to add support for location messages in the `MessagesPage` view:

[{]: <helper> (diffStep 11.21)

#### [Step 11.21: Implement location message view](../../../../commit/9ab45d9)
<br>
##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.html
<pre>
<i>@@ -19,6 +19,12 @@</i>
 ┊19┊19┊      &lt;div *ngFor&#x3D;&quot;let message of day.messages&quot; class&#x3D;&quot;message-wrapper&quot;&gt;
 ┊20┊20┊        &lt;div [class]&#x3D;&quot;&#x27;message message-&#x27; + message.ownership&quot;&gt;
 ┊21┊21┊          &lt;div *ngIf&#x3D;&quot;message.type &#x3D;&#x3D; &#x27;text&#x27;&quot; class&#x3D;&quot;message-content message-content-text&quot;&gt;{{message.content}}&lt;/div&gt;
<b>+┊  ┊22┊          &lt;div *ngIf&#x3D;&quot;message.type &#x3D;&#x3D; &#x27;location&#x27;&quot; class&#x3D;&quot;message-content message-content-text&quot;&gt;</b>
<b>+┊  ┊23┊            &lt;sebm-google-map [zoom]&#x3D;&quot;getLocation(message.content).zoom&quot; [latitude]&#x3D;&quot;getLocation(message.content).lat&quot; [longitude]&#x3D;&quot;getLocation(message.content).lng&quot;&gt;</b>
<b>+┊  ┊24┊              &lt;sebm-google-map-marker [latitude]&#x3D;&quot;getLocation(message.content).lat&quot; [longitude]&#x3D;&quot;getLocation(message.content).lng&quot;&gt;&lt;/sebm-google-map-marker&gt;</b>
<b>+┊  ┊25┊            &lt;/sebm-google-map&gt;</b>
<b>+┊  ┊26┊          &lt;/div&gt;</b>
<b>+┊  ┊27┊</b>
 ┊22┊28┊          &lt;span class&#x3D;&quot;message-timestamp&quot;&gt;{{ message.createdAt | amDateFormat: &#x27;HH:mm&#x27; }}&lt;/span&gt;
 ┊23┊29┊        &lt;/div&gt;
 ┊24┊30┊      &lt;/div&gt;
</pre>

[}]: #

These additions looks pretty similar to the `LocationMessage` since they are based on the same core components.

We will now add a method which can parse a string representation of the location into an actual `JSON`:

[{]: <helper> (diffStep 11.22)

#### [Step 11.22: Implement getLocation for parsing the location](../../../../commit/868a4e3)
<br>
##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.ts
<pre>
<i>@@ -241,4 +241,14 @@</i>
 ┊241┊241┊
 ┊242┊242┊    popover.present();
 ┊243┊243┊  }
<b>+┊   ┊244┊</b>
<b>+┊   ┊245┊  getLocation(locationString: string): Location {</b>
<b>+┊   ┊246┊    const splitted &#x3D; locationString.split(&#x27;,&#x27;).map(Number);</b>
<b>+┊   ┊247┊</b>
<b>+┊   ┊248┊    return &lt;Location&gt;{</b>
<b>+┊   ┊249┊      lat: splitted[0],</b>
<b>+┊   ┊250┊      lng: splitted[1],</b>
<b>+┊   ┊251┊      zoom: Math.min(splitted[2] || 0, 19)</b>
<b>+┊   ┊252┊    };</b>
<b>+┊   ┊253┊  }</b>
 ┊244┊254┊}
</pre>

[}]: #

And we will make some final adjustments for the view so the map can be presented properly:

[{]: <helper> (diffStep 11.23)

#### [Step 11.23: Added map styles](../../../../commit/6ca4167)
<br>
##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.scss
<pre>
<i>@@ -93,6 +93,11 @@</i>
 ┊ 93┊ 93┊        content: &quot; \00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0&quot;;
 ┊ 94┊ 94┊        display: inline;
 ┊ 95┊ 95┊      }
<b>+┊   ┊ 96┊</b>
<b>+┊   ┊ 97┊      .sebm-google-map-container {</b>
<b>+┊   ┊ 98┊        height: 25vh;</b>
<b>+┊   ┊ 99┊        width: 35vh;</b>
<b>+┊   ┊100┊      }</b>
 ┊ 96┊101┊    }
 ┊ 97┊102┊
 ┊ 98┊103┊    .message-timestamp {
</pre>

[}]: #

[{]: <helper> (navStep nextRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/file-upload" prevRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/filter-and-pagination")

⟸ <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/filter-and-pagination">PREVIOUS STEP</a> <b>║</b> <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/file-upload">NEXT STEP</a> ⟹

[}]: #

