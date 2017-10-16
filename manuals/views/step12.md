[{]: <region> (header)
# Step 12: File Upload & Images
[}]: #
[{]: <region> (body)
In this step, we will be using `Ionic 2` to pick up some images from our device's gallery, and we will use them to send pictures, and to set our profile picture.

## Image Picker

First, we will a `Cordova` plug-in which will give us the ability to access the gallery:

    $ ionic plugin add cordova-plugin-image-picker

## Meteor FS

Up next, would be adding the ability to store some files in our data-base. This requires us to add 2 `Meteor` packages, called `ufs` and `ufs-gridfs` (Which adds support for `GridFS` operations. See [reference](https://docs.mongodb.com/manual/core/gridfs/)), which will take care of FS operations:

    api$ meteor add jalik:ufs
    api$ meteor add jalik:ufs-gridfs

And be sure to re-bundle the `Meteor` client whenever you make changes in the server:

    $ npm run meteor-client:bundle

## Client Side

Before we proceed to the server, we will add the ability to select and upload pictures in the client. All our picture-related operations will be defined in a single service called `PictureService`; The first bit of this service would be picture-selection. The `UploadFS` package already supports that feature, **but only for the browser**, therefore we will be using the `Cordova` plug-in we've just installed to select some pictures from our mobile device:

[{]: <helper> (diff_step 12.3)
#### Step 12.3: Create PictureService with utils for files

##### Added src/services/picture.ts
```diff
@@ -0,0 +1,80 @@
+┊  ┊ 1┊import { Injectable } from '@angular/core';
+┊  ┊ 2┊import { Platform } from 'ionic-angular';
+┊  ┊ 3┊import { ImagePicker } from 'ionic-native';
+┊  ┊ 4┊import { UploadFS } from 'meteor/jalik:ufs';
+┊  ┊ 5┊
+┊  ┊ 6┊@Injectable()
+┊  ┊ 7┊export class PictureService {
+┊  ┊ 8┊  constructor(private platform: Platform) {
+┊  ┊ 9┊  }
+┊  ┊10┊
+┊  ┊11┊  select(): Promise<Blob> {
+┊  ┊12┊    if (!this.platform.is('cordova') || !this.platform.is('mobile')) {
+┊  ┊13┊      return new Promise((resolve, reject) => {
+┊  ┊14┊        try {
+┊  ┊15┊          UploadFS.selectFile((file: File) => {
+┊  ┊16┊            resolve(file);
+┊  ┊17┊          });
+┊  ┊18┊        }
+┊  ┊19┊        catch (e) {
+┊  ┊20┊          reject(e);
+┊  ┊21┊        }
+┊  ┊22┊      });
+┊  ┊23┊    }
+┊  ┊24┊
+┊  ┊25┊    return ImagePicker.getPictures({maximumImagesCount: 1}).then((URL: string) => {
+┊  ┊26┊      return this.convertURLtoBlob(URL);
+┊  ┊27┊    });
+┊  ┊28┊  }
+┊  ┊29┊
+┊  ┊30┊  convertURLtoBlob(URL: string): Promise<Blob> {
+┊  ┊31┊    return new Promise((resolve, reject) => {
+┊  ┊32┊      const image = document.createElement('img');
+┊  ┊33┊
+┊  ┊34┊      image.onload = () => {
+┊  ┊35┊        try {
+┊  ┊36┊          const dataURI = this.convertImageToDataURI(image);
+┊  ┊37┊          const blob = this.convertDataURIToBlob(dataURI);
+┊  ┊38┊
+┊  ┊39┊          resolve(blob);
+┊  ┊40┊        }
+┊  ┊41┊        catch (e) {
+┊  ┊42┊          reject(e);
+┊  ┊43┊        }
+┊  ┊44┊      };
+┊  ┊45┊
+┊  ┊46┊      image.src = URL;
+┊  ┊47┊    });
+┊  ┊48┊  }
+┊  ┊49┊
+┊  ┊50┊  convertImageToDataURI(image: HTMLImageElement): string {
+┊  ┊51┊    // Create an empty canvas element
+┊  ┊52┊    const canvas = document.createElement('canvas');
+┊  ┊53┊    canvas.width = image.width;
+┊  ┊54┊    canvas.height = image.height;
+┊  ┊55┊
+┊  ┊56┊    // Copy the image contents to the canvas
+┊  ┊57┊    const context = canvas.getContext('2d');
+┊  ┊58┊    context.drawImage(image, 0, 0);
+┊  ┊59┊
+┊  ┊60┊    // Get the data-URL formatted image
+┊  ┊61┊    // Firefox supports PNG and JPEG. You could check image.src to
+┊  ┊62┊    // guess the original format, but be aware the using 'image/jpg'
+┊  ┊63┊    // will re-encode the image.
+┊  ┊64┊    const dataURL = canvas.toDataURL('image/png');
+┊  ┊65┊
+┊  ┊66┊    return dataURL.replace(/^data:image\/(png|jpg);base64,/, '');
+┊  ┊67┊  }
+┊  ┊68┊
+┊  ┊69┊  convertDataURIToBlob(dataURI): Blob {
+┊  ┊70┊    const binary = atob(dataURI);
+┊  ┊71┊
+┊  ┊72┊    // Write the bytes of the string to a typed array
+┊  ┊73┊    const charCodes = Object.keys(binary)
+┊  ┊74┊      .map<number>(Number)
+┊  ┊75┊      .map<number>(binary.charCodeAt.bind(binary));
+┊  ┊76┊
+┊  ┊77┊    // Build blob with typed array
+┊  ┊78┊    return new Blob([new Uint8Array(charCodes)], {type: 'image/jpeg'});
+┊  ┊79┊  }
+┊  ┊80┊}
```
[}]: #

In order to use the service we will need to import it in the app's `NgModule` as a `provider`:

[{]: <helper> (diff_step 12.4)
#### Step 12.4: Import PictureService

##### Changed src/app/app.module.ts
```diff
@@ -13,6 +13,7 @@
 ┊13┊13┊import { ProfilePage } from '../pages/profile/profile';
 ┊14┊14┊import { VerificationPage } from '../pages/verification/verification';
 ┊15┊15┊import { PhoneService } from '../services/phone';
+┊  ┊16┊import { PictureService } from '../services/picture';
 ┊16┊17┊import { MyApp } from './app.component';
 ┊17┊18┊
 ┊18┊19┊@NgModule({
```
```diff
@@ -52,7 +53,8 @@
 ┊52┊53┊  ],
 ┊53┊54┊  providers: [
 ┊54┊55┊    {provide: ErrorHandler, useClass: IonicErrorHandler},
-┊55┊  ┊    PhoneService
+┊  ┊56┊    PhoneService,
+┊  ┊57┊    PictureService
 ┊56┊58┊  ]
 ┊57┊59┊})
 ┊58┊60┊export class AppModule {}
```
[}]: #

Since now we will be sending pictures, we will need to update the message schema to support picture typed messages:

[{]: <helper> (diff_step 12.5)
#### Step 12.5: Added picture message type

##### Changed api/server/models.ts
```diff
@@ -7,7 +7,8 @@
 ┊ 7┊ 7┊
 ┊ 8┊ 8┊export enum MessageType {
 ┊ 9┊ 9┊  TEXT = <any>'text',
-┊10┊  ┊  LOCATION = <any>'location'
+┊  ┊10┊  LOCATION = <any>'location',
+┊  ┊11┊  PICTURE = <any>'picture'
 ┊11┊12┊}
 ┊12┊13┊
 ┊13┊14┊export interface Chat {
```
[}]: #

In the attachments menu, we will add a new handler for sending pictures, called `sendPicture`:

[{]: <helper> (diff_step 12.6)
#### Step 12.6: Implement sendPicture method

##### Changed src/pages/messages/messages-attachments.ts
```diff
@@ -2,6 +2,7 @@
 ┊2┊2┊import { AlertController, Platform, ModalController, ViewController } from 'ionic-angular';
 ┊3┊3┊import { NewLocationMessageComponent } from './location-message';
 ┊4┊4┊import { MessageType } from 'api/models';
+┊ ┊5┊import { PictureService } from '../../services/picture';
 ┊5┊6┊
 ┊6┊7┊@Component({
 ┊7┊8┊  selector: 'messages-attachments',
```
```diff
@@ -12,9 +13,19 @@
 ┊12┊13┊    private alertCtrl: AlertController,
 ┊13┊14┊    private platform: Platform,
 ┊14┊15┊    private viewCtrl: ViewController,
-┊15┊  ┊    private modelCtrl: ModalController
+┊  ┊16┊    private modelCtrl: ModalController,
+┊  ┊17┊    private pictureService: PictureService
 ┊16┊18┊  ) {}
 ┊17┊19┊
+┊  ┊20┊  sendPicture(): void {
+┊  ┊21┊    this.pictureService.select().then((file: File) => {
+┊  ┊22┊      this.viewCtrl.dismiss({
+┊  ┊23┊        messageType: MessageType.PICTURE,
+┊  ┊24┊        selectedPicture: file
+┊  ┊25┊      });
+┊  ┊26┊    });
+┊  ┊27┊  }
+┊  ┊28┊
 ┊18┊29┊  sendLocation(): void {
 ┊19┊30┊    const locationModal = this.modelCtrl.create(NewLocationMessageComponent);
 ┊20┊31┊    locationModal.onDidDismiss((location) => {
```
[}]: #

And we will bind that handler to the view, so whenever we press the right button, the handler will be invoked with the selected picture:

[{]: <helper> (diff_step 12.7)
#### Step 12.7: Bind click event for sendPicture

##### Changed src/pages/messages/messages-attachments.html
```diff
@@ -1,6 +1,6 @@
 ┊1┊1┊<ion-content class="messages-attachments-page-content">
 ┊2┊2┊  <ion-list class="attachments">
-┊3┊ ┊    <button ion-item class="attachment attachment-gallery">
+┊ ┊3┊    <button ion-item class="attachment attachment-gallery" (click)="sendPicture()">
 ┊4┊4┊      <ion-icon name="images" class="attachment-icon"></ion-icon>
 ┊5┊5┊      <div class="attachment-name">Gallery</div>
 ┊6┊6┊    </button>
```
[}]: #

Now we will be extending the `MessagesPage`, by adding a method which will send the picture selected in the attachments menu:

[{]: <helper> (diff_step 12.8)
#### Step 12.8: Implement the actual send of picture message

##### Changed src/pages/messages/messages.ts
```diff
@@ -8,6 +8,7 @@
 ┊ 8┊ 8┊import { MessagesOptionsComponent } from './messages-options';
 ┊ 9┊ 9┊import { Subscription, Observable, Subscriber } from 'rxjs';
 ┊10┊10┊import { MessagesAttachmentsComponent } from './messages-attachments';
+┊  ┊11┊import { PictureService } from '../../services/picture';
 ┊11┊12┊
 ┊12┊13┊@Component({
 ┊13┊14┊  selector: 'messages-page',
```
```diff
@@ -29,7 +30,8 @@
 ┊29┊30┊  constructor(
 ┊30┊31┊    navParams: NavParams,
 ┊31┊32┊    private el: ElementRef,
-┊32┊  ┊    private popoverCtrl: PopoverController
+┊  ┊33┊    private popoverCtrl: PopoverController,
+┊  ┊34┊    private pictureService: PictureService
 ┊33┊35┊  ) {
 ┊34┊36┊    this.selectedChat = <Chat>navParams.get('chat');
 ┊35┊37┊    this.title = this.selectedChat.title;
```
```diff
@@ -236,12 +238,25 @@
 ┊236┊238┊          const location = params.selectedLocation;
 ┊237┊239┊          this.sendLocationMessage(location);
 ┊238┊240┊        }
+┊   ┊241┊        else if (params.messageType === MessageType.PICTURE) {
+┊   ┊242┊          const blob: Blob = params.selectedPicture;
+┊   ┊243┊          this.sendPictureMessage(blob);
+┊   ┊244┊        }
 ┊239┊245┊      }
 ┊240┊246┊    });
 ┊241┊247┊
 ┊242┊248┊    popover.present();
 ┊243┊249┊  }
 ┊244┊250┊
+┊   ┊251┊  sendPictureMessage(blob: Blob): void {
+┊   ┊252┊    this.pictureService.upload(blob).then((picture) => {
+┊   ┊253┊      MeteorObservable.call('addMessage', MessageType.PICTURE,
+┊   ┊254┊        this.selectedChat._id,
+┊   ┊255┊        picture.url
+┊   ┊256┊      ).zone().subscribe();
+┊   ┊257┊    });
+┊   ┊258┊  }
+┊   ┊259┊
 ┊245┊260┊  getLocation(locationString: string): Location {
 ┊246┊261┊    const splitted = locationString.split(',').map(Number);
```
[}]: #

For now, we will add a stub for the `upload` method in the `PictureService` and we will get back to it once we finish implementing the necessary logic in the server for storing a picture:

[{]: <helper> (diff_step 12.9)
#### Step 12.9: Create stub method for upload method

##### Changed src/services/picture.ts
```diff
@@ -27,6 +27,10 @@
 ┊27┊27┊    });
 ┊28┊28┊  }
 ┊29┊29┊
+┊  ┊30┊  upload(blob: Blob): Promise<any> {
+┊  ┊31┊    return Promise.resolve();
+┊  ┊32┊  }
+┊  ┊33┊
 ┊30┊34┊  convertURLtoBlob(URL: string): Promise<Blob> {
 ┊31┊35┊    return new Promise((resolve, reject) => {
 ┊32┊36┊      const image = document.createElement('img');
```
[}]: #

## Server Side

So as we said, need to handle storage of pictures that were sent by the client. First, we will create a `Picture` model so the compiler can recognize a picture object:

[{]: <helper> (diff_step 12.10)
#### Step 12.10: Create Picture model

##### Changed api/server/models.ts
```diff
@@ -38,3 +38,19 @@
 ┊38┊38┊  lng: number;
 ┊39┊39┊  zoom: number;
 ┊40┊40┊}
+┊  ┊41┊
+┊  ┊42┊export interface Picture {
+┊  ┊43┊  _id?: string;
+┊  ┊44┊  complete?: boolean;
+┊  ┊45┊  extension?: string;
+┊  ┊46┊  name?: string;
+┊  ┊47┊  progress?: number;
+┊  ┊48┊  size?: number;
+┊  ┊49┊  store?: string;
+┊  ┊50┊  token?: string;
+┊  ┊51┊  type?: string;
+┊  ┊52┊  uploadedAt?: Date;
+┊  ┊53┊  uploading?: boolean;
+┊  ┊54┊  url?: string;
+┊  ┊55┊  userId?: string;
+┊  ┊56┊}
```
[}]: #

If you're familiar with `Whatsapp`, you'll know that sent pictures are compressed. That's so the data-base can store more pictures, and the traffic in the network will be faster. To compress the sent pictures, we will be using an `NPM` package called [sharp](https://www.npmjs.com/package/sharp), which is a utility library which will help us perform transformations on pictures:

    $ meteor npm install --save sharp

> Be sure to use `meteor npm` and not `npm`, and that's because we wanna make sure that `sharp` is compatible with the server.

Now we will create a picture store which will compress pictures using `sharp` right before they are inserted into the data-base:

[{]: <helper> (diff_step 12.12)
#### Step 12.12: Create pictures store

##### Added api/server/collections/pictures.ts
```diff
@@ -0,0 +1,40 @@
+┊  ┊ 1┊import { MongoObservable } from 'meteor-rxjs';
+┊  ┊ 2┊import { UploadFS } from 'meteor/jalik:ufs';
+┊  ┊ 3┊import { Meteor } from 'meteor/meteor';
+┊  ┊ 4┊import * as Sharp from 'sharp';
+┊  ┊ 5┊import { Picture, DEFAULT_PICTURE_URL } from '../models';
+┊  ┊ 6┊
+┊  ┊ 7┊export interface PicturesCollection<T> extends MongoObservable.Collection<T> {
+┊  ┊ 8┊  getPictureUrl(selector?: Object | string): string;
+┊  ┊ 9┊}
+┊  ┊10┊
+┊  ┊11┊export const Pictures =
+┊  ┊12┊  new MongoObservable.Collection<Picture>('pictures') as PicturesCollection<Picture>;
+┊  ┊13┊
+┊  ┊14┊export const PicturesStore = new UploadFS.store.GridFS({
+┊  ┊15┊  collection: Pictures.collection,
+┊  ┊16┊  name: 'pictures',
+┊  ┊17┊  filter: new UploadFS.Filter({
+┊  ┊18┊    contentTypes: ['image/*']
+┊  ┊19┊  }),
+┊  ┊20┊  permissions: new UploadFS.StorePermissions({
+┊  ┊21┊    insert: picturesPermissions,
+┊  ┊22┊    update: picturesPermissions,
+┊  ┊23┊    remove: picturesPermissions
+┊  ┊24┊  }),
+┊  ┊25┊  transformWrite(from, to) {
+┊  ┊26┊    // Compress picture to 75% from its original quality
+┊  ┊27┊    const transform = Sharp().png({ quality: 75 });
+┊  ┊28┊    from.pipe(transform).pipe(to);
+┊  ┊29┊  }
+┊  ┊30┊});
+┊  ┊31┊
+┊  ┊32┊// Gets picture's url by a given selector
+┊  ┊33┊Pictures.getPictureUrl = function (selector) {
+┊  ┊34┊  const picture = this.findOne(selector) || {};
+┊  ┊35┊  return picture.url || DEFAULT_PICTURE_URL;
+┊  ┊36┊};
+┊  ┊37┊
+┊  ┊38┊function picturesPermissions(userId: string): boolean {
+┊  ┊39┊  return Meteor.isServer || !!userId;
+┊  ┊40┊}
```
[}]: #

You can look at a store as some sort of a wrapper for a collection, which will run different kind of a operations before it mutates it or fetches data from it. Note that we used `GridFS` because this way an uploaded file is split into multiple packets, which is more efficient for storage. We also defined a small utility function on that store which will retrieve a profile picture. If the ID was not found, it will return a link for the default picture. To make things convenient, we will also export the store from the `index` file:

[{]: <helper> (diff_step 12.13)
#### Step 12.13: Export pictures collection

##### Changed api/server/collections/index.ts
```diff
@@ -1,3 +1,4 @@
 ┊1┊1┊export * from './chats';
 ┊2┊2┊export * from './messages';
 ┊3┊3┊export * from './users';
+┊ ┊4┊export * from './pictures';
```
[}]: #

Now that we have the pictures store, and the server knows how to handle uploaded pictures, we will implement the `upload` stub in the `PictureService`:

[{]: <helper> (diff_step 12.14)
#### Step 12.14: Implement upload method

##### Changed src/services/picture.ts
```diff
@@ -2,6 +2,9 @@
 ┊ 2┊ 2┊import { Platform } from 'ionic-angular';
 ┊ 3┊ 3┊import { ImagePicker } from 'ionic-native';
 ┊ 4┊ 4┊import { UploadFS } from 'meteor/jalik:ufs';
+┊  ┊ 5┊import { PicturesStore } from 'api/collections';
+┊  ┊ 6┊import { _ } from 'meteor/underscore';
+┊  ┊ 7┊import { DEFAULT_PICTURE_URL } from 'api/models';
 ┊ 5┊ 8┊
 ┊ 6┊ 9┊@Injectable()
 ┊ 7┊10┊export class PictureService {
```
```diff
@@ -28,7 +31,23 @@
 ┊28┊31┊  }
 ┊29┊32┊
 ┊30┊33┊  upload(blob: Blob): Promise<any> {
-┊31┊  ┊    return Promise.resolve();
+┊  ┊34┊    return new Promise((resolve, reject) => {
+┊  ┊35┊      const metadata = _.pick(blob, 'name', 'type', 'size');
+┊  ┊36┊
+┊  ┊37┊      if (!metadata.name) {
+┊  ┊38┊        metadata.name = DEFAULT_PICTURE_URL;
+┊  ┊39┊      }
+┊  ┊40┊
+┊  ┊41┊      const upload = new UploadFS.Uploader({
+┊  ┊42┊        data: blob,
+┊  ┊43┊        file: metadata,
+┊  ┊44┊        store: PicturesStore,
+┊  ┊45┊        onComplete: resolve,
+┊  ┊46┊        onError: reject
+┊  ┊47┊      });
+┊  ┊48┊
+┊  ┊49┊      upload.start();
+┊  ┊50┊    });
 ┊32┊51┊  }
 ┊33┊52┊
 ┊34┊53┊  convertURLtoBlob(URL: string): Promise<Blob> {
```
[}]: #

Since `sharp` is a server-only package, and it is not supported by the client, at all, we will replace it with an empty dummy-object so errors won't occur. This requires us to change the `Webpack` config as shown below:

[{]: <helper> (diff_step 12.15)
#### Step 12.15: Ignore sharp package on client side

##### Changed webpack.config.js
```diff
@@ -20,6 +20,9 @@
 ┊20┊20┊  },
 ┊21┊21┊
 ┊22┊22┊  externals: [
+┊  ┊23┊    {
+┊  ┊24┊      sharp: '{}'
+┊  ┊25┊    },
 ┊23┊26┊    resolveExternals
 ┊24┊27┊  ],
```
[}]: #

## View Picture Messages

We will now add the support for picture typed messages in the `MessagesPage`, so whenever we send a picture, we will be able to see them in the messages list like any other message:

[{]: <helper> (diff_step 12.16)
#### Step 12.16: Added view for picture message

##### Changed src/pages/messages/messages.html
```diff
@@ -24,6 +24,7 @@
 ┊24┊24┊              <sebm-google-map-marker [latitude]="getLocation(message.content).lat" [longitude]="getLocation(message.content).lng"></sebm-google-map-marker>
 ┊25┊25┊            </sebm-google-map>
 ┊26┊26┊          </div>
+┊  ┊27┊          <img *ngIf="message.type == 'picture'" (click)="showPicture($event)" class="message-content message-content-picture" [src]="message.content">
 ┊27┊28┊
 ┊28┊29┊          <span class="message-timestamp">{{ message.createdAt | amDateFormat: 'HH:mm' }}</span>
 ┊29┊30┊        </div>
```
[}]: #

As you can see, we also bound the picture message to the `click` event, which means that whenever we click on it, a picture viewer should be opened with the clicked picture. Let's create the component for that picture viewer:

[{]: <helper> (diff_step 12.17)
#### Step 12.17: Create show picture component

##### Added src/pages/messages/show-picture.ts
```diff
@@ -0,0 +1,14 @@
+┊  ┊ 1┊import { Component } from '@angular/core';
+┊  ┊ 2┊import { NavParams, ViewController } from 'ionic-angular';
+┊  ┊ 3┊
+┊  ┊ 4┊@Component({
+┊  ┊ 5┊  selector: 'show-picture',
+┊  ┊ 6┊  templateUrl: 'show-picture.html'
+┊  ┊ 7┊})
+┊  ┊ 8┊export class ShowPictureComponent {
+┊  ┊ 9┊  pictureSrc: string;
+┊  ┊10┊
+┊  ┊11┊  constructor(private navParams: NavParams, private viewCtrl: ViewController) {
+┊  ┊12┊    this.pictureSrc = navParams.get('pictureSrc');
+┊  ┊13┊  }
+┊  ┊14┊}
```
[}]: #

[{]: <helper> (diff_step 12.18)
#### Step 12.18: Create show picture template

##### Added src/pages/messages/show-picture.html
```diff
@@ -0,0 +1,13 @@
+┊  ┊ 1┊<ion-header>
+┊  ┊ 2┊  <ion-toolbar color="whatsapp">
+┊  ┊ 3┊    <ion-title>Show Picture</ion-title>
+┊  ┊ 4┊
+┊  ┊ 5┊    <ion-buttons left>
+┊  ┊ 6┊      <button ion-button class="dismiss-button" (click)="viewCtrl.dismiss()"><ion-icon name="close"></ion-icon></button>
+┊  ┊ 7┊    </ion-buttons>
+┊  ┊ 8┊  </ion-toolbar>
+┊  ┊ 9┊</ion-header>
+┊  ┊10┊
+┊  ┊11┊<ion-content class="show-picture">
+┊  ┊12┊  <img class="picture" [src]="pictureSrc">
+┊  ┊13┊</ion-content>
```
[}]: #

[{]: <helper> (diff_step 12.19)
#### Step 12.19: Create show pictuer component styles

##### Added src/pages/messages/show-picture.scss
```diff
@@ -0,0 +1,10 @@
+┊  ┊ 1┊.show-picture {
+┊  ┊ 2┊  background-color: black;
+┊  ┊ 3┊
+┊  ┊ 4┊  .picture {
+┊  ┊ 5┊    position: absolute;
+┊  ┊ 6┊    top: 50%;
+┊  ┊ 7┊    left: 50%;
+┊  ┊ 8┊    transform: translate(-50%, -50%);
+┊  ┊ 9┊  }
+┊  ┊10┊}🚫↵
```
[}]: #

[{]: <helper> (diff_step 12.20)
#### Step 12.20: Import ShowPictureComponent

##### Changed src/app/app.module.ts
```diff
@@ -10,6 +10,7 @@
 ┊10┊10┊import { MessagesAttachmentsComponent } from '../pages/messages/messages-attachments';
 ┊11┊11┊import { MessagesOptionsComponent } from '../pages/messages/messages-options';
 ┊12┊12┊import { NewLocationMessageComponent } from '../pages/messages/location-message';
+┊  ┊13┊import { ShowPictureComponent } from '../pages/messages/show-picture';
 ┊13┊14┊import { ProfilePage } from '../pages/profile/profile';
 ┊14┊15┊import { VerificationPage } from '../pages/verification/verification';
 ┊15┊16┊import { PhoneService } from '../services/phone';
```
```diff
@@ -28,7 +29,8 @@
 ┊28┊29┊    NewChatComponent,
 ┊29┊30┊    MessagesOptionsComponent,
 ┊30┊31┊    MessagesAttachmentsComponent,
-┊31┊  ┊    NewLocationMessageComponent
+┊  ┊32┊    NewLocationMessageComponent,
+┊  ┊33┊    ShowPictureComponent
 ┊32┊34┊  ],
 ┊33┊35┊  imports: [
 ┊34┊36┊    IonicModule.forRoot(MyApp),
```
```diff
@@ -49,7 +51,8 @@
 ┊49┊51┊    NewChatComponent,
 ┊50┊52┊    MessagesOptionsComponent,
 ┊51┊53┊    MessagesAttachmentsComponent,
-┊52┊  ┊    NewLocationMessageComponent
+┊  ┊54┊    NewLocationMessageComponent,
+┊  ┊55┊    ShowPictureComponent
 ┊53┊56┊  ],
 ┊54┊57┊  providers: [
 ┊55┊58┊    {provide: ErrorHandler, useClass: IonicErrorHandler},
```
[}]: #

And now that we have that component ready, we will implement the `showPicture` method in the `MessagesPage` component, which will create a new instance of the `ShowPictureComponent`:

[{]: <helper> (diff_step 12.21)
#### Step 12.21: Implement showPicture method

##### Changed src/pages/messages/messages.ts
```diff
@@ -1,5 +1,5 @@
 ┊1┊1┊import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
-┊2┊ ┊import { NavParams, PopoverController } from 'ionic-angular';
+┊ ┊2┊import { NavParams, PopoverController, ModalController } from 'ionic-angular';
 ┊3┊3┊import { Chat, Message, MessageType, Location } from 'api/models';
 ┊4┊4┊import { Messages } from 'api/collections';
 ┊5┊5┊import { MeteorObservable } from 'meteor-rxjs';
```
```diff
@@ -9,6 +9,7 @@
 ┊ 9┊ 9┊import { Subscription, Observable, Subscriber } from 'rxjs';
 ┊10┊10┊import { MessagesAttachmentsComponent } from './messages-attachments';
 ┊11┊11┊import { PictureService } from '../../services/picture';
+┊  ┊12┊import { ShowPictureComponent } from './show-picture';
 ┊12┊13┊
 ┊13┊14┊@Component({
 ┊14┊15┊  selector: 'messages-page',
```
```diff
@@ -31,7 +32,8 @@
 ┊31┊32┊    navParams: NavParams,
 ┊32┊33┊    private el: ElementRef,
 ┊33┊34┊    private popoverCtrl: PopoverController,
-┊34┊  ┊    private pictureService: PictureService
+┊  ┊35┊    private pictureService: PictureService,
+┊  ┊36┊    private modalCtrl: ModalController
 ┊35┊37┊  ) {
 ┊36┊38┊    this.selectedChat = <Chat>navParams.get('chat');
 ┊37┊39┊    this.title = this.selectedChat.title;
```
```diff
@@ -266,4 +268,12 @@
 ┊266┊268┊      zoom: Math.min(splitted[2] || 0, 19)
 ┊267┊269┊    };
 ┊268┊270┊  }
+┊   ┊271┊
+┊   ┊272┊  showPicture({ target }: Event) {
+┊   ┊273┊    const modal = this.modalCtrl.create(ShowPictureComponent, {
+┊   ┊274┊      pictureSrc: (<HTMLImageElement>target).src
+┊   ┊275┊    });
+┊   ┊276┊
+┊   ┊277┊    modal.present();
+┊   ┊278┊  }
 ┊269┊279┊}
```
[}]: #

## Profile Picture

We have the ability to send picture messages. Now we will add the ability to change the user's profile picture using the infrastructure we've just created. To begin with, we will define a new property to our `User` model called `pictureId`, which will be used to determine the belonging profile picture of the current user:

[{]: <helper> (diff_step 12.22)
#### Step 12.22: Add pictureId property to Profile

##### Changed api/server/models.ts
```diff
@@ -3,6 +3,7 @@
 ┊3┊3┊export interface Profile {
 ┊4┊4┊  name?: string;
 ┊5┊5┊  picture?: string;
+┊ ┊6┊  pictureId?: string;
 ┊6┊7┊}
 ┊7┊8┊
 ┊8┊9┊export enum MessageType {
```
[}]: #

We will bind the editing button in the profile selection page into an event handler:

[{]: <helper> (diff_step 12.23)
#### Step 12.23: Add event for changing profile picture

##### Changed src/pages/profile/profile.html
```diff
@@ -11,6 +11,7 @@
 ┊11┊11┊<ion-content class="profile-page-content">
 ┊12┊12┊  <div class="profile-picture">
 ┊13┊13┊    <img *ngIf="picture" [src]="picture">
+┊  ┊14┊    <ion-icon name="create" (click)="selectProfilePicture()"></ion-icon>
 ┊14┊15┊  </div>
 ┊15┊16┊
 ┊16┊17┊  <ion-item class="profile-name">
```
[}]: #

And we will add all the missing logic in the component, so the `pictureId` will be transformed into and actual reference, and so we can have the ability to select a picture from our gallery and upload it:

[{]: <helper> (diff_step 12.24)
#### Step 12.24: Implement pick, update and set of profile image

##### Changed src/pages/profile/profile.ts
```diff
@@ -3,6 +3,8 @@
 ┊ 3┊ 3┊import { AlertController, NavController } from 'ionic-angular';
 ┊ 4┊ 4┊import { MeteorObservable } from 'meteor-rxjs';
 ┊ 5┊ 5┊import { ChatsPage } from '../chats/chats';
+┊  ┊ 6┊import { PictureService } from '../../services/picture';
+┊  ┊ 7┊import { Pictures } from 'api/collections';
 ┊ 6┊ 8┊
 ┊ 7┊ 9┊@Component({
 ┊ 8┊10┊  selector: 'profile',
```
```diff
@@ -14,13 +16,37 @@
 ┊14┊16┊
 ┊15┊17┊  constructor(
 ┊16┊18┊    private alertCtrl: AlertController,
-┊17┊  ┊    private navCtrl: NavController
+┊  ┊19┊    private navCtrl: NavController,
+┊  ┊20┊    private pictureService: PictureService
 ┊18┊21┊  ) {}
 ┊19┊22┊
 ┊20┊23┊  ngOnInit(): void {
 ┊21┊24┊    this.profile = Meteor.user().profile || {
 ┊22┊25┊      name: ''
 ┊23┊26┊    };
+┊  ┊27┊
+┊  ┊28┊    MeteorObservable.subscribe('user').subscribe(() => {
+┊  ┊29┊      this.picture = Pictures.getPictureUrl(this.profile.pictureId);
+┊  ┊30┊    });
+┊  ┊31┊  }
+┊  ┊32┊
+┊  ┊33┊  selectProfilePicture(): void {
+┊  ┊34┊    this.pictureService.select().then((blob) => {
+┊  ┊35┊      this.uploadProfilePicture(blob);
+┊  ┊36┊    })
+┊  ┊37┊      .catch((e) => {
+┊  ┊38┊        this.handleError(e);
+┊  ┊39┊      });
+┊  ┊40┊  }
+┊  ┊41┊
+┊  ┊42┊  uploadProfilePicture(blob: Blob): void {
+┊  ┊43┊    this.pictureService.upload(blob).then((picture) => {
+┊  ┊44┊      this.profile.pictureId = picture._id;
+┊  ┊45┊      this.picture = picture.url;
+┊  ┊46┊    })
+┊  ┊47┊      .catch((e) => {
+┊  ┊48┊        this.handleError(e);
+┊  ┊49┊      });
 ┊24┊50┊  }
 ┊25┊51┊
 ┊26┊52┊  updateProfile(): void {
```
[}]: #

We will also define a new hook in the `Meteor.users` collection so whenever we update the profile picture, the previous one will be removed from the data-base. This way we won't have some unnecessary data in our data-base, which will save us some precious storage:

[{]: <helper> (diff_step 12.25)
#### Step 12.25: Add after hook for user modification

##### Changed api/server/collections/users.ts
```diff
@@ -1,5 +1,15 @@
 ┊ 1┊ 1┊import { MongoObservable } from 'meteor-rxjs';
 ┊ 2┊ 2┊import { Meteor } from 'meteor/meteor';
 ┊ 3┊ 3┊import { User } from '../models';
+┊  ┊ 4┊import { Pictures } from './pictures';
 ┊ 4┊ 5┊
 ┊ 5┊ 6┊export const Users = MongoObservable.fromExisting<User>(Meteor.users);
+┊  ┊ 7┊
+┊  ┊ 8┊// Dispose unused profile pictures
+┊  ┊ 9┊Meteor.users.after.update(function (userId, doc, fieldNames, modifier, options) {
+┊  ┊10┊  if (!doc.profile) return;
+┊  ┊11┊  if (!this.previous.profile) return;
+┊  ┊12┊  if (doc.profile.pictureId == this.previous.profile.pictureId) return;
+┊  ┊13┊
+┊  ┊14┊  Pictures.collection.remove({ _id: doc.profile.pictureId });
+┊  ┊15┊}, { fetchPrevious: true });
```
[}]: #

Collection hooks are not part of `Meteor`'s official API and are added through a third-party package called `matb33:collection-hooks`. This requires us to install the necessary type definition:

    $ npm install --save-dev @types/meteor-collection-hooks

Now we need to import the type definition we've just installed in the `tsconfig.json` file:

[{]: <helper> (diff_step 12.27)
#### Step 12.27: Import meteor-collection-hooks typings

##### Changed api/tsconfig.json
```diff
@@ -18,7 +18,8 @@
 ┊18┊18┊    "types": [
 ┊19┊19┊      "meteor-typings",
 ┊20┊20┊      "@types/meteor-accounts-phone",
-┊21┊  ┊      "@types/meteor-publish-composite"
+┊  ┊21┊      "@types/meteor-publish-composite",
+┊  ┊22┊      "@types/meteor-collection-hooks"
 ┊22┊23┊    ]
 ┊23┊24┊  },
 ┊24┊25┊  "exclude": [
```

##### Changed tsconfig.json
```diff
@@ -22,7 +22,8 @@
 ┊22┊22┊    "types": [
 ┊23┊23┊      "meteor-typings",
 ┊24┊24┊      "@types/underscore",
-┊25┊  ┊      "@types/meteor-accounts-phone"
+┊  ┊25┊      "@types/meteor-accounts-phone",
+┊  ┊26┊      "@types/meteor-collection-hooks"
 ┊26┊27┊    ]
 ┊27┊28┊  },
 ┊28┊29┊  "include": [
```
[}]: #

We now add a `user` publication which should be subscribed whenever we initialize the `ProfilePage`. This subscription should fetch some data from other collections which is related to the user which is currently logged in; And to be more specific, the document associated with the `profileId` defined in the `User` model:

[{]: <helper> (diff_step 12.28)
#### Step 12.28: Add user publication

##### Changed api/server/publications.ts
```diff
@@ -2,6 +2,7 @@
 ┊2┊2┊import { Users } from './collections/users';
 ┊3┊3┊import { Messages } from './collections/messages';
 ┊4┊4┊import { Chats } from './collections/chats';
+┊ ┊5┊import { Pictures } from './collections/pictures';
 ┊5┊6┊
 ┊6┊7┊Meteor.publishComposite('users', function(
 ┊7┊8┊  pattern: string
```
```diff
@@ -74,3 +75,15 @@
 ┊74┊75┊    ]
 ┊75┊76┊  };
 ┊76┊77┊});
+┊  ┊78┊
+┊  ┊79┊Meteor.publish('user', function () {
+┊  ┊80┊  if (!this.userId) {
+┊  ┊81┊    return;
+┊  ┊82┊  }
+┊  ┊83┊
+┊  ┊84┊  const profile = Users.findOne(this.userId).profile || {};
+┊  ┊85┊
+┊  ┊86┊  return Pictures.collection.find({
+┊  ┊87┊    _id: profile.pictureId
+┊  ┊88┊  });
+┊  ┊89┊});
```
[}]: #

We will also modify the `users` and `chats` publication, so each user will contain its corresponding picture document as well:

[{]: <helper> (diff_step 12.29)
#### Step 12.29: Added images to users publication

##### Changed api/server/publications.ts
```diff
@@ -1,4 +1,4 @@
-┊1┊ ┊import { User, Message, Chat } from './models';
+┊ ┊1┊import { User, Message, Chat, Picture } from './models';
 ┊2┊2┊import { Users } from './collections/users';
 ┊3┊3┊import { Messages } from './collections/messages';
 ┊4┊4┊import { Chats } from './collections/chats';
```
```diff
@@ -25,7 +25,17 @@
 ┊25┊25┊        fields: { profile: 1 },
 ┊26┊26┊        limit: 15
 ┊27┊27┊      });
-┊28┊  ┊    }
+┊  ┊28┊    },
+┊  ┊29┊
+┊  ┊30┊    children: [
+┊  ┊31┊      <PublishCompositeConfig1<User, Picture>> {
+┊  ┊32┊        find: (user) => {
+┊  ┊33┊          return Pictures.collection.find(user.profile.pictureId, {
+┊  ┊34┊            fields: { url: 1 }
+┊  ┊35┊          });
+┊  ┊36┊        }
+┊  ┊37┊      }
+┊  ┊38┊    ]
 ┊29┊39┊  };
 ┊30┊40┊});
```
[}]: #

[{]: <helper> (diff_step 12.10)
#### Step 12.10: Create Picture model

##### Changed api/server/models.ts
```diff
@@ -38,3 +38,19 @@
 ┊38┊38┊  lng: number;
 ┊39┊39┊  zoom: number;
 ┊40┊40┊}
+┊  ┊41┊
+┊  ┊42┊export interface Picture {
+┊  ┊43┊  _id?: string;
+┊  ┊44┊  complete?: boolean;
+┊  ┊45┊  extension?: string;
+┊  ┊46┊  name?: string;
+┊  ┊47┊  progress?: number;
+┊  ┊48┊  size?: number;
+┊  ┊49┊  store?: string;
+┊  ┊50┊  token?: string;
+┊  ┊51┊  type?: string;
+┊  ┊52┊  uploadedAt?: Date;
+┊  ┊53┊  uploading?: boolean;
+┊  ┊54┊  url?: string;
+┊  ┊55┊  userId?: string;
+┊  ┊56┊}
```
[}]: #

Since we already set up some collection hooks on the users collection, we can take it a step further by defining collection hooks on the chat collection, so whenever a chat is being removed, all its corresponding messages will be removed as well:

[{]: <helper> (diff_step 12.31)
#### Step 12.31: Add hook for removing unused messages

##### Changed api/server/collections/chats.ts
```diff
@@ -1,4 +1,10 @@
 ┊ 1┊ 1┊import { MongoObservable } from 'meteor-rxjs';
 ┊ 2┊ 2┊import { Chat } from '../models';
+┊  ┊ 3┊import { Messages } from './messages';
 ┊ 3┊ 4┊
 ┊ 4┊ 5┊export const Chats = new MongoObservable.Collection<Chat>('chats');
+┊  ┊ 6┊
+┊  ┊ 7┊// Dispose unused messages
+┊  ┊ 8┊Chats.collection.after.remove(function (userId, doc) {
+┊  ┊ 9┊  Messages.collection.remove({ chatId: doc._id });
+┊  ┊10┊});
```
[}]: #

We will now update the `updateProfile` method in the server to accept `pictureId`, so whenever we pick up a new profile picture the server won't reject it:

[{]: <helper> (diff_step 12.32)
#### Step 12.32: Allow updating pictureId

##### Changed api/server/methods.ts
```diff
@@ -59,7 +59,8 @@
 ┊59┊59┊      'User must be logged-in to create a new chat');
 ┊60┊60┊
 ┊61┊61┊    check(profile, {
-┊62┊  ┊      name: nonEmptyString
+┊  ┊62┊      name: nonEmptyString,
+┊  ┊63┊      pictureId: Match.Maybe(nonEmptyString)
 ┊63┊64┊    });
 ┊64┊65┊
 ┊65┊66┊    Meteor.users.update(this.userId, {
```
[}]: #

Now we will update the users fabrication in our server's initialization, so instead of using hard-coded URLs, we will insert them as new documents to the `PicturesCollection`:

[{]: <helper> (diff_step 12.33)
#### Step 12.33: Update creation of users stubs

##### Changed api/server/main.ts
```diff
@@ -2,7 +2,7 @@
 ┊2┊2┊import { Chats } from './collections/chats';
 ┊3┊3┊import { Messages } from './collections/messages';
 ┊4┊4┊import * as moment from 'moment';
-┊5┊ ┊import { MessageType } from './models';
+┊ ┊5┊import { MessageType, Picture } from './models';
 ┊6┊6┊import { Accounts } from 'meteor/accounts-base';
 ┊7┊7┊import { Users } from './collections/users';
 ┊8┊8┊
```
```diff
@@ -16,43 +16,74 @@
 ┊16┊16┊    return;
 ┊17┊17┊  }
 ┊18┊18┊
+┊  ┊19┊  let picture = importPictureFromUrl({
+┊  ┊20┊    name: 'man1.jpg',
+┊  ┊21┊    url: 'https://randomuser.me/api/portraits/men/1.jpg'
+┊  ┊22┊  });
+┊  ┊23┊
 ┊19┊24┊  Accounts.createUserWithPhone({
 ┊20┊25┊    phone: '+972540000001',
 ┊21┊26┊    profile: {
 ┊22┊27┊      name: 'Ethan Gonzalez',
-┊23┊  ┊      picture: 'https://randomuser.me/api/portraits/men/1.jpg'
+┊  ┊28┊      pictureId: picture._id
 ┊24┊29┊    }
 ┊25┊30┊  });
 ┊26┊31┊
+┊  ┊32┊  picture = importPictureFromUrl({
+┊  ┊33┊    name: 'lego1.jpg',
+┊  ┊34┊    url: 'https://randomuser.me/api/portraits/lego/1.jpg'
+┊  ┊35┊  });
+┊  ┊36┊
 ┊27┊37┊  Accounts.createUserWithPhone({
 ┊28┊38┊    phone: '+972540000002',
 ┊29┊39┊    profile: {
 ┊30┊40┊      name: 'Bryan Wallace',
-┊31┊  ┊      picture: 'https://randomuser.me/api/portraits/lego/1.jpg'
+┊  ┊41┊      pictureId: picture._id
 ┊32┊42┊    }
 ┊33┊43┊  });
 ┊34┊44┊
+┊  ┊45┊  picture = importPictureFromUrl({
+┊  ┊46┊    name: 'woman1.jpg',
+┊  ┊47┊    url: 'https://randomuser.me/api/portraits/women/1.jpg'
+┊  ┊48┊  });
+┊  ┊49┊
 ┊35┊50┊  Accounts.createUserWithPhone({
 ┊36┊51┊    phone: '+972540000003',
 ┊37┊52┊    profile: {
 ┊38┊53┊      name: 'Avery Stewart',
-┊39┊  ┊      picture: 'https://randomuser.me/api/portraits/women/1.jpg'
+┊  ┊54┊      pictureId: picture._id
 ┊40┊55┊    }
 ┊41┊56┊  });
 ┊42┊57┊
+┊  ┊58┊  picture = importPictureFromUrl({
+┊  ┊59┊    name: 'woman2.jpg',
+┊  ┊60┊    url: 'https://randomuser.me/api/portraits/women/2.jpg'
+┊  ┊61┊  });
+┊  ┊62┊
 ┊43┊63┊  Accounts.createUserWithPhone({
 ┊44┊64┊    phone: '+972540000004',
 ┊45┊65┊    profile: {
 ┊46┊66┊      name: 'Katie Peterson',
-┊47┊  ┊      picture: 'https://randomuser.me/api/portraits/women/2.jpg'
+┊  ┊67┊      pictureId: picture._id
 ┊48┊68┊    }
 ┊49┊69┊  });
 ┊50┊70┊
+┊  ┊71┊  picture = importPictureFromUrl({
+┊  ┊72┊    name: 'man2.jpg',
+┊  ┊73┊    url: 'https://randomuser.me/api/portraits/men/2.jpg'
+┊  ┊74┊  });
+┊  ┊75┊
 ┊51┊76┊  Accounts.createUserWithPhone({
 ┊52┊77┊    phone: '+972540000005',
 ┊53┊78┊    profile: {
 ┊54┊79┊      name: 'Ray Edwards',
-┊55┊  ┊      picture: 'https://randomuser.me/api/portraits/men/2.jpg'
+┊  ┊80┊      pictureId: picture._id
 ┊56┊81┊    }
 ┊57┊82┊  });
 ┊58┊83┊});
+┊  ┊84┊
+┊  ┊85┊function importPictureFromUrl(options: { name: string, url: string }): Picture {
+┊  ┊86┊  const description = { name: options.name };
+┊  ┊87┊
+┊  ┊88┊  return Meteor.call('ufsImportURL', options.url, description, 'pictures');
+┊  ┊89┊}
```
[}]: #

To avoid some unexpected behaviors, we will reset our data-base so our server can re-fabricate the data:

    api$ meteor reset

We will now update the `ChatsPage` to add the belonging picture for each chat during transformation:

[{]: <helper> (diff_step 12.34)
#### Step 12.34: Fetch user image from server

##### Changed src/pages/chats/chats.ts
```diff
@@ -1,5 +1,5 @@
 ┊1┊1┊import { Component, OnInit } from '@angular/core';
-┊2┊ ┊import { Chats, Messages, Users } from 'api/collections';
+┊ ┊2┊import { Chats, Messages, Users, Pictures } from 'api/collections';
 ┊3┊3┊import { Chat, Message } from 'api/models';
 ┊4┊4┊import { NavController, PopoverController, ModalController, AlertController } from 'ionic-angular';
 ┊5┊5┊import { MeteorObservable } from 'meteor-rxjs';
```
```diff
@@ -48,7 +48,7 @@
 ┊48┊48┊
 ┊49┊49┊        if (receiver) {
 ┊50┊50┊          chat.title = receiver.profile.name;
-┊51┊  ┊          chat.picture = receiver.profile.picture;
+┊  ┊51┊          chat.picture = Pictures.getPictureUrl(receiver.profile.pictureId);
 ┊52┊52┊        }
 ┊53┊53┊
 ┊54┊54┊        // This will make the last message reactive
```
[}]: #

And we will do the same in the `NewChatComponent`:

[{]: <helper> (diff_step 12.35)
#### Step 12.35: Use the new pictureId field for new chat modal

##### Changed src/pages/chats/new-chat.html
```diff
@@ -26,7 +26,7 @@
 ┊26┊26┊<ion-content class="new-chat">
 ┊27┊27┊  <ion-list class="users">
 ┊28┊28┊    <button ion-item *ngFor="let user of users | async" class="user" (click)="addChat(user)">
-┊29┊  ┊      <img class="user-picture" [src]="user.profile.picture">
+┊  ┊29┊      <img class="user-picture" [src]="getPic(user.profile.pictureId)">
 ┊30┊30┊      <h2 class="user-name">{{user.profile.name}}</h2>
 ┊31┊31┊    </button>
 ┊32┊32┊  </ion-list>
```
[}]: #

[{]: <helper> (diff_step 12.36)
#### Step 12.36: Implement getPic

##### Changed src/pages/chats/new-chat.ts
```diff
@@ -1,5 +1,5 @@
 ┊1┊1┊import { Component, OnInit } from '@angular/core';
-┊2┊ ┊import { Chats, Users } from 'api/collections';
+┊ ┊2┊import { Chats, Users, Pictures } from 'api/collections';
 ┊3┊3┊import { User } from 'api/models';
 ┊4┊4┊import { AlertController, ViewController } from 'ionic-angular';
 ┊5┊5┊import { MeteorObservable } from 'meteor-rxjs';
```
```diff
@@ -107,4 +107,8 @@
 ┊107┊107┊
 ┊108┊108┊    alert.present();
 ┊109┊109┊  }
+┊   ┊110┊
+┊   ┊111┊  getPic(pictureId): string {
+┊   ┊112┊    return Pictures.getPictureUrl(pictureId);
+┊   ┊113┊  }
 ┊110┊114┊}
```
[}]: #

[}]: #
[{]: <region> (footer)
[{]: <helper> (nav_step)
| [< Previous Step](step11.md) | [Next Step >](step13.md) |
|:--------------------------------|--------------------------------:|
[}]: #
[}]: #