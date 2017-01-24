# Step 12: Google Maps &amp; Geolocation

In this step we will add the ability to send the current location in [Google Maps](https://www.google.com/maps/).

## Geo Location

To get the devices location (aka `geo-location`) we will install a `Cordova` plug-in called `cordova-plugin-geolocation`:

    $ ionic cordova plugin add cordova-plugin-geolocation --save
    $ npm install --save @ionic-native/geolocation

## Angular 2 Google Maps

Since the location is going to be presented with `Google Maps`, we will install a package which will help up interact with it in `Angular 2`:

    $ npm install --save @agm/core

Before you import the installed package to the app's `NgModule` be sure to generate an API key. An API key is a code passed in by computer programs calling an API to identify the calling program, its developer, or its user to the Web site. To generate an API key go to [Google Maps API documentation page](https://developers.google.com/maps/documentation/javascript/get-api-key) and follow the instructions. **Each app should have it's own API key**, as for now we can just use an API key we generated for the sake of this tutorial, but once you are ready for production, **replace the API key in the script below**:

[{]: <helper> (diffStep 12.3)

#### [Step 12.3: Import google maps module](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/25dd4dc)

##### Changed src&#x2F;app&#x2F;app.module.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊3┊3┊import { IonicApp, IonicErrorHandler, IonicModule } from &#x27;ionic-angular&#x27;;
 ┊4┊4┊import { SplashScreen } from &#x27;@ionic-native/splash-screen&#x27;;
 ┊5┊5┊import { StatusBar } from &#x27;@ionic-native/status-bar&#x27;;
<b>+┊ ┊6┊import { AgmCoreModule } from &#x27;@agm/core&#x27;;</b>
 ┊6┊7┊import { MomentModule } from &#x27;angular2-moment&#x27;;
 ┊7┊8┊import { ChatsPage } from &#x27;../pages/chats/chats&#x27;;
 ┊8┊9┊import { NewChatComponent } from &#x27;../pages/chats/new-chat&#x27;;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊30┊31┊  imports: [
 ┊31┊32┊    BrowserModule,
 ┊32┊33┊    IonicModule.forRoot(MyApp),
<b>+┊  ┊34┊    MomentModule,</b>
<b>+┊  ┊35┊    AgmCoreModule.forRoot({</b>
<b>+┊  ┊36┊      apiKey: &#x27;AIzaSyAWoBdZHCNh5R-hB5S5ZZ2oeoYyfdDgniA&#x27;</b>
<b>+┊  ┊37┊    })</b>
 ┊34┊38┊  ],
 ┊35┊39┊  bootstrap: [IonicApp],
 ┊36┊40┊  entryComponents: [
</pre>

[}]: #

## Attachments Menu

Before we proceed any further, we will add a new message type to our schema, so we can differentiate between a text message and a location message:

[{]: <helper> (diffStep 12.4)

#### [Step 12.4: Added location message type](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/479286a)

##### Changed api&#x2F;server&#x2F;models.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
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

[{]: <helper> (diffStep 12.5)

#### [Step 12.5: Added stub for messages attachment menu](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/e7fa24f)

##### Added src&#x2F;pages&#x2F;messages&#x2F;messages-attachments.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
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

[{]: <helper> (diffStep 12.6)

#### [Step 12.6: Added messages attachment menu template](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/0141b97)

##### Added src&#x2F;pages&#x2F;messages&#x2F;messages-attachments.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
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

[{]: <helper> (diffStep 12.7)

#### [Step 12.7: Added styles for messages attachment](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/17dfb3e)

##### Added src&#x2F;pages&#x2F;messages&#x2F;messages-attachments.scss
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
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

[{]: <helper> (diffStep 12.8)

#### [Step 12.8: Import MessagesAttachmentsComponent](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/b450c24)

##### Changed src&#x2F;app&#x2F;app.module.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊10┊10┊import { ChatsOptionsComponent } from &#x27;../pages/chats/chats-options&#x27;;
 ┊11┊11┊import { LoginPage } from &#x27;../pages/login/login&#x27;;
 ┊12┊12┊import { MessagesPage } from &#x27;../pages/messages/messages&#x27;;
<b>+┊  ┊13┊import { MessagesAttachmentsComponent } from &#x27;../pages/messages/messages-attachments&#x27;;</b>
 ┊13┊14┊import { MessagesOptionsComponent } from &#x27;../pages/messages/messages-options&#x27;;
 ┊14┊15┊import { ProfilePage } from &#x27;../pages/profile/profile&#x27;;
 ┊15┊16┊import { VerificationPage } from &#x27;../pages/verification/verification&#x27;;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊26┊27┊    ProfilePage,
 ┊27┊28┊    ChatsOptionsComponent,
 ┊28┊29┊    NewChatComponent,
<b>+┊  ┊30┊    MessagesOptionsComponent,</b>
<b>+┊  ┊31┊    MessagesAttachmentsComponent</b>
 ┊30┊32┊  ],
 ┊31┊33┊  imports: [
 ┊32┊34┊    BrowserModule,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊46┊48┊    ProfilePage,
 ┊47┊49┊    ChatsOptionsComponent,
 ┊48┊50┊    NewChatComponent,
<b>+┊  ┊51┊    MessagesOptionsComponent,</b>
<b>+┊  ┊52┊    MessagesAttachmentsComponent</b>
 ┊50┊53┊  ],
 ┊51┊54┊  providers: [
 ┊52┊55┊    StatusBar,
</pre>

[}]: #

We will add a generic style-sheet for the attachments menu since it can also use us in the future:

[{]: <helper> (diffStep 12.9)

#### [Step 12.9: Added styles for the popover container](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/53248ea)

##### Changed src&#x2F;app&#x2F;app.scss
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
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

[{]: <helper> (diffStep "12.10")

#### [Step 12.10: Add showAttachments method](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/00fb798)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 7┊ 7┊import { _ } from &#x27;meteor/underscore&#x27;;
 ┊ 8┊ 8┊import { MessagesOptionsComponent } from &#x27;./messages-options&#x27;;
 ┊ 9┊ 9┊import { Subscription, Observable, Subscriber } from &#x27;rxjs&#x27;;
<b>+┊  ┊10┊import { MessagesAttachmentsComponent } from &#x27;./messages-attachments&#x27;;</b>
 ┊10┊11┊
 ┊11┊12┊@Component({
 ┊12┊13┊  selector: &#x27;messages-page&#x27;,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊211┊212┊      this.message &#x3D; &#x27;&#x27;;
 ┊212┊213┊    });
 ┊213┊214┊  }
<b>+┊   ┊215┊</b>
<b>+┊   ┊216┊  showAttachments(): void {</b>
<b>+┊   ┊217┊    const popover &#x3D; this.popoverCtrl.create(MessagesAttachmentsComponent, {</b>
<b>+┊   ┊218┊      chat: this.selectedChat</b>
<b>+┊   ┊219┊    }, {</b>
<b>+┊   ┊220┊      cssClass: &#x27;attachments-popover&#x27;</b>
<b>+┊   ┊221┊    });</b>
<b>+┊   ┊222┊</b>
<b>+┊   ┊223┊    popover.onDidDismiss((params) &#x3D;&gt; {</b>
<b>+┊   ┊224┊      // TODO: Handle result</b>
<b>+┊   ┊225┊    });</b>
<b>+┊   ┊226┊</b>
<b>+┊   ┊227┊    popover.present();</b>
<b>+┊   ┊228┊  }</b>
 ┊214┊229┊}
</pre>

[}]: #

[{]: <helper> (diffStep 12.11)

#### [Step 12.11: Bind click event to showAttachments](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/b212ae1)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
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

[{]: <helper> (diffStep 12.12)

#### [Step 12.12: Added location model](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/4300ace)

##### Changed api&#x2F;server&#x2F;models.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
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

[{]: <helper> (diffStep 12.13)

#### [Step 12.13: Implement location message component](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/5a94696)

##### Changed src&#x2F;app&#x2F;app.module.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊3┊3┊import { IonicApp, IonicErrorHandler, IonicModule } from &#x27;ionic-angular&#x27;;
 ┊4┊4┊import { SplashScreen } from &#x27;@ionic-native/splash-screen&#x27;;
 ┊5┊5┊import { StatusBar } from &#x27;@ionic-native/status-bar&#x27;;
<b>+┊ ┊6┊import { Geolocation } from &#x27;@ionic-native/geolocation&#x27;;</b>
 ┊6┊7┊import { AgmCoreModule } from &#x27;@agm/core&#x27;;
 ┊7┊8┊import { MomentModule } from &#x27;angular2-moment&#x27;;
 ┊8┊9┊import { ChatsPage } from &#x27;../pages/chats/chats&#x27;;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊54┊55┊  providers: [
 ┊55┊56┊    StatusBar,
 ┊56┊57┊    SplashScreen,
<b>+┊  ┊58┊    Geolocation,</b>
 ┊57┊59┊    {provide: ErrorHandler, useClass: IonicErrorHandler},
 ┊58┊60┊    PhoneService
 ┊59┊61┊  ]
</pre>

##### Added src&#x2F;pages&#x2F;messages&#x2F;location-message.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { Component, OnInit, OnDestroy } from &#x27;@angular/core&#x27;;</b>
<b>+┊  ┊ 2┊import { Platform, ViewController } from &#x27;ionic-angular&#x27;;</b>
<b>+┊  ┊ 3┊import { Geolocation } from &#x27;@ionic-native/geolocation&#x27;;</b>
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
<b>+┊  ┊24┊  constructor(private platform: Platform,</b>
<b>+┊  ┊25┊              private viewCtrl: ViewController,</b>
<b>+┊  ┊26┊              private geolocation: Geolocation) {</b>
<b>+┊  ┊27┊  }</b>
<b>+┊  ┊28┊</b>
<b>+┊  ┊29┊  ngOnInit() {</b>
<b>+┊  ┊30┊    // Refresh location at a specific refresh rate</b>
<b>+┊  ┊31┊    this.intervalObs &#x3D; this.reloadLocation()</b>
<b>+┊  ┊32┊      .flatMapTo(Observable</b>
<b>+┊  ┊33┊        .interval(LOCATION_REFRESH_INTERVAL)</b>
<b>+┊  ┊34┊        .timeInterval())</b>
<b>+┊  ┊35┊      .subscribe(() &#x3D;&gt; {</b>
<b>+┊  ┊36┊        this.reloadLocation();</b>
<b>+┊  ┊37┊      });</b>
<b>+┊  ┊38┊  }</b>
<b>+┊  ┊39┊</b>
<b>+┊  ┊40┊  ngOnDestroy() {</b>
<b>+┊  ┊41┊    // Dispose subscription</b>
<b>+┊  ┊42┊    if (this.intervalObs) {</b>
<b>+┊  ┊43┊      this.intervalObs.unsubscribe();</b>
<b>+┊  ┊44┊    }</b>
<b>+┊  ┊45┊  }</b>
<b>+┊  ┊46┊</b>
<b>+┊  ┊47┊  calculateZoomByAccureacy(accuracy: number): number {</b>
<b>+┊  ┊48┊    // Source: http://stackoverflow.com/a/25143326</b>
<b>+┊  ┊49┊    const deviceHeight &#x3D; this.platform.height();</b>
<b>+┊  ┊50┊    const deviceWidth &#x3D; this.platform.width();</b>
<b>+┊  ┊51┊    const screenSize &#x3D; Math.min(deviceWidth, deviceHeight);</b>
<b>+┊  ┊52┊    const requiredMpp &#x3D; accuracy / screenSize;</b>
<b>+┊  ┊53┊</b>
<b>+┊  ┊54┊    return ((Math.log(EQUATOR / (256 * requiredMpp))) / Math.log(2)) + 1;</b>
<b>+┊  ┊55┊  }</b>
<b>+┊  ┊56┊</b>
<b>+┊  ┊57┊  reloadLocation() {</b>
<b>+┊  ┊58┊    return Observable.fromPromise(this.geolocation.getCurrentPosition().then((position) &#x3D;&gt; {</b>
<b>+┊  ┊59┊      if (this.lat &amp;&amp; this.lng) {</b>
<b>+┊  ┊60┊        // Update view-models to represent the current geo-location</b>
<b>+┊  ┊61┊        this.accuracy &#x3D; position.coords.accuracy;</b>
<b>+┊  ┊62┊        this.lat &#x3D; position.coords.latitude;</b>
<b>+┊  ┊63┊        this.lng &#x3D; position.coords.longitude;</b>
<b>+┊  ┊64┊        this.zoom &#x3D; this.calculateZoomByAccureacy(this.accuracy);</b>
<b>+┊  ┊65┊      }</b>
<b>+┊  ┊66┊    }));</b>
<b>+┊  ┊67┊  }</b>
<b>+┊  ┊68┊</b>
<b>+┊  ┊69┊  sendLocation() {</b>
<b>+┊  ┊70┊    this.viewCtrl.dismiss(&lt;Location&gt;{</b>
<b>+┊  ┊71┊      lat: this.lat,</b>
<b>+┊  ┊72┊      lng: this.lng,</b>
<b>+┊  ┊73┊      zoom: this.zoom</b>
<b>+┊  ┊74┊    });</b>
<b>+┊  ┊75┊  }</b>
<b>+┊  ┊76┊}</b>
</pre>

[}]: #

Basically, what this component does is refreshing the current geo-location at a specific refresh rate. Note that in order to fetch the geo-location we use `Geolocation's` API, but behind the scene it uses ``cordova-plugin-geolocation`. The `sendLocation` method dismisses the view and returns the calculated geo-location. Now let's add the component's corresponding view:

[{]: <helper> (diffStep 12.14)

#### [Step 12.14: Added location message template](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/54bc227)

##### Added src&#x2F;pages&#x2F;messages&#x2F;location-message.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
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
<b>+┊  ┊13┊    &lt;agm-map [latitude]&#x3D;&quot;lat&quot; [longitude]&#x3D;&quot;lng&quot; [zoom]&#x3D;&quot;zoom&quot;&gt;</b>
<b>+┊  ┊14┊      &lt;agm-marker [latitude]&#x3D;&quot;lat&quot; [longitude]&#x3D;&quot;lng&quot;&gt;&lt;/agm-marker&gt;</b>
<b>+┊  ┊15┊    &lt;/agm-map&gt;</b>
<b>+┊  ┊16┊    &lt;ion-item (click)&#x3D;&quot;sendLocation()&quot;&gt;</b>
<b>+┊  ┊17┊      &lt;ion-icon name&#x3D;&quot;compass&quot; item-left&gt;&lt;/ion-icon&gt;</b>
<b>+┊  ┊18┊      &lt;h2&gt;Send your current location&lt;/h2&gt;</b>
<b>+┊  ┊19┊      &lt;p *ngIf&#x3D;&quot;accuracy !&#x3D;&#x3D; -1&quot;&gt;Accurate to {{accuracy}} meters&lt;/p&gt;</b>
<b>+┊  ┊20┊    &lt;/ion-item&gt;</b>
<b>+┊  ┊21┊  &lt;/ion-list&gt;</b>
<b>+┊  ┊22┊&lt;/ion-content&gt;</b>
</pre>

[}]: #

The `agm-map` is the component which represents the map itself, and we provide it with `lat`, `lng` and `zoom`, so the map can be focused on the current geo-location. If you'll notice, we also used the `agm-marker` component with the 
same data-models, so the marker will be shown right in the center of the map.

Now we will add some `CSS` to make sure the map is visible:

[{]: <helper> (diffStep 12.15)

#### [Step 12.15: Added location message stylesheet](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/8bb2d51)

##### Added src&#x2F;pages&#x2F;messages&#x2F;location-message.scss
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊.location-message-content {</b>
<b>+┊  ┊ 2┊  .scroll-content {</b>
<b>+┊  ┊ 3┊    margin-top: 44px;</b>
<b>+┊  ┊ 4┊  }</b>
<b>+┊  ┊ 5┊</b>
<b>+┊  ┊ 6┊  agm-map {</b>
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

[{]: <helper> (diffStep 12.16)

#### [Step 12.16: Import NewLocationMessageComponent](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/c1c3133)

##### Changed src&#x2F;app&#x2F;app.module.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊13┊13┊import { MessagesPage } from &#x27;../pages/messages/messages&#x27;;
 ┊14┊14┊import { MessagesAttachmentsComponent } from &#x27;../pages/messages/messages-attachments&#x27;;
 ┊15┊15┊import { MessagesOptionsComponent } from &#x27;../pages/messages/messages-options&#x27;;
<b>+┊  ┊16┊import { NewLocationMessageComponent } from &#x27;../pages/messages/location-message&#x27;;</b>
 ┊16┊17┊import { ProfilePage } from &#x27;../pages/profile/profile&#x27;;
 ┊17┊18┊import { VerificationPage } from &#x27;../pages/verification/verification&#x27;;
 ┊18┊19┊import { PhoneService } from &#x27;../services/phone&#x27;;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊29┊30┊    ChatsOptionsComponent,
 ┊30┊31┊    NewChatComponent,
 ┊31┊32┊    MessagesOptionsComponent,
<b>+┊  ┊33┊    MessagesAttachmentsComponent,</b>
<b>+┊  ┊34┊    NewLocationMessageComponent</b>
 ┊33┊35┊  ],
 ┊34┊36┊  imports: [
 ┊35┊37┊    BrowserModule,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊50┊52┊    ChatsOptionsComponent,
 ┊51┊53┊    NewChatComponent,
 ┊52┊54┊    MessagesOptionsComponent,
<b>+┊  ┊55┊    MessagesAttachmentsComponent,</b>
<b>+┊  ┊56┊    NewLocationMessageComponent</b>
 ┊54┊57┊  ],
 ┊55┊58┊  providers: [
 ┊56┊59┊    StatusBar,
</pre>

[}]: #

The component is ready. The only thing left to do would be revealing it. So we will add the appropriate handler in the `MessagesAttachmentsComponent`:

[{]: <helper> (diffStep 12.17)

#### [Step 12.17: Implement the sendLocation message to display the new location modal](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/4d4c167)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages-attachments.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊import { Component } from &#x27;@angular/core&#x27;;
 ┊2┊2┊import { AlertController, Platform, ModalController, ViewController } from &#x27;ionic-angular&#x27;;
<b>+┊ ┊3┊import { NewLocationMessageComponent } from &#x27;./location-message&#x27;;</b>
<b>+┊ ┊4┊import { MessageType } from &#x27;api/models&#x27;;</b>
 ┊3┊5┊
 ┊4┊6┊@Component({
 ┊5┊7┊  selector: &#x27;messages-attachments&#x27;,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
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

[{]: <helper> (diffStep 12.18)

#### [Step 12.18: Bind click event to sendLocation](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/55a3aea)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages-attachments.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
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

[{]: <helper> (diffStep 12.19)

#### [Step 12.19: Implement send location message](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/d03b612)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊import { Component, OnInit, OnDestroy, ElementRef } from &#x27;@angular/core&#x27;;
 ┊2┊2┊import { NavParams, PopoverController } from &#x27;ionic-angular&#x27;;
<b>+┊ ┊3┊import { Chat, Message, MessageType, Location } from &#x27;api/models&#x27;;</b>
 ┊4┊4┊import { Messages } from &#x27;api/collections&#x27;;
 ┊5┊5┊import { MeteorObservable } from &#x27;meteor-rxjs&#x27;;
 ┊6┊6┊import * as moment from &#x27;moment&#x27;;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
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
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
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

[{]: <helper> (diffStep "12.20")

#### [Step 12.20: Allow location message type on server side](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/9cce041)

##### Changed api&#x2F;server&#x2F;methods.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊70┊70┊    if (!this.userId) throw new Meteor.Error(&#x27;unauthorized&#x27;,
 ┊71┊71┊      &#x27;User must be logged-in to create a new chat&#x27;);
 ┊72┊72┊
<b>+┊  ┊73┊    check(type, Match.OneOf(String, [ MessageType.TEXT, MessageType.LOCATION ]));</b>
 ┊74┊74┊    check(chatId, nonEmptyString);
 ┊75┊75┊    check(content, nonEmptyString);
</pre>

[}]: #

## Viewing Location Messages

The infrastructure is ready, but we can't yet see the message, therefore, we will need to add support for location messages in the `MessagesPage` view:

[{]: <helper> (diffStep 12.21)

#### [Step 12.21: Implement location message view](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/013aef5)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊19┊19┊      &lt;div *ngFor&#x3D;&quot;let message of day.messages&quot; class&#x3D;&quot;message-wrapper&quot;&gt;
 ┊20┊20┊        &lt;div [class]&#x3D;&quot;&#x27;message message-&#x27; + message.ownership&quot;&gt;
 ┊21┊21┊          &lt;div *ngIf&#x3D;&quot;message.type &#x3D;&#x3D; &#x27;text&#x27;&quot; class&#x3D;&quot;message-content message-content-text&quot;&gt;{{message.content}}&lt;/div&gt;
<b>+┊  ┊22┊          &lt;div *ngIf&#x3D;&quot;message.type &#x3D;&#x3D; &#x27;location&#x27;&quot; class&#x3D;&quot;message-content message-content-text&quot;&gt;</b>
<b>+┊  ┊23┊            &lt;agm-map [zoom]&#x3D;&quot;getLocation(message.content).zoom&quot; [latitude]&#x3D;&quot;getLocation(message.content).lat&quot; [longitude]&#x3D;&quot;getLocation(message.content).lng&quot;&gt;</b>
<b>+┊  ┊24┊              &lt;agm-marker [latitude]&#x3D;&quot;getLocation(message.content).lat&quot; [longitude]&#x3D;&quot;getLocation(message.content).lng&quot;&gt;&lt;/agm-marker&gt;</b>
<b>+┊  ┊25┊            &lt;/agm-map&gt;</b>
<b>+┊  ┊26┊          &lt;/div&gt;</b>
<b>+┊  ┊27┊</b>
 ┊22┊28┊          &lt;span class&#x3D;&quot;message-timestamp&quot;&gt;{{ message.createdAt | amDateFormat: &#x27;HH:mm&#x27; }}&lt;/span&gt;
 ┊23┊29┊        &lt;/div&gt;
 ┊24┊30┊      &lt;/div&gt;
</pre>

[}]: #

These additions looks pretty similar to the `LocationMessage` since they are based on the same core components.

We will now add a method which can parse a string representation of the location into an actual `JSON`:

[{]: <helper> (diffStep 12.22)

#### [Step 12.22: Implement getLocation for parsing the location](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/6042da3)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
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

[{]: <helper> (diffStep 12.23)

#### [Step 12.23: Added map styles](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/498a143)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.scss
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
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

[{]: <helper> (navStep nextRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/file-upload" prevRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/android-testing")

⟸ <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/android-testing">PREVIOUS STEP</a> <b>║</b> <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/file-upload">NEXT STEP</a> ⟹

[}]: #

