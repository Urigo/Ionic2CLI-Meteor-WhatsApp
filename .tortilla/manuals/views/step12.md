# Step 12: Google Maps &amp; Geolocation

In this step we will add the ability to send the current location in [Google Maps](https://www.google.com/maps/).

## Geo Location

To get the devices location (aka `geo-location`) we will install a `Cordova` plug-in called `cordova-plugin-geolocation`:

    $ ionic cordova plugin add cordova-plugin-geolocation --save
    $ npm install --save @ionic-native/geolocation

> If you use `Chromium` you may get the following error: `Network location provider at 'https://www.googleapis.com/' : Returned error code 403.`
> Since chromium 23, some features were slowly moved to require Google API keys in order to function. In a precompiled version of chrome or chromium nightly or canary, everything seems to work, because these builds use default keys. But if we build chromium by ourselves, it won't have any keys and functions like Google Maps Geolocation API, Sync API, etc. won't function properly.
> See also [issue 179686](https://bugs.chromium.org/p/chromium/issues/detail?id=179686).

## Angular 2 Google Maps

Since the location is going to be presented with `Google Maps`, we will install a package which will help up interact with it in `Angular 2`:

    $ npm install --save @agm/core

Before you import the installed package to the app's `NgModule` be sure to generate an API key. An API key is a code passed in by computer programs calling an API to identify the calling program, its developer, or its user to the Web site. To generate an API key go to [Google Maps API documentation page](https://developers.google.com/maps/documentation/javascript/get-api-key) and follow the instructions. **Each app should have it's own API key**, as for now we can just use an API key we generated for the sake of this tutorial, but once you are ready for production, **replace the API key in the script below**:

[{]: <helper> (diffStep "12.3")

#### [Step 12.3: Import google maps module](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/3a13fb1f)

##### Changed src&#x2F;app&#x2F;app.module.ts
```diff
@@ -3,6 +3,7 @@
 ┊3┊3┊import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
 ┊4┊4┊import { SplashScreen } from '@ionic-native/splash-screen';
 ┊5┊5┊import { StatusBar } from '@ionic-native/status-bar';
+┊ ┊6┊import { AgmCoreModule } from '@agm/core';
 ┊6┊7┊import { MomentModule } from 'angular2-moment';
 ┊7┊8┊import { ChatsPage } from '../pages/chats/chats';
 ┊8┊9┊import { NewChatComponent } from '../pages/chats/new-chat';
```
```diff
@@ -30,7 +31,10 @@
 ┊30┊31┊  imports: [
 ┊31┊32┊    BrowserModule,
 ┊32┊33┊    IonicModule.forRoot(MyApp),
-┊33┊  ┊    MomentModule
+┊  ┊34┊    MomentModule,
+┊  ┊35┊    AgmCoreModule.forRoot({
+┊  ┊36┊      apiKey: 'AIzaSyAWoBdZHCNh5R-hB5S5ZZ2oeoYyfdDgniA'
+┊  ┊37┊    })
 ┊34┊38┊  ],
 ┊35┊39┊  bootstrap: [IonicApp],
 ┊36┊40┊  entryComponents: [
```

[}]: #

## Attachments Menu

Before we proceed any further, we will add a new message type to our schema, so we can differentiate between a text message and a location message:

[{]: <helper> (diffStep "12.4")

#### [Step 12.4: Added location message type](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/a94d788e)

##### Changed api&#x2F;server&#x2F;models.ts
```diff
@@ -6,7 +6,8 @@
 ┊ 6┊ 6┊}
 ┊ 7┊ 7┊
 ┊ 8┊ 8┊export enum MessageType {
-┊ 9┊  ┊  TEXT = <any>'text'
+┊  ┊ 9┊  TEXT = <any>'text',
+┊  ┊10┊  LOCATION = <any>'location'
 ┊10┊11┊}
 ┊11┊12┊
 ┊12┊13┊export interface Chat {
```

[}]: #

We want the user to be able to send a location message through an attachments menu in the `MessagesPage`, so let's implement the initial `MessagesAttachmentsComponent`, and as we go through, we will start filling it up:

[{]: <helper> (diffStep "12.5")

#### [Step 12.5: Added stub for messages attachment menu](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/1d1505e9)

##### Added src&#x2F;pages&#x2F;messages&#x2F;messages-attachments.ts
```diff
@@ -0,0 +1,13 @@
+┊  ┊ 1┊import { Component } from '@angular/core';
+┊  ┊ 2┊import { ModalController, ViewController } from 'ionic-angular';
+┊  ┊ 3┊
+┊  ┊ 4┊@Component({
+┊  ┊ 5┊  selector: 'messages-attachments',
+┊  ┊ 6┊  templateUrl: 'messages-attachments.html'
+┊  ┊ 7┊})
+┊  ┊ 8┊export class MessagesAttachmentsComponent {
+┊  ┊ 9┊  constructor(
+┊  ┊10┊    private viewCtrl: ViewController,
+┊  ┊11┊    private modelCtrl: ModalController
+┊  ┊12┊  ) {}
+┊  ┊13┊}
```

[}]: #

[{]: <helper> (diffStep "12.6")

#### [Step 12.6: Added messages attachment menu template](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/17531daa)

##### Added src&#x2F;pages&#x2F;messages&#x2F;messages-attachments.html
```diff
@@ -0,0 +1,18 @@
+┊  ┊ 1┊<ion-content class="messages-attachments-page-content">
+┊  ┊ 2┊  <ion-list class="attachments">
+┊  ┊ 3┊    <button ion-item class="attachment attachment-gallery">
+┊  ┊ 4┊      <ion-icon name="images" class="attachment-icon"></ion-icon>
+┊  ┊ 5┊      <div class="attachment-name">Gallery</div>
+┊  ┊ 6┊    </button>
+┊  ┊ 7┊
+┊  ┊ 8┊    <button ion-item class="attachment attachment-camera">
+┊  ┊ 9┊      <ion-icon name="camera" class="attachment-icon"></ion-icon>
+┊  ┊10┊      <div class="attachment-name">Camera</div>
+┊  ┊11┊    </button>
+┊  ┊12┊
+┊  ┊13┊    <button ion-item class="attachment attachment-location">
+┊  ┊14┊      <ion-icon name="locate" class="attachment-icon"></ion-icon>
+┊  ┊15┊      <div class="attachment-name">Location</div>
+┊  ┊16┊    </button>
+┊  ┊17┊  </ion-list>
+┊  ┊18┊</ion-content>
```

[}]: #

[{]: <helper> (diffStep "12.7")

#### [Step 12.7: Added styles for messages attachment](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/b7705037)

##### Added src&#x2F;pages&#x2F;messages&#x2F;messages-attachments.scss
```diff
@@ -0,0 +1,46 @@
+┊  ┊ 1┊.messages-attachments-page-content {
+┊  ┊ 2┊  $icon-background-size: 60px;
+┊  ┊ 3┊  $icon-font-size: 20pt;
+┊  ┊ 4┊
+┊  ┊ 5┊  .attachments {
+┊  ┊ 6┊    width: 100%;
+┊  ┊ 7┊    margin: 0;
+┊  ┊ 8┊    display: inline-flex;
+┊  ┊ 9┊  }
+┊  ┊10┊
+┊  ┊11┊  .attachment {
+┊  ┊12┊    text-align: center;
+┊  ┊13┊    margin: 0;
+┊  ┊14┊    padding: 0;
+┊  ┊15┊
+┊  ┊16┊    .item-inner {
+┊  ┊17┊      padding: 0
+┊  ┊18┊    }
+┊  ┊19┊
+┊  ┊20┊    .attachment-icon {
+┊  ┊21┊      width: $icon-background-size;
+┊  ┊22┊      height: $icon-background-size;
+┊  ┊23┊      line-height: $icon-background-size;
+┊  ┊24┊      font-size: $icon-font-size;
+┊  ┊25┊      border-radius: 50%;
+┊  ┊26┊      color: white;
+┊  ┊27┊      margin-bottom: 10px
+┊  ┊28┊    }
+┊  ┊29┊
+┊  ┊30┊    .attachment-name {
+┊  ┊31┊      color: gray;
+┊  ┊32┊    }
+┊  ┊33┊  }
+┊  ┊34┊
+┊  ┊35┊  .attachment-gallery .attachment-icon {
+┊  ┊36┊    background: linear-gradient(#e13838 50%, #f53d3d 50%);
+┊  ┊37┊  }
+┊  ┊38┊
+┊  ┊39┊  .attachment-camera .attachment-icon {
+┊  ┊40┊    background: linear-gradient(#3474e1 50%, #387ef5 50%);
+┊  ┊41┊  }
+┊  ┊42┊
+┊  ┊43┊  .attachment-location .attachment-icon {
+┊  ┊44┊    background: linear-gradient(#2ec95c 50%, #32db64 50%);
+┊  ┊45┊  }
+┊  ┊46┊}
```

[}]: #

[{]: <helper> (diffStep "12.8")

#### [Step 12.8: Import MessagesAttachmentsComponent](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/8c55e1fe)

##### Changed src&#x2F;app&#x2F;app.module.ts
```diff
@@ -10,6 +10,7 @@
 ┊10┊10┊import { ChatsOptionsComponent } from '../pages/chats/chats-options';
 ┊11┊11┊import { LoginPage } from '../pages/login/login';
 ┊12┊12┊import { MessagesPage } from '../pages/messages/messages';
+┊  ┊13┊import { MessagesAttachmentsComponent } from '../pages/messages/messages-attachments';
 ┊13┊14┊import { MessagesOptionsComponent } from '../pages/messages/messages-options';
 ┊14┊15┊import { ProfilePage } from '../pages/profile/profile';
 ┊15┊16┊import { VerificationPage } from '../pages/verification/verification';
```
```diff
@@ -26,7 +27,8 @@
 ┊26┊27┊    ProfilePage,
 ┊27┊28┊    ChatsOptionsComponent,
 ┊28┊29┊    NewChatComponent,
-┊29┊  ┊    MessagesOptionsComponent
+┊  ┊30┊    MessagesOptionsComponent,
+┊  ┊31┊    MessagesAttachmentsComponent
 ┊30┊32┊  ],
 ┊31┊33┊  imports: [
 ┊32┊34┊    BrowserModule,
```
```diff
@@ -46,7 +48,8 @@
 ┊46┊48┊    ProfilePage,
 ┊47┊49┊    ChatsOptionsComponent,
 ┊48┊50┊    NewChatComponent,
-┊49┊  ┊    MessagesOptionsComponent
+┊  ┊51┊    MessagesOptionsComponent,
+┊  ┊52┊    MessagesAttachmentsComponent
 ┊50┊53┊  ],
 ┊51┊54┊  providers: [
 ┊52┊55┊    StatusBar,
```

[}]: #

We will add a generic style-sheet for the attachments menu since it can also use us in the future:

[{]: <helper> (diffStep "12.9")

#### [Step 12.9: Added styles for the popover container](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/7f3694f0)

##### Changed src&#x2F;app&#x2F;app.scss
```diff
@@ -27,3 +27,15 @@
 ┊27┊27┊  left: calc(100% - #{$options-popover-width} - #{$options-popover-margin}) !important;
 ┊28┊28┊  top: $options-popover-margin !important;
 ┊29┊29┊}
+┊  ┊30┊
+┊  ┊31┊// Attachments Popover Component
+┊  ┊32┊// --------------------------------------------------
+┊  ┊33┊
+┊  ┊34┊$attachments-popover-width: 100%;
+┊  ┊35┊
+┊  ┊36┊.attachments-popover .popover-content {
+┊  ┊37┊  width: $attachments-popover-width;
+┊  ┊38┊  transform-origin: 300px 30px !important;
+┊  ┊39┊  left: calc(100% - #{$attachments-popover-width}) !important;
+┊  ┊40┊  top: 58px !important;
+┊  ┊41┊}
```

[}]: #

Now we will add a handler in the `MessagesPage` which will open the newly created menu, and we will bind it to the view:

[{]: <helper> (diffStep "12.10")

#### [Step 12.10: Add showAttachments method](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/3194ac2e)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.ts
```diff
@@ -7,6 +7,7 @@
 ┊ 7┊ 7┊import * as _ from 'lodash';
 ┊ 8┊ 8┊import { MessagesOptionsComponent } from './messages-options';
 ┊ 9┊ 9┊import { Subscription, Observable, Subscriber } from 'rxjs';
+┊  ┊10┊import { MessagesAttachmentsComponent } from './messages-attachments';
 ┊10┊11┊
 ┊11┊12┊@Component({
 ┊12┊13┊  selector: 'messages-page',
```
```diff
@@ -211,4 +212,18 @@
 ┊211┊212┊      this.message = '';
 ┊212┊213┊    });
 ┊213┊214┊  }
+┊   ┊215┊
+┊   ┊216┊  showAttachments(): void {
+┊   ┊217┊    const popover = this.popoverCtrl.create(MessagesAttachmentsComponent, {
+┊   ┊218┊      chat: this.selectedChat
+┊   ┊219┊    }, {
+┊   ┊220┊      cssClass: 'attachments-popover'
+┊   ┊221┊    });
+┊   ┊222┊
+┊   ┊223┊    popover.onDidDismiss((params) => {
+┊   ┊224┊      // TODO: Handle result
+┊   ┊225┊    });
+┊   ┊226┊
+┊   ┊227┊    popover.present();
+┊   ┊228┊  }
 ┊214┊229┊}
```

[}]: #

[{]: <helper> (diffStep "12.11")

#### [Step 12.11: Bind click event to showAttachments](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/967e0b24)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.html
```diff
@@ -7,7 +7,7 @@
 ┊ 7┊ 7┊    <ion-title class="chat-title">{{title}}</ion-title>
 ┊ 8┊ 8┊
 ┊ 9┊ 9┊    <ion-buttons end>
-┊10┊  ┊      <button ion-button icon-only class="attach-button"><ion-icon name="attach"></ion-icon></button>
+┊  ┊10┊      <button ion-button icon-only class="attach-button" (click)="showAttachments()"><ion-icon name="attach"></ion-icon></button>
 ┊11┊11┊      <button ion-button icon-only class="options-button" (click)="showOptions()"><ion-icon name="more"></ion-icon></button>
 ┊12┊12┊    </ion-buttons>
 ┊13┊13┊  </ion-navbar>
```

[}]: #

## Sending Location

A location is a composition of longitude, latitude and an altitude, or in short: `long, lat, alt`. Let's define a new `Location` model which will represent the mentioned schema:

[{]: <helper> (diffStep "12.12")

#### [Step 12.12: Added location model](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/88b5fb0b)

##### Changed api&#x2F;server&#x2F;models.ts
```diff
@@ -31,3 +31,9 @@
 ┊31┊31┊export interface User extends Meteor.User {
 ┊32┊32┊  profile?: Profile;
 ┊33┊33┊}
+┊  ┊34┊
+┊  ┊35┊export interface Location {
+┊  ┊36┊  lat: number;
+┊  ┊37┊  lng: number;
+┊  ┊38┊  zoom: number;
+┊  ┊39┊}
```

[}]: #

Up next, would be implementing the actual component which will handle geo-location sharing:

[{]: <helper> (diffStep "12.13")

#### [Step 12.13: Implement location message component](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/15f02f3b)

##### Changed src&#x2F;app&#x2F;app.module.ts
```diff
@@ -3,6 +3,7 @@
 ┊3┊3┊import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
 ┊4┊4┊import { SplashScreen } from '@ionic-native/splash-screen';
 ┊5┊5┊import { StatusBar } from '@ionic-native/status-bar';
+┊ ┊6┊import { Geolocation } from '@ionic-native/geolocation';
 ┊6┊7┊import { AgmCoreModule } from '@agm/core';
 ┊7┊8┊import { MomentModule } from 'angular2-moment';
 ┊8┊9┊import { ChatsPage } from '../pages/chats/chats';
```
```diff
@@ -54,6 +55,7 @@
 ┊54┊55┊  providers: [
 ┊55┊56┊    StatusBar,
 ┊56┊57┊    SplashScreen,
+┊  ┊58┊    Geolocation,
 ┊57┊59┊    {provide: ErrorHandler, useClass: IonicErrorHandler},
 ┊58┊60┊    PhoneService
 ┊59┊61┊  ]
```

##### Added src&#x2F;pages&#x2F;messages&#x2F;location-message.ts
```diff
@@ -0,0 +1,76 @@
+┊  ┊ 1┊import { Component, OnInit, OnDestroy } from '@angular/core';
+┊  ┊ 2┊import { Platform, ViewController } from 'ionic-angular';
+┊  ┊ 3┊import { Geolocation } from '@ionic-native/geolocation';
+┊  ┊ 4┊import { Location } from 'api/models';
+┊  ┊ 5┊import { Observable, Subscription } from 'rxjs';
+┊  ┊ 6┊
+┊  ┊ 7┊const DEFAULT_ZOOM = 8;
+┊  ┊ 8┊const EQUATOR = 40075004;
+┊  ┊ 9┊const DEFAULT_LAT = 51.678418;
+┊  ┊10┊const DEFAULT_LNG = 7.809007;
+┊  ┊11┊const LOCATION_REFRESH_INTERVAL = 500;
+┊  ┊12┊
+┊  ┊13┊@Component({
+┊  ┊14┊  selector: 'location-message',
+┊  ┊15┊  templateUrl: 'location-message.html'
+┊  ┊16┊})
+┊  ┊17┊export class NewLocationMessageComponent implements OnInit, OnDestroy {
+┊  ┊18┊  lat: number = DEFAULT_LAT;
+┊  ┊19┊  lng: number = DEFAULT_LNG;
+┊  ┊20┊  zoom: number = DEFAULT_ZOOM;
+┊  ┊21┊  accuracy: number = -1;
+┊  ┊22┊  intervalObs: Subscription;
+┊  ┊23┊
+┊  ┊24┊  constructor(private platform: Platform,
+┊  ┊25┊              private viewCtrl: ViewController,
+┊  ┊26┊              private geolocation: Geolocation) {
+┊  ┊27┊  }
+┊  ┊28┊
+┊  ┊29┊  ngOnInit() {
+┊  ┊30┊    // Refresh location at a specific refresh rate
+┊  ┊31┊    this.intervalObs = this.reloadLocation()
+┊  ┊32┊      .flatMapTo(Observable
+┊  ┊33┊        .interval(LOCATION_REFRESH_INTERVAL)
+┊  ┊34┊        .timeInterval())
+┊  ┊35┊      .subscribe(() => {
+┊  ┊36┊        this.reloadLocation();
+┊  ┊37┊      });
+┊  ┊38┊  }
+┊  ┊39┊
+┊  ┊40┊  ngOnDestroy() {
+┊  ┊41┊    // Dispose subscription
+┊  ┊42┊    if (this.intervalObs) {
+┊  ┊43┊      this.intervalObs.unsubscribe();
+┊  ┊44┊    }
+┊  ┊45┊  }
+┊  ┊46┊
+┊  ┊47┊  calculateZoomByAccureacy(accuracy: number): number {
+┊  ┊48┊    // Source: http://stackoverflow.com/a/25143326
+┊  ┊49┊    const deviceHeight = this.platform.height();
+┊  ┊50┊    const deviceWidth = this.platform.width();
+┊  ┊51┊    const screenSize = Math.min(deviceWidth, deviceHeight);
+┊  ┊52┊    const requiredMpp = accuracy / screenSize;
+┊  ┊53┊
+┊  ┊54┊    return ((Math.log(EQUATOR / (256 * requiredMpp))) / Math.log(2)) + 1;
+┊  ┊55┊  }
+┊  ┊56┊
+┊  ┊57┊  reloadLocation() {
+┊  ┊58┊    return Observable.fromPromise(this.geolocation.getCurrentPosition().then((position) => {
+┊  ┊59┊      if (this.lat && this.lng) {
+┊  ┊60┊        // Update view-models to represent the current geo-location
+┊  ┊61┊        this.accuracy = position.coords.accuracy;
+┊  ┊62┊        this.lat = position.coords.latitude;
+┊  ┊63┊        this.lng = position.coords.longitude;
+┊  ┊64┊        this.zoom = this.calculateZoomByAccureacy(this.accuracy);
+┊  ┊65┊      }
+┊  ┊66┊    }));
+┊  ┊67┊  }
+┊  ┊68┊
+┊  ┊69┊  sendLocation() {
+┊  ┊70┊    this.viewCtrl.dismiss(<Location>{
+┊  ┊71┊      lat: this.lat,
+┊  ┊72┊      lng: this.lng,
+┊  ┊73┊      zoom: this.zoom
+┊  ┊74┊    });
+┊  ┊75┊  }
+┊  ┊76┊}
```

[}]: #

Basically, what this component does is refreshing the current geo-location at a specific refresh rate. Note that in order to fetch the geo-location we use `Geolocation's` API, but behind the scene it uses ``cordova-plugin-geolocation`. The `sendLocation` method dismisses the view and returns the calculated geo-location. Now let's add the component's corresponding view:

[{]: <helper> (diffStep "12.14")

#### [Step 12.14: Added location message template](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/142b54d3)

##### Added src&#x2F;pages&#x2F;messages&#x2F;location-message.html
```diff
@@ -0,0 +1,22 @@
+┊  ┊ 1┊<ion-header>
+┊  ┊ 2┊  <ion-toolbar color="whatsapp">
+┊  ┊ 3┊    <ion-title>Send Location</ion-title>
+┊  ┊ 4┊
+┊  ┊ 5┊    <ion-buttons end>
+┊  ┊ 6┊      <button ion-button class="dismiss-button" (click)="viewCtrl.dismiss()"><ion-icon name="close"></ion-icon></button>
+┊  ┊ 7┊    </ion-buttons>
+┊  ┊ 8┊  </ion-toolbar>
+┊  ┊ 9┊</ion-header>
+┊  ┊10┊
+┊  ┊11┊<ion-content class="location-message-content">
+┊  ┊12┊  <ion-list>
+┊  ┊13┊    <agm-map [latitude]="lat" [longitude]="lng" [zoom]="zoom">
+┊  ┊14┊      <agm-marker [latitude]="lat" [longitude]="lng"></agm-marker>
+┊  ┊15┊    </agm-map>
+┊  ┊16┊    <ion-item (click)="sendLocation()">
+┊  ┊17┊      <ion-icon name="compass" item-left></ion-icon>
+┊  ┊18┊      <h2>Send your current location</h2>
+┊  ┊19┊      <p *ngIf="accuracy !== -1">Accurate to {{accuracy}} meters</p>
+┊  ┊20┊    </ion-item>
+┊  ┊21┊  </ion-list>
+┊  ┊22┊</ion-content>
```

[}]: #

The `agm-map` is the component which represents the map itself, and we provide it with `lat`, `lng` and `zoom`, so the map can be focused on the current geo-location. If you'll notice, we also used the `agm-marker` component with the
same data-models, so the marker will be shown right in the center of the map.

Now we will add some `CSS` to make sure the map is visible:

[{]: <helper> (diffStep "12.15")

#### [Step 12.15: Added location message stylesheet](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/f2a93e7f)

##### Added src&#x2F;pages&#x2F;messages&#x2F;location-message.scss
```diff
@@ -0,0 +1,14 @@
+┊  ┊ 1┊.location-message-content {
+┊  ┊ 2┊  .scroll-content {
+┊  ┊ 3┊    margin-top: 44px;
+┊  ┊ 4┊  }
+┊  ┊ 5┊
+┊  ┊ 6┊  agm-map {
+┊  ┊ 7┊    padding: 0;
+┊  ┊ 8┊  }
+┊  ┊ 9┊
+┊  ┊10┊  .sebm-google-map-container {
+┊  ┊11┊    height: 300px;
+┊  ┊12┊    margin-top: -15px;
+┊  ┊13┊  }
+┊  ┊14┊}
```

[}]: #

And we will import the component:

[{]: <helper> (diffStep "12.16")

#### [Step 12.16: Import NewLocationMessageComponent](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/a292b787)

##### Changed src&#x2F;app&#x2F;app.module.ts
```diff
@@ -13,6 +13,7 @@
 ┊13┊13┊import { MessagesPage } from '../pages/messages/messages';
 ┊14┊14┊import { MessagesAttachmentsComponent } from '../pages/messages/messages-attachments';
 ┊15┊15┊import { MessagesOptionsComponent } from '../pages/messages/messages-options';
+┊  ┊16┊import { NewLocationMessageComponent } from '../pages/messages/location-message';
 ┊16┊17┊import { ProfilePage } from '../pages/profile/profile';
 ┊17┊18┊import { VerificationPage } from '../pages/verification/verification';
 ┊18┊19┊import { PhoneService } from '../services/phone';
```
```diff
@@ -29,7 +30,8 @@
 ┊29┊30┊    ChatsOptionsComponent,
 ┊30┊31┊    NewChatComponent,
 ┊31┊32┊    MessagesOptionsComponent,
-┊32┊  ┊    MessagesAttachmentsComponent
+┊  ┊33┊    MessagesAttachmentsComponent,
+┊  ┊34┊    NewLocationMessageComponent
 ┊33┊35┊  ],
 ┊34┊36┊  imports: [
 ┊35┊37┊    BrowserModule,
```
```diff
@@ -50,7 +52,8 @@
 ┊50┊52┊    ChatsOptionsComponent,
 ┊51┊53┊    NewChatComponent,
 ┊52┊54┊    MessagesOptionsComponent,
-┊53┊  ┊    MessagesAttachmentsComponent
+┊  ┊55┊    MessagesAttachmentsComponent,
+┊  ┊56┊    NewLocationMessageComponent
 ┊54┊57┊  ],
 ┊55┊58┊  providers: [
 ┊56┊59┊    StatusBar,
```

[}]: #

The component is ready. The only thing left to do would be revealing it. So we will add the appropriate handler in the `MessagesAttachmentsComponent`:

[{]: <helper> (diffStep "12.17")

#### [Step 12.17: Implement the sendLocation message to display the new location modal](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/dcb6be80)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages-attachments.ts
```diff
@@ -1,5 +1,7 @@
 ┊1┊1┊import { Component } from '@angular/core';
 ┊2┊2┊import { ModalController, ViewController } from 'ionic-angular';
+┊ ┊3┊import { NewLocationMessageComponent } from './location-message';
+┊ ┊4┊import { MessageType } from 'api/models';
 ┊3┊5┊
 ┊4┊6┊@Component({
 ┊5┊7┊  selector: 'messages-attachments',
```
```diff
@@ -10,4 +12,22 @@
 ┊10┊12┊    private viewCtrl: ViewController,
 ┊11┊13┊    private modelCtrl: ModalController
 ┊12┊14┊  ) {}
+┊  ┊15┊
+┊  ┊16┊  sendLocation(): void {
+┊  ┊17┊    const locationModal = this.modelCtrl.create(NewLocationMessageComponent);
+┊  ┊18┊    locationModal.onDidDismiss((location) => {
+┊  ┊19┊      if (!location) {
+┊  ┊20┊        this.viewCtrl.dismiss();
+┊  ┊21┊
+┊  ┊22┊        return;
+┊  ┊23┊      }
+┊  ┊24┊
+┊  ┊25┊      this.viewCtrl.dismiss({
+┊  ┊26┊        messageType: MessageType.LOCATION,
+┊  ┊27┊        selectedLocation: location
+┊  ┊28┊      });
+┊  ┊29┊    });
+┊  ┊30┊
+┊  ┊31┊    locationModal.present();
+┊  ┊32┊  }
 ┊13┊33┊}
```

[}]: #

And we will bind it to its view:

[{]: <helper> (diffStep "12.18")

#### [Step 12.18: Bind click event to sendLocation](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/c2c0d32d)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages-attachments.html
```diff
@@ -10,7 +10,7 @@
 ┊10┊10┊      <div class="attachment-name">Camera</div>
 ┊11┊11┊    </button>
 ┊12┊12┊
-┊13┊  ┊    <button ion-item class="attachment attachment-location">
+┊  ┊13┊    <button ion-item class="attachment attachment-location" (click)="sendLocation()">
 ┊14┊14┊      <ion-icon name="locate" class="attachment-icon"></ion-icon>
 ┊15┊15┊      <div class="attachment-name">Location</div>
 ┊16┊16┊    </button>
```

[}]: #

Now we will implement a new method in the `MessagesPage`, called `sendLocationMessage`, which will create a string representation of the current geo-location and send it to the server:

[{]: <helper> (diffStep "12.19")

#### [Step 12.19: Implement send location message](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/a337c835)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.ts
```diff
@@ -1,6 +1,6 @@
 ┊1┊1┊import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
 ┊2┊2┊import { NavParams, PopoverController } from 'ionic-angular';
-┊3┊ ┊import { Chat, Message, MessageType } from 'api/models';
+┊ ┊3┊import { Chat, Message, MessageType, Location } from 'api/models';
 ┊4┊4┊import { Messages } from 'api/collections';
 ┊5┊5┊import { MeteorObservable } from 'meteor-rxjs';
 ┊6┊6┊import * as moment from 'moment';
```
```diff
@@ -213,6 +213,16 @@
 ┊213┊213┊    });
 ┊214┊214┊  }
 ┊215┊215┊
+┊   ┊216┊  sendLocationMessage(location: Location): void {
+┊   ┊217┊    MeteorObservable.call('addMessage', MessageType.LOCATION,
+┊   ┊218┊      this.selectedChat._id,
+┊   ┊219┊      `${location.lat},${location.lng},${location.zoom}`
+┊   ┊220┊    ).zone().subscribe(() => {
+┊   ┊221┊      // Zero the input field
+┊   ┊222┊      this.message = '';
+┊   ┊223┊    });
+┊   ┊224┊  }
+┊   ┊225┊
 ┊216┊226┊  showAttachments(): void {
 ┊217┊227┊    const popover = this.popoverCtrl.create(MessagesAttachmentsComponent, {
 ┊218┊228┊      chat: this.selectedChat
```
```diff
@@ -221,7 +231,12 @@
 ┊221┊231┊    });
 ┊222┊232┊
 ┊223┊233┊    popover.onDidDismiss((params) => {
-┊224┊   ┊      // TODO: Handle result
+┊   ┊234┊      if (params) {
+┊   ┊235┊        if (params.messageType === MessageType.LOCATION) {
+┊   ┊236┊          const location = params.selectedLocation;
+┊   ┊237┊          this.sendLocationMessage(location);
+┊   ┊238┊        }
+┊   ┊239┊      }
 ┊225┊240┊    });
 ┊226┊241┊
 ┊227┊242┊    popover.present();
```

[}]: #

This requires us to update the `addMessage` method in the server so it can support location typed messages:

[{]: <helper> (diffStep "12.20")

#### [Step 12.20: Allow location message type on server side](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/0172a8a5)

##### Changed api&#x2F;server&#x2F;methods.ts
```diff
@@ -70,7 +70,7 @@
 ┊70┊70┊    if (!this.userId) throw new Meteor.Error('unauthorized',
 ┊71┊71┊      'User must be logged-in to create a new chat');
 ┊72┊72┊
-┊73┊  ┊    check(type, Match.OneOf(String, [ MessageType.TEXT ]));
+┊  ┊73┊    check(type, Match.OneOf(String, [ MessageType.TEXT, MessageType.LOCATION ]));
 ┊74┊74┊    check(chatId, nonEmptyString);
 ┊75┊75┊    check(content, nonEmptyString);
```

[}]: #

## Viewing Location Messages

The infrastructure is ready, but we can't yet see the message, therefore, we will need to add support for location messages in the `MessagesPage` view:

[{]: <helper> (diffStep "12.21")

#### [Step 12.21: Implement location message view](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/8d3c5e3f)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.html
```diff
@@ -19,6 +19,12 @@
 ┊19┊19┊      <div *ngFor="let message of day.messages" class="message-wrapper">
 ┊20┊20┊        <div [class]="'message message-' + message.ownership">
 ┊21┊21┊          <div *ngIf="message.type == 'text'" class="message-content message-content-text">{{message.content}}</div>
+┊  ┊22┊          <div *ngIf="message.type == 'location'" class="message-content message-content-text">
+┊  ┊23┊            <agm-map [zoom]="getLocation(message.content).zoom" [latitude]="getLocation(message.content).lat" [longitude]="getLocation(message.content).lng">
+┊  ┊24┊              <agm-marker [latitude]="getLocation(message.content).lat" [longitude]="getLocation(message.content).lng"></agm-marker>
+┊  ┊25┊            </agm-map>
+┊  ┊26┊          </div>
+┊  ┊27┊
 ┊22┊28┊          <span class="message-timestamp">{{ message.createdAt | amDateFormat: 'HH:mm' }}</span>
 ┊23┊29┊        </div>
 ┊24┊30┊      </div>
```

[}]: #

These additions looks pretty similar to the `LocationMessage` since they are based on the same core components.

We will now add a method which can parse a string representation of the location into an actual `JSON`:

[{]: <helper> (diffStep "12.22")

#### [Step 12.22: Implement getLocation for parsing the location](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/1ff2fec4)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.ts
```diff
@@ -241,4 +241,14 @@
 ┊241┊241┊
 ┊242┊242┊    popover.present();
 ┊243┊243┊  }
+┊   ┊244┊
+┊   ┊245┊  getLocation(locationString: string): Location {
+┊   ┊246┊    const splitted = locationString.split(',').map(Number);
+┊   ┊247┊
+┊   ┊248┊    return <Location>{
+┊   ┊249┊      lat: splitted[0],
+┊   ┊250┊      lng: splitted[1],
+┊   ┊251┊      zoom: Math.min(splitted[2] || 0, 19)
+┊   ┊252┊    };
+┊   ┊253┊  }
 ┊244┊254┊}
```

[}]: #

And we will make some final adjustments for the view so the map can be presented properly:

[{]: <helper> (diffStep "12.23")

#### [Step 12.23: Added map styles](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/272e10e7)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.scss
```diff
@@ -93,6 +93,11 @@
 ┊ 93┊ 93┊        content: " \00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0\00a0";
 ┊ 94┊ 94┊        display: inline;
 ┊ 95┊ 95┊      }
+┊   ┊ 96┊
+┊   ┊ 97┊      .sebm-google-map-container {
+┊   ┊ 98┊        height: 25vh;
+┊   ┊ 99┊        width: 35vh;
+┊   ┊100┊      }
 ┊ 96┊101┊    }
 ┊ 97┊102┊
 ┊ 98┊103┊    .message-timestamp {
```

[}]: #

[{]: <helper> (navStep nextRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/file-upload" prevRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/android-testing")

| [< Previous Step](https://angular-meteor.com/tutorials/whatsapp2/ionic/android-testing) | [Next Step >](https://angular-meteor.com/tutorials/whatsapp2/ionic/file-upload) |
|:--------------------------------|--------------------------------:|

[}]: #

