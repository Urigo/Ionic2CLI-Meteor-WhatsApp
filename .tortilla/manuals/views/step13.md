# Step 13: File Upload &amp; Images

In this step, we will be using `Ionic 2` to pick up some images from our device's gallery, and we will use them to send pictures, and to set our profile picture.

## Image Picker

First, we will a `Cordova` plug-in which will give us the ability to access the gallery:

    $ ionic cordova plugin add git+https://github.com/dhavalsoni2001/ImagePicker.git --save
    $ npm install --save @ionic-native/image-picker

Then let's add it to `app.module.ts`:

[{]: <helper> (diffStep "13.2")

#### [Step 13.2: Add Image Picker to app.module.ts](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/c4b1b321)

##### Changed src&#x2F;app&#x2F;app.module.ts
```diff
@@ -4,6 +4,7 @@
 ┊ 4┊ 4┊import { SplashScreen } from '@ionic-native/splash-screen';
 ┊ 5┊ 5┊import { StatusBar } from '@ionic-native/status-bar';
 ┊ 6┊ 6┊import { Geolocation } from '@ionic-native/geolocation';
+┊  ┊ 7┊import { ImagePicker } from '@ionic-native/image-picker';
 ┊ 7┊ 8┊import { AgmCoreModule } from '@agm/core';
 ┊ 8┊ 9┊import { MomentModule } from 'angular2-moment';
 ┊ 9┊10┊import { ChatsPage } from '../pages/chats/chats';
```
```diff
@@ -60,7 +61,8 @@
 ┊60┊61┊    SplashScreen,
 ┊61┊62┊    Geolocation,
 ┊62┊63┊    {provide: ErrorHandler, useClass: IonicErrorHandler},
-┊63┊  ┊    PhoneService
+┊  ┊64┊    PhoneService,
+┊  ┊65┊    ImagePicker
 ┊64┊66┊  ]
 ┊65┊67┊})
 ┊66┊68┊export class AppModule {}
```

[}]: #

## Meteor FS

Up next, would be adding the ability to store some files in our data-base. This requires us to add 2 `Meteor` packages, called `ufs` and `ufs-gridfs` (Which adds support for `GridFS` operations. See [reference](https://docs.mongodb.com/manual/core/gridfs/)), which will take care of FS operations:

    api$ meteor add jalik:ufs
    api$ meteor add jalik:ufs-gridfs

Since there are no declarations available for `jalik:ufs`, let's create a fake one to at least get rid of the warnings:

[{]: <helper> (diffStep "13.4")

#### [Step 13.4: Add declarations for meteor/jalik:ufs](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/dbde9499)

##### Changed src&#x2F;declarations.d.ts
```diff
@@ -8,3 +8,4 @@
 ┊ 8┊ 8┊  For more info on type definition files, check out the Typescript docs here:
 ┊ 9┊ 9┊  https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html
 ┊10┊10┊*/
+┊  ┊11┊declare module 'meteor/jalik:ufs';
```

[}]: #

And be sure to re-bundle the `Meteor` client whenever you make changes in the server:

    $ npm run meteor-client:bundle

## Client Side

Before we proceed to the server, we will add the ability to select and upload pictures in the client. All our picture-related operations will be defined in a single service called `PictureService`; The first bit of this service would be picture-selection. The `UploadFS` package already supports that feature, **but only for the browser**, therefore we will be using the `Cordova` plug-in we've just installed to select some pictures from our mobile device:

[{]: <helper> (diffStep "13.5")

#### [Step 13.5: Create PictureService with utils for files](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/27f953c6)

##### Added src&#x2F;services&#x2F;picture.ts
```diff
@@ -0,0 +1,99 @@
+┊  ┊ 1┊import { Injectable } from '@angular/core';
+┊  ┊ 2┊import { Platform } from 'ionic-angular';
+┊  ┊ 3┊import { ImagePicker } from '@ionic-native/image-picker';
+┊  ┊ 4┊import { UploadFS } from 'meteor/jalik:ufs';
+┊  ┊ 5┊
+┊  ┊ 6┊@Injectable()
+┊  ┊ 7┊export class PictureService {
+┊  ┊ 8┊  constructor(private platform: Platform,
+┊  ┊ 9┊              private imagePicker: ImagePicker) {
+┊  ┊10┊  }
+┊  ┊11┊
+┊  ┊12┊  select(): Promise<File> {
+┊  ┊13┊    if (!this.platform.is('cordova') || !this.platform.is('mobile')) {
+┊  ┊14┊      return new Promise((resolve, reject) => {
+┊  ┊15┊        try {
+┊  ┊16┊          UploadFS.selectFile((file: File) => {
+┊  ┊17┊            resolve(file);
+┊  ┊18┊          });
+┊  ┊19┊        }
+┊  ┊20┊        catch (e) {
+┊  ┊21┊          reject(e);
+┊  ┊22┊        }
+┊  ┊23┊      });
+┊  ┊24┊    }
+┊  ┊25┊
+┊  ┊26┊    return this.imagePicker.getPictures({maximumImagesCount: 1}).then((URL: string) => {
+┊  ┊27┊      return this.convertURLtoBlob(URL);
+┊  ┊28┊    });
+┊  ┊29┊  }
+┊  ┊30┊
+┊  ┊31┊  convertURLtoBlob(url: string, options = {}): Promise<File> {
+┊  ┊32┊    return new Promise((resolve, reject) => {
+┊  ┊33┊      const image = document.createElement('img');
+┊  ┊34┊
+┊  ┊35┊      image.onload = () => {
+┊  ┊36┊        try {
+┊  ┊37┊          const dataURI = this.convertImageToDataURI(image, options);
+┊  ┊38┊          const blob = this.convertDataURIToBlob(dataURI);
+┊  ┊39┊          const pathname = (new URL(url)).pathname;
+┊  ┊40┊          const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
+┊  ┊41┊          const file = new File([blob], filename);
+┊  ┊42┊
+┊  ┊43┊          resolve(file);
+┊  ┊44┊        }
+┊  ┊45┊        catch (e) {
+┊  ┊46┊          reject(e);
+┊  ┊47┊        }
+┊  ┊48┊      };
+┊  ┊49┊
+┊  ┊50┊      image.src = url;
+┊  ┊51┊    });
+┊  ┊52┊  }
+┊  ┊53┊
+┊  ┊54┊  convertImageToDataURI(image: HTMLImageElement, {MAX_WIDTH = 400, MAX_HEIGHT = 400} = {}): string {
+┊  ┊55┊    // Create an empty canvas element
+┊  ┊56┊    const canvas = document.createElement('canvas');
+┊  ┊57┊
+┊  ┊58┊    var width = image.width, height = image.height;
+┊  ┊59┊
+┊  ┊60┊    if (width > height) {
+┊  ┊61┊      if (width > MAX_WIDTH) {
+┊  ┊62┊        height *= MAX_WIDTH / width;
+┊  ┊63┊        width = MAX_WIDTH;
+┊  ┊64┊      }
+┊  ┊65┊    } else {
+┊  ┊66┊      if (height > MAX_HEIGHT) {
+┊  ┊67┊        width *= MAX_HEIGHT / height;
+┊  ┊68┊        height = MAX_HEIGHT;
+┊  ┊69┊      }
+┊  ┊70┊    }
+┊  ┊71┊
+┊  ┊72┊    canvas.width = width;
+┊  ┊73┊    canvas.height = height;
+┊  ┊74┊
+┊  ┊75┊    // Copy the image contents to the canvas
+┊  ┊76┊    const context = canvas.getContext('2d');
+┊  ┊77┊    context.drawImage(image, 0, 0, width, height);
+┊  ┊78┊
+┊  ┊79┊    // Get the data-URL formatted image
+┊  ┊80┊    // Firefox supports PNG and JPEG. You could check image.src to
+┊  ┊81┊    // guess the original format, but be aware the using 'image/jpg'
+┊  ┊82┊    // will re-encode the image.
+┊  ┊83┊    const dataURL = canvas.toDataURL('image/png');
+┊  ┊84┊
+┊  ┊85┊    return dataURL.replace(/^data:image\/(png|jpg);base64,/, '');
+┊  ┊86┊  }
+┊  ┊87┊
+┊  ┊88┊  convertDataURIToBlob(dataURI): Blob {
+┊  ┊89┊    const binary = atob(dataURI);
+┊  ┊90┊
+┊  ┊91┊    // Write the bytes of the string to a typed array
+┊  ┊92┊    const charCodes = Object.keys(binary)
+┊  ┊93┊      .map<number>(Number)
+┊  ┊94┊      .map<number>(binary.charCodeAt.bind(binary));
+┊  ┊95┊
+┊  ┊96┊    // Build blob with typed array
+┊  ┊97┊    return new Blob([new Uint8Array(charCodes)], {type: 'image/jpeg'});
+┊  ┊98┊  }
+┊  ┊99┊}
```

[}]: #

In order to use the service we will need to import it in the app's `NgModule` as a `provider`:

[{]: <helper> (diffStep "13.6")

#### [Step 13.6: Import PictureService](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/d311cbdb)

##### Changed src&#x2F;app&#x2F;app.module.ts
```diff
@@ -18,6 +18,7 @@
 ┊18┊18┊import { ProfilePage } from '../pages/profile/profile';
 ┊19┊19┊import { VerificationPage } from '../pages/verification/verification';
 ┊20┊20┊import { PhoneService } from '../services/phone';
+┊  ┊21┊import { PictureService } from '../services/picture';
 ┊21┊22┊import { MyApp } from './app.component';
 ┊22┊23┊
 ┊23┊24┊@NgModule({
```
```diff
@@ -62,7 +63,8 @@
 ┊62┊63┊    Geolocation,
 ┊63┊64┊    {provide: ErrorHandler, useClass: IonicErrorHandler},
 ┊64┊65┊    PhoneService,
-┊65┊  ┊    ImagePicker
+┊  ┊66┊    ImagePicker,
+┊  ┊67┊    PictureService
 ┊66┊68┊  ]
 ┊67┊69┊})
 ┊68┊70┊export class AppModule {}
```

[}]: #

Since now we will be sending pictures, we will need to update the message schema to support picture typed messages:

[{]: <helper> (diffStep "13.7")

#### [Step 13.7: Added picture message type](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/7663f0a4)

##### Changed api&#x2F;server&#x2F;models.ts
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

[{]: <helper> (diffStep "13.8")

#### [Step 13.8: Implement sendPicture method](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/fd56e133)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages-attachments.ts
```diff
@@ -2,6 +2,7 @@
 ┊2┊2┊import { ModalController, ViewController } from 'ionic-angular';
 ┊3┊3┊import { NewLocationMessageComponent } from './location-message';
 ┊4┊4┊import { MessageType } from 'api/models';
+┊ ┊5┊import { PictureService } from '../../services/picture';
 ┊5┊6┊
 ┊6┊7┊@Component({
 ┊7┊8┊  selector: 'messages-attachments',
```
```diff
@@ -10,9 +11,19 @@
 ┊10┊11┊export class MessagesAttachmentsComponent {
 ┊11┊12┊  constructor(
 ┊12┊13┊    private viewCtrl: ViewController,
-┊13┊  ┊    private modelCtrl: ModalController
+┊  ┊14┊    private modelCtrl: ModalController,
+┊  ┊15┊    private pictureService: PictureService
 ┊14┊16┊  ) {}
 ┊15┊17┊
+┊  ┊18┊  sendPicture(): void {
+┊  ┊19┊    this.pictureService.select().then((file: File) => {
+┊  ┊20┊      this.viewCtrl.dismiss({
+┊  ┊21┊        messageType: MessageType.PICTURE,
+┊  ┊22┊        selectedPicture: file
+┊  ┊23┊      });
+┊  ┊24┊    });
+┊  ┊25┊  }
+┊  ┊26┊
 ┊16┊27┊  sendLocation(): void {
 ┊17┊28┊    const locationModal = this.modelCtrl.create(NewLocationMessageComponent);
 ┊18┊29┊    locationModal.onDidDismiss((location) => {
```

[}]: #

And we will bind that handler to the view, so whenever we press the right button, the handler will be invoked with the selected picture:

[{]: <helper> (diffStep "13.9")

#### [Step 13.9: Bind click event for sendPicture](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/6f6a8a8d)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages-attachments.html
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

[{]: <helper> (diffStep "13.10")

#### [Step 13.10: Implement the actual send of picture message](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/164a4836)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.ts
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
+┊   ┊242┊          const blob: File = params.selectedPicture;
+┊   ┊243┊          this.sendPictureMessage(blob);
+┊   ┊244┊        }
 ┊239┊245┊      }
 ┊240┊246┊    });
 ┊241┊247┊
 ┊242┊248┊    popover.present();
 ┊243┊249┊  }
 ┊244┊250┊
+┊   ┊251┊  sendPictureMessage(blob: File): void {
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

[{]: <helper> (diffStep "13.11")

#### [Step 13.11: Create stub method for upload method](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/4d496fd4)

##### Changed src&#x2F;services&#x2F;picture.ts
```diff
@@ -28,6 +28,10 @@
 ┊28┊28┊    });
 ┊29┊29┊  }
 ┊30┊30┊
+┊  ┊31┊  upload(blob: File): Promise<any> {
+┊  ┊32┊    return Promise.resolve();
+┊  ┊33┊  }
+┊  ┊34┊
 ┊31┊35┊  convertURLtoBlob(url: string, options = {}): Promise<File> {
 ┊32┊36┊    return new Promise((resolve, reject) => {
 ┊33┊37┊      const image = document.createElement('img');
```

[}]: #

## Server Side

So as we said, need to handle storage of pictures that were sent by the client. First, we will create a `Picture` model so the compiler can recognize a picture object:

[{]: <helper> (diffStep "13.12")

#### [Step 13.12: Create Picture model](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/a69c3725)

##### Changed api&#x2F;server&#x2F;models.ts
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

    $ npm install --save sharp

> We used to use `meteor npm` and not `npm` because we wanted to make sure that `sharp` is compatible with the server. Unfortunately it recently started to break `Ionic`: `Error: Cannot find module '@angular/tsc-wrapped/src/tsc'`. If you use a `node` version compatible with our Meteor version (`node` 1.8 should be compatible with Meteor 1.6) then everything will be fine, otherwise it will break `sharp`.

> We also used to run the previous command from the `api` directory, otherwise Meteor would have compiled `sharp` for the system Meteor version and not the project one. Since we cannot use `meteor npm` anymore let's stick to the root directory instead.

> Since `sharp` bundles a binary version of `libvips`, depending on your distro you may need to install a packaged version of `vips` in order to get it working.
> For example on Arch Linux you will need to install `vips` from AUR.

Now we will create a picture store which will compress pictures using `sharp` right before they are inserted into the data-base:

[{]: <helper> (diffStep "13.14")

#### [Step 13.14: Create pictures store](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/9c6be46a)

##### Added api&#x2F;server&#x2F;collections&#x2F;pictures.ts
```diff
@@ -0,0 +1,43 @@
+┊  ┊ 1┊import { MongoObservable } from 'meteor-rxjs';
+┊  ┊ 2┊import { UploadFS } from 'meteor/jalik:ufs';
+┊  ┊ 3┊import { Meteor } from 'meteor/meteor';
+┊  ┊ 4┊import * as sharp from 'sharp';
+┊  ┊ 5┊import { Picture, DEFAULT_PICTURE_URL } from '../models';
+┊  ┊ 6┊
+┊  ┊ 7┊export interface PicturesCollection<T> extends MongoObservable.Collection<T> {
+┊  ┊ 8┊  getPictureUrl(selector?: Object | string, platform?: string): string;
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
+┊  ┊26┊    // Resize picture, then crop it to 1:1 aspect ratio, then compress it to 75% from its original quality
+┊  ┊27┊    const transform = sharp().resize(800,800).min().crop().toFormat('jpeg', {quality: 75});
+┊  ┊28┊    from.pipe(transform).pipe(to);
+┊  ┊29┊  }
+┊  ┊30┊});
+┊  ┊31┊
+┊  ┊32┊// Gets picture's url by a given selector
+┊  ┊33┊Pictures.getPictureUrl = function (selector, platform = "") {
+┊  ┊34┊  const prefix = platform === "android" ? "/android_asset/www" :
+┊  ┊35┊    platform === "ios" ? "" : "";
+┊  ┊36┊
+┊  ┊37┊  const picture = this.findOne(selector) || {};
+┊  ┊38┊  return picture.url || prefix + DEFAULT_PICTURE_URL;
+┊  ┊39┊};
+┊  ┊40┊
+┊  ┊41┊function picturesPermissions(userId: string): boolean {
+┊  ┊42┊  return Meteor.isServer || !!userId;
+┊  ┊43┊}
```

[}]: #

You can look at a store as some sort of a wrapper for a collection, which will run different kind of a operations before it mutates it or fetches data from it. Note that we used `GridFS` because this way an uploaded file is split into multiple packets, which is more efficient for storage. We also defined a small utility function on that store which will retrieve a profile picture. If the ID was not found, it will return a link for the default picture. To make things convenient, we will also export the store from the `index` file:

[{]: <helper> (diffStep "13.15")

#### [Step 13.15: Export pictures collection](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/70e20190)

##### Changed api&#x2F;server&#x2F;collections&#x2F;index.ts
```diff
@@ -1,3 +1,4 @@
 ┊1┊1┊export * from './chats';
 ┊2┊2┊export * from './messages';
 ┊3┊3┊export * from './users';
+┊ ┊4┊export * from './pictures';
```

[}]: #

Now that we have the pictures store, and the server knows how to handle uploaded pictures, we will implement the `upload` stub in the `PictureService`:

[{]: <helper> (diffStep "13.16")

#### [Step 13.16: Implement upload method](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/decc1148)

##### Changed src&#x2F;services&#x2F;picture.ts
```diff
@@ -2,6 +2,9 @@
 ┊ 2┊ 2┊import { Platform } from 'ionic-angular';
 ┊ 3┊ 3┊import { ImagePicker } from '@ionic-native/image-picker';
 ┊ 4┊ 4┊import { UploadFS } from 'meteor/jalik:ufs';
+┊  ┊ 5┊import { PicturesStore } from 'api/collections';
+┊  ┊ 6┊import * as _ from 'lodash';
+┊  ┊ 7┊import { DEFAULT_PICTURE_URL } from 'api/models';
 ┊ 5┊ 8┊
 ┊ 6┊ 9┊@Injectable()
 ┊ 7┊10┊export class PictureService {
```
```diff
@@ -29,7 +32,23 @@
 ┊29┊32┊  }
 ┊30┊33┊
 ┊31┊34┊  upload(blob: File): Promise<any> {
-┊32┊  ┊    return Promise.resolve();
+┊  ┊35┊    return new Promise((resolve, reject) => {
+┊  ┊36┊      const metadata: any = _.pick(blob, 'name', 'type', 'size');
+┊  ┊37┊
+┊  ┊38┊      if (!metadata.name) {
+┊  ┊39┊        metadata.name = DEFAULT_PICTURE_URL;
+┊  ┊40┊      }
+┊  ┊41┊
+┊  ┊42┊      const upload = new UploadFS.Uploader({
+┊  ┊43┊        data: blob,
+┊  ┊44┊        file: metadata,
+┊  ┊45┊        store: PicturesStore,
+┊  ┊46┊        onComplete: resolve,
+┊  ┊47┊        onError: reject
+┊  ┊48┊      });
+┊  ┊49┊
+┊  ┊50┊      upload.start();
+┊  ┊51┊    });
 ┊33┊52┊  }
 ┊34┊53┊
 ┊35┊54┊  convertURLtoBlob(url: string, options = {}): Promise<File> {
```

[}]: #

Since `sharp` is a server-only package, and it is not supported by the client, at all, we will replace it with an empty dummy-object so errors won't occur. This requires us to change the `Webpack` config as shown below:

[{]: <helper> (diffStep "13.17")

#### [Step 13.17: Ignore sharp package on client side](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/860bf9cb)

##### Changed webpack.config.js
```diff
@@ -81,6 +81,9 @@
 ┊81┊81┊  },
 ┊82┊82┊
 ┊83┊83┊  externals: [
+┊  ┊84┊    {
+┊  ┊85┊      sharp: '{}'
+┊  ┊86┊    },
 ┊84┊87┊    resolveExternals
 ┊85┊88┊  ],
```

[}]: #

## View Picture Messages

We will now add the support for picture typed messages in the `MessagesPage`, so whenever we send a picture, we will be able to see them in the messages list like any other message:

[{]: <helper> (diffStep "13.18")

#### [Step 13.18: Added view for picture message](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/56515213)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.html
```diff
@@ -24,6 +24,7 @@
 ┊24┊24┊              <agm-marker [latitude]="getLocation(message.content).lat" [longitude]="getLocation(message.content).lng"></agm-marker>
 ┊25┊25┊            </agm-map>
 ┊26┊26┊          </div>
+┊  ┊27┊          <img *ngIf="message.type == 'picture'" (click)="showPicture($event)" class="message-content message-content-picture" [src]="message.content">
 ┊27┊28┊
 ┊28┊29┊          <span class="message-timestamp">{{ message.createdAt | amDateFormat: 'HH:mm' }}</span>
 ┊29┊30┊        </div>
```

[}]: #

As you can see, we also bound the picture message to the `click` event, which means that whenever we click on it, a picture viewer should be opened with the clicked picture. Let's create the component for that picture viewer:

[{]: <helper> (diffStep "13.19")

#### [Step 13.19: Create show picture component](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/e1bf4f9f)

##### Added src&#x2F;pages&#x2F;messages&#x2F;show-picture.ts
```diff
@@ -0,0 +1,14 @@
+┊  ┊ 1┊import { Component } from '@angular/core';
+┊  ┊ 2┊import { NavParams } from 'ionic-angular';
+┊  ┊ 3┊
+┊  ┊ 4┊@Component({
+┊  ┊ 5┊  selector: 'show-picture',
+┊  ┊ 6┊  templateUrl: 'show-picture.html'
+┊  ┊ 7┊})
+┊  ┊ 8┊export class ShowPictureComponent {
+┊  ┊ 9┊  pictureSrc: string;
+┊  ┊10┊
+┊  ┊11┊  constructor(private navParams: NavParams) {
+┊  ┊12┊    this.pictureSrc = this.navParams.get('pictureSrc');
+┊  ┊13┊  }
+┊  ┊14┊}
```

[}]: #

[{]: <helper> (diffStep "13.20")

#### [Step 13.20: Create show picture template](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/911c26a8)

##### Added src&#x2F;pages&#x2F;messages&#x2F;show-picture.html
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

[{]: <helper> (diffStep "13.21")

#### [Step 13.21: Create show pictuer component styles](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/951c5ad8)

##### Added src&#x2F;pages&#x2F;messages&#x2F;show-picture.scss
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

[{]: <helper> (diffStep "13.22")

#### [Step 13.22: Import ShowPictureComponent](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/a0859683)

##### Changed src&#x2F;app&#x2F;app.module.ts
```diff
@@ -15,6 +15,7 @@
 ┊15┊15┊import { MessagesAttachmentsComponent } from '../pages/messages/messages-attachments';
 ┊16┊16┊import { MessagesOptionsComponent } from '../pages/messages/messages-options';
 ┊17┊17┊import { NewLocationMessageComponent } from '../pages/messages/location-message';
+┊  ┊18┊import { ShowPictureComponent } from '../pages/messages/show-picture';
 ┊18┊19┊import { ProfilePage } from '../pages/profile/profile';
 ┊19┊20┊import { VerificationPage } from '../pages/verification/verification';
 ┊20┊21┊import { PhoneService } from '../services/phone';
```
```diff
@@ -33,7 +34,8 @@
 ┊33┊34┊    NewChatComponent,
 ┊34┊35┊    MessagesOptionsComponent,
 ┊35┊36┊    MessagesAttachmentsComponent,
-┊36┊  ┊    NewLocationMessageComponent
+┊  ┊37┊    NewLocationMessageComponent,
+┊  ┊38┊    ShowPictureComponent
 ┊37┊39┊  ],
 ┊38┊40┊  imports: [
 ┊39┊41┊    BrowserModule,
```
```diff
@@ -55,7 +57,8 @@
 ┊55┊57┊    NewChatComponent,
 ┊56┊58┊    MessagesOptionsComponent,
 ┊57┊59┊    MessagesAttachmentsComponent,
-┊58┊  ┊    NewLocationMessageComponent
+┊  ┊60┊    NewLocationMessageComponent,
+┊  ┊61┊    ShowPictureComponent
 ┊59┊62┊  ],
 ┊60┊63┊  providers: [
 ┊61┊64┊    StatusBar,
```

[}]: #

And now that we have that component ready, we will implement the `showPicture` method in the `MessagesPage` component, which will create a new instance of the `ShowPictureComponent`:

[{]: <helper> (diffStep "13.23")

#### [Step 13.23: Implement showPicture method](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/8a6eef6e)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.ts
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

[{]: <helper> (diffStep "13.24")

#### [Step 13.24: Add pictureId property to Profile](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/5ede9f83)

##### Changed api&#x2F;server&#x2F;models.ts
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

[{]: <helper> (diffStep "13.25")

#### [Step 13.25: Add event for changing profile picture](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/be2cf51e)

##### Changed src&#x2F;pages&#x2F;profile&#x2F;profile.html
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

[{]: <helper> (diffStep "13.26")

#### [Step 13.26: Implement pick, update and set of profile image](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/b0c2fd99)

##### Changed src&#x2F;pages&#x2F;profile&#x2F;profile.ts
```diff
@@ -1,8 +1,10 @@
 ┊ 1┊ 1┊import { Component, OnInit } from '@angular/core';
 ┊ 2┊ 2┊import { Profile } from 'api/models';
-┊ 3┊  ┊import { AlertController, NavController } from 'ionic-angular';
+┊  ┊ 3┊import { AlertController, NavController, Platform } from 'ionic-angular';
 ┊ 4┊ 4┊import { MeteorObservable } from 'meteor-rxjs';
 ┊ 5┊ 5┊import { ChatsPage } from '../chats/chats';
+┊  ┊ 6┊import { PictureService } from '../../services/picture';
+┊  ┊ 7┊import { Pictures } from 'api/collections';
 ┊ 6┊ 8┊
 ┊ 7┊ 9┊@Component({
 ┊ 8┊10┊  selector: 'profile',
```
```diff
@@ -14,13 +16,42 @@
 ┊14┊16┊
 ┊15┊17┊  constructor(
 ┊16┊18┊    private alertCtrl: AlertController,
-┊17┊  ┊    private navCtrl: NavController
+┊  ┊19┊    private navCtrl: NavController,
+┊  ┊20┊    private pictureService: PictureService,
+┊  ┊21┊    private platform: Platform
 ┊18┊22┊  ) {}
 ┊19┊23┊
 ┊20┊24┊  ngOnInit(): void {
 ┊21┊25┊    this.profile = Meteor.user().profile || {
 ┊22┊26┊      name: ''
 ┊23┊27┊    };
+┊  ┊28┊
+┊  ┊29┊    MeteorObservable.subscribe('user').subscribe(() => {
+┊  ┊30┊      let platform = this.platform.is('android') ? "android" :
+┊  ┊31┊        this.platform.is('ios') ? "ios" : "";
+┊  ┊32┊      platform = this.platform.is('cordova') ? platform : "";
+┊  ┊33┊
+┊  ┊34┊      this.picture = Pictures.getPictureUrl(this.profile.pictureId, platform);
+┊  ┊35┊    });
+┊  ┊36┊  }
+┊  ┊37┊
+┊  ┊38┊  selectProfilePicture(): void {
+┊  ┊39┊    this.pictureService.select().then((blob) => {
+┊  ┊40┊      this.uploadProfilePicture(blob);
+┊  ┊41┊    })
+┊  ┊42┊      .catch((e) => {
+┊  ┊43┊        this.handleError(e);
+┊  ┊44┊      });
+┊  ┊45┊  }
+┊  ┊46┊
+┊  ┊47┊  uploadProfilePicture(blob: File): void {
+┊  ┊48┊    this.pictureService.upload(blob).then((picture) => {
+┊  ┊49┊      this.profile.pictureId = picture._id;
+┊  ┊50┊      this.picture = picture.url;
+┊  ┊51┊    })
+┊  ┊52┊      .catch((e) => {
+┊  ┊53┊        this.handleError(e);
+┊  ┊54┊      });
 ┊24┊55┊  }
 ┊25┊56┊
 ┊26┊57┊  updateProfile(): void {
```

[}]: #

We will also define a new hook in the `Meteor.users` collection so whenever we update the profile picture, the previous one will be removed from the data-base. This way we won't have some unnecessary data in our data-base, which will save us some precious storage:

[{]: <helper> (diffStep "13.27")

#### [Step 13.27: Add after hook for user modification](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/87373411)

##### Changed api&#x2F;server&#x2F;collections&#x2F;users.ts
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
+┊  ┊14┊  Pictures.collection.remove({ _id: this.previous.profile.pictureId });
+┊  ┊15┊}, { fetchPrevious: true });
```

[}]: #

Collection hooks are not part of `Meteor`'s official API and are added through a third-party package called `matb33:collection-hooks`. This requires us to install the necessary type definition:

    $ npm install --save-dev @types/meteor-collection-hooks

Now we need to import the type definition we've just installed in the `tsconfig.json` file:

[{]: <helper> (diffStep "13.29")

#### [Step 13.29: Import meteor-collection-hooks typings](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/11dee0c0)

##### Changed api&#x2F;tsconfig.json
```diff
@@ -18,7 +18,8 @@
 ┊18┊18┊    "types": [
 ┊19┊19┊      "@types/meteor",
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
@@ -21,7 +21,8 @@
 ┊21┊21┊    "noImplicitAny": false,
 ┊22┊22┊    "types": [
 ┊23┊23┊      "@types/meteor",
-┊24┊  ┊      "@types/meteor-accounts-phone"
+┊  ┊24┊      "@types/meteor-accounts-phone",
+┊  ┊25┊      "@types/meteor-collection-hooks"
 ┊25┊26┊    ]
 ┊26┊27┊  },
 ┊27┊28┊  "include": [
```

[}]: #

We now add a `user` publication which should be subscribed whenever we initialize the `ProfilePage`. This subscription should fetch some data from other collections which is related to the user which is currently logged in; And to be more specific, the document associated with the `profileId` defined in the `User` model:

[{]: <helper> (diffStep "13.30")

#### [Step 13.30: Add user publication](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/029b7d6a)

##### Changed api&#x2F;server&#x2F;publications.ts
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

[{]: <helper> (diffStep "13.31")

#### [Step 13.31: Added images to users publication](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/40c9a2c8)

##### Changed api&#x2F;server&#x2F;publications.ts
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

[{]: <helper> (diffStep "13.32")

#### [Step 13.32: Add images to chats publication](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/6ee435ff)

##### Changed api&#x2F;server&#x2F;publications.ts
```diff
@@ -80,7 +80,16 @@
 ┊80┊80┊          }, {
 ┊81┊81┊            fields: { profile: 1 }
 ┊82┊82┊          });
-┊83┊  ┊        }
+┊  ┊83┊        },
+┊  ┊84┊        children: [
+┊  ┊85┊          <PublishCompositeConfig2<Chat, User, Picture>> {
+┊  ┊86┊            find: (user, chat) => {
+┊  ┊87┊              return Pictures.collection.find(user.profile.pictureId, {
+┊  ┊88┊                fields: { url: 1 }
+┊  ┊89┊              });
+┊  ┊90┊            }
+┊  ┊91┊          }
+┊  ┊92┊        ]
 ┊84┊93┊      }
 ┊85┊94┊    ]
 ┊86┊95┊  };
```

[}]: #

Since we already set up some collection hooks on the users collection, we can take it a step further by defining collection hooks on the chat collection, so whenever a chat is being removed, all its corresponding messages will be removed as well:

[{]: <helper> (diffStep "13.33")

#### [Step 13.33: Add hook for removing unused messages](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/9ee38563)

##### Changed api&#x2F;server&#x2F;collections&#x2F;chats.ts
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

[{]: <helper> (diffStep "13.34")

#### [Step 13.34: Allow updating pictureId](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/b6f23f74)

##### Changed api&#x2F;server&#x2F;methods.ts
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

[{]: <helper> (diffStep "13.35")

#### [Step 13.35: Update creation of users stubs](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/1819a87b)

##### Changed api&#x2F;server&#x2F;main.ts
```diff
@@ -1,4 +1,5 @@
 ┊1┊1┊import { Meteor } from 'meteor/meteor';
+┊ ┊2┊import { Picture } from './models';
 ┊2┊3┊import { Accounts } from 'meteor/accounts-base';
 ┊3┊4┊import { Users } from './collections/users';
 ┊4┊5┊
```
```diff
@@ -12,43 +13,74 @@
 ┊12┊13┊    return;
 ┊13┊14┊  }
 ┊14┊15┊
+┊  ┊16┊  let picture = importPictureFromUrl({
+┊  ┊17┊    name: 'man1.jpg',
+┊  ┊18┊    url: 'https://randomuser.me/api/portraits/men/1.jpg'
+┊  ┊19┊  });
+┊  ┊20┊
 ┊15┊21┊  Accounts.createUserWithPhone({
 ┊16┊22┊    phone: '+972540000001',
 ┊17┊23┊    profile: {
 ┊18┊24┊      name: 'Ethan Gonzalez',
-┊19┊  ┊      picture: 'https://randomuser.me/api/portraits/men/1.jpg'
+┊  ┊25┊      pictureId: picture._id
 ┊20┊26┊    }
 ┊21┊27┊  });
 ┊22┊28┊
+┊  ┊29┊  picture = importPictureFromUrl({
+┊  ┊30┊    name: 'lego1.jpg',
+┊  ┊31┊    url: 'https://randomuser.me/api/portraits/lego/1.jpg'
+┊  ┊32┊  });
+┊  ┊33┊
 ┊23┊34┊  Accounts.createUserWithPhone({
 ┊24┊35┊    phone: '+972540000002',
 ┊25┊36┊    profile: {
 ┊26┊37┊      name: 'Bryan Wallace',
-┊27┊  ┊      picture: 'https://randomuser.me/api/portraits/lego/1.jpg'
+┊  ┊38┊      pictureId: picture._id
 ┊28┊39┊    }
 ┊29┊40┊  });
 ┊30┊41┊
+┊  ┊42┊  picture = importPictureFromUrl({
+┊  ┊43┊    name: 'woman1.jpg',
+┊  ┊44┊    url: 'https://randomuser.me/api/portraits/women/1.jpg'
+┊  ┊45┊  });
+┊  ┊46┊
 ┊31┊47┊  Accounts.createUserWithPhone({
 ┊32┊48┊    phone: '+972540000003',
 ┊33┊49┊    profile: {
 ┊34┊50┊      name: 'Avery Stewart',
-┊35┊  ┊      picture: 'https://randomuser.me/api/portraits/women/1.jpg'
+┊  ┊51┊      pictureId: picture._id
 ┊36┊52┊    }
 ┊37┊53┊  });
 ┊38┊54┊
+┊  ┊55┊  picture = importPictureFromUrl({
+┊  ┊56┊    name: 'woman2.jpg',
+┊  ┊57┊    url: 'https://randomuser.me/api/portraits/women/2.jpg'
+┊  ┊58┊  });
+┊  ┊59┊
 ┊39┊60┊  Accounts.createUserWithPhone({
 ┊40┊61┊    phone: '+972540000004',
 ┊41┊62┊    profile: {
 ┊42┊63┊      name: 'Katie Peterson',
-┊43┊  ┊      picture: 'https://randomuser.me/api/portraits/women/2.jpg'
+┊  ┊64┊      pictureId: picture._id
 ┊44┊65┊    }
 ┊45┊66┊  });
 ┊46┊67┊
+┊  ┊68┊  picture = importPictureFromUrl({
+┊  ┊69┊    name: 'man2.jpg',
+┊  ┊70┊    url: 'https://randomuser.me/api/portraits/men/2.jpg'
+┊  ┊71┊  });
+┊  ┊72┊
 ┊47┊73┊  Accounts.createUserWithPhone({
 ┊48┊74┊    phone: '+972540000005',
 ┊49┊75┊    profile: {
 ┊50┊76┊      name: 'Ray Edwards',
-┊51┊  ┊      picture: 'https://randomuser.me/api/portraits/men/2.jpg'
+┊  ┊77┊      pictureId: picture._id
 ┊52┊78┊    }
 ┊53┊79┊  });
 ┊54┊80┊});
+┊  ┊81┊
+┊  ┊82┊function importPictureFromUrl(options: { name: string, url: string }): Picture {
+┊  ┊83┊  const description = { name: options.name };
+┊  ┊84┊
+┊  ┊85┊  return Meteor.call('ufsImportURL', options.url, description, 'pictures');
+┊  ┊86┊}
```

[}]: #

In order for `ufs-gridfs` to work properly on Android we need to specify how the client is supposed to reach the backend and how to generate the URLs when importing the images:

[{]: <helper> (diffStep "13.36")

#### [Step 13.36: Set ROOT_URL environmental parameter before launching Meteor](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/86d74421)

##### Changed package.json
```diff
@@ -9,7 +9,8 @@
 ┊ 9┊ 9┊    "url": "https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp.git"
 ┊10┊10┊  },
 ┊11┊11┊  "scripts": {
-┊12┊  ┊    "api": "cd api && meteor run --settings private/settings.json",
+┊  ┊12┊    "api": "cd api && export ROOT_URL=http://meteor.linuxsystems.it:3000 && meteor run --settings private/settings.json",
+┊  ┊13┊    "api:reset": "cd api && meteor reset",
 ┊13┊14┊    "clean": "ionic-app-scripts clean",
 ┊14┊15┊    "build": "ionic-app-scripts build",
 ┊15┊16┊    "lint": "ionic-app-scripts lint",
```

[}]: #

> You will have to change `meteor.linuxsystems.it` with your own IP or at least put an entry for it into your `/etc/hosts`.

To avoid some unexpected behaviors, we will reset our data-base so our server can re-fabricate the data:

    $ npm run meteor:reset

> *NOTE*: we used `$ npm run meteor:reset` instead of `api$ meteor reset` because we need to set the environmental variable to let ufs generate the right URLs during the initial importation.

We will now update the `ChatsPage` to add the belonging picture for each chat during transformation:

[{]: <helper> (diffStep "13.37")

#### [Step 13.37: Fetch user image from server](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/123b9972)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;chats.ts
```diff
@@ -1,7 +1,7 @@
 ┊1┊1┊import { Component, OnInit } from '@angular/core';
-┊2┊ ┊import { Chats, Messages, Users } from 'api/collections';
+┊ ┊2┊import { Chats, Messages, Users, Pictures } from 'api/collections';
 ┊3┊3┊import { Chat, Message } from 'api/models';
-┊4┊ ┊import { NavController, PopoverController, ModalController, AlertController } from 'ionic-angular';
+┊ ┊4┊import { NavController, PopoverController, ModalController, AlertController, Platform } from 'ionic-angular';
 ┊5┊5┊import { MeteorObservable } from 'meteor-rxjs';
 ┊6┊6┊import { Observable, Subscriber } from 'rxjs';
 ┊7┊7┊import { MessagesPage } from '../messages/messages';
```
```diff
@@ -19,7 +19,8 @@
 ┊19┊19┊    private navCtrl: NavController,
 ┊20┊20┊    private popoverCtrl: PopoverController,
 ┊21┊21┊    private modalCtrl: ModalController,
-┊22┊  ┊    private alertCtrl: AlertController) {
+┊  ┊22┊    private alertCtrl: AlertController,
+┊  ┊23┊    private platform: Platform) {
 ┊23┊24┊    this.senderId = Meteor.userId();
 ┊24┊25┊  }
 ┊25┊26┊
```
```diff
@@ -48,7 +49,12 @@
 ┊48┊49┊
 ┊49┊50┊        if (receiver) {
 ┊50┊51┊          chat.title = receiver.profile.name;
-┊51┊  ┊          chat.picture = receiver.profile.picture;
+┊  ┊52┊
+┊  ┊53┊          let platform = this.platform.is('android') ? "android" :
+┊  ┊54┊            this.platform.is('ios') ? "ios" : "";
+┊  ┊55┊          platform = this.platform.is('cordova') ? platform : "";
+┊  ┊56┊
+┊  ┊57┊          chat.picture = Pictures.getPictureUrl(receiver.profile.pictureId, platform);
 ┊52┊58┊        }
 ┊53┊59┊
 ┊54┊60┊        // This will make the last message reactive
```

[}]: #

And we will do the same in the `NewChatComponent`:

[{]: <helper> (diffStep "13.38")

#### [Step 13.38: Use the new pictureId field for new chat modal](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/0ab346cf)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;new-chat.html
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

[{]: <helper> (diffStep "13.39")

#### [Step 13.39: Implement getPic](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/9fceb54d)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;new-chat.ts
```diff
@@ -1,7 +1,7 @@
 ┊1┊1┊import { Component, OnInit } from '@angular/core';
-┊2┊ ┊import { Chats, Users } from 'api/collections';
+┊ ┊2┊import { Chats, Users, Pictures } from 'api/collections';
 ┊3┊3┊import { User } from 'api/models';
-┊4┊ ┊import { AlertController, ViewController } from 'ionic-angular';
+┊ ┊4┊import { AlertController, Platform, ViewController } from 'ionic-angular';
 ┊5┊5┊import { MeteorObservable } from 'meteor-rxjs';
 ┊6┊6┊import * as _ from 'lodash';
 ┊7┊7┊import { Observable, Subscription, BehaviorSubject } from 'rxjs';
```
```diff
@@ -18,7 +18,8 @@
 ┊18┊18┊
 ┊19┊19┊  constructor(
 ┊20┊20┊    private alertCtrl: AlertController,
-┊21┊  ┊    private viewCtrl: ViewController
+┊  ┊21┊    private viewCtrl: ViewController,
+┊  ┊22┊    private platform: Platform
 ┊22┊23┊  ) {
 ┊23┊24┊    this.senderId = Meteor.userId();
 ┊24┊25┊    this.searchPattern = new BehaviorSubject(undefined);
```
```diff
@@ -107,4 +108,12 @@
 ┊107┊108┊
 ┊108┊109┊    alert.present();
 ┊109┊110┊  }
+┊   ┊111┊
+┊   ┊112┊  getPic(pictureId): string {
+┊   ┊113┊    let platform = this.platform.is('android') ? "android" :
+┊   ┊114┊      this.platform.is('ios') ? "ios" : "";
+┊   ┊115┊    platform = this.platform.is('cordova') ? platform : "";
+┊   ┊116┊
+┊   ┊117┊    return Pictures.getPictureUrl(pictureId, platform);
+┊   ┊118┊  }
 ┊110┊119┊}
```

[}]: #

[{]: <helper> (navStep nextRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/native-mobile" prevRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/google-maps")

| [< Previous Step](https://angular-meteor.com/tutorials/whatsapp2/ionic/google-maps) | [Next Step >](https://angular-meteor.com/tutorials/whatsapp2/ionic/native-mobile) |
|:--------------------------------|--------------------------------:|

[}]: #

