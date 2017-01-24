# Step 12: File Upload &amp; Images

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

[{]: <helper> (diffStep 12.3)

#### [Step 12.3: Create PictureService with utils for files](../../../../commit/2e268ad)
<br>
##### Added src&#x2F;services&#x2F;picture.ts
<pre>
<i>@@ -0,0 +1,80 @@</i>
<b>+┊  ┊ 1┊import { Injectable } from &#x27;@angular/core&#x27;;</b>
<b>+┊  ┊ 2┊import { Platform } from &#x27;ionic-angular&#x27;;</b>
<b>+┊  ┊ 3┊import { ImagePicker } from &#x27;ionic-native&#x27;;</b>
<b>+┊  ┊ 4┊import { UploadFS } from &#x27;meteor/jalik:ufs&#x27;;</b>
<b>+┊  ┊ 5┊</b>
<b>+┊  ┊ 6┊@Injectable()</b>
<b>+┊  ┊ 7┊export class PictureService {</b>
<b>+┊  ┊ 8┊  constructor(private platform: Platform) {</b>
<b>+┊  ┊ 9┊  }</b>
<b>+┊  ┊10┊</b>
<b>+┊  ┊11┊  select(): Promise&lt;Blob&gt; {</b>
<b>+┊  ┊12┊    if (!this.platform.is(&#x27;cordova&#x27;) || !this.platform.is(&#x27;mobile&#x27;)) {</b>
<b>+┊  ┊13┊      return new Promise((resolve, reject) &#x3D;&gt; {</b>
<b>+┊  ┊14┊        try {</b>
<b>+┊  ┊15┊          UploadFS.selectFile((file: File) &#x3D;&gt; {</b>
<b>+┊  ┊16┊            resolve(file);</b>
<b>+┊  ┊17┊          });</b>
<b>+┊  ┊18┊        }</b>
<b>+┊  ┊19┊        catch (e) {</b>
<b>+┊  ┊20┊          reject(e);</b>
<b>+┊  ┊21┊        }</b>
<b>+┊  ┊22┊      });</b>
<b>+┊  ┊23┊    }</b>
<b>+┊  ┊24┊</b>
<b>+┊  ┊25┊    return ImagePicker.getPictures({maximumImagesCount: 1}).then((URL: string) &#x3D;&gt; {</b>
<b>+┊  ┊26┊      return this.convertURLtoBlob(URL);</b>
<b>+┊  ┊27┊    });</b>
<b>+┊  ┊28┊  }</b>
<b>+┊  ┊29┊</b>
<b>+┊  ┊30┊  convertURLtoBlob(URL: string): Promise&lt;Blob&gt; {</b>
<b>+┊  ┊31┊    return new Promise((resolve, reject) &#x3D;&gt; {</b>
<b>+┊  ┊32┊      const image &#x3D; document.createElement(&#x27;img&#x27;);</b>
<b>+┊  ┊33┊</b>
<b>+┊  ┊34┊      image.onload &#x3D; () &#x3D;&gt; {</b>
<b>+┊  ┊35┊        try {</b>
<b>+┊  ┊36┊          const dataURI &#x3D; this.convertImageToDataURI(image);</b>
<b>+┊  ┊37┊          const blob &#x3D; this.convertDataURIToBlob(dataURI);</b>
<b>+┊  ┊38┊</b>
<b>+┊  ┊39┊          resolve(blob);</b>
<b>+┊  ┊40┊        }</b>
<b>+┊  ┊41┊        catch (e) {</b>
<b>+┊  ┊42┊          reject(e);</b>
<b>+┊  ┊43┊        }</b>
<b>+┊  ┊44┊      };</b>
<b>+┊  ┊45┊</b>
<b>+┊  ┊46┊      image.src &#x3D; URL;</b>
<b>+┊  ┊47┊    });</b>
<b>+┊  ┊48┊  }</b>
<b>+┊  ┊49┊</b>
<b>+┊  ┊50┊  convertImageToDataURI(image: HTMLImageElement): string {</b>
<b>+┊  ┊51┊    // Create an empty canvas element</b>
<b>+┊  ┊52┊    const canvas &#x3D; document.createElement(&#x27;canvas&#x27;);</b>
<b>+┊  ┊53┊    canvas.width &#x3D; image.width;</b>
<b>+┊  ┊54┊    canvas.height &#x3D; image.height;</b>
<b>+┊  ┊55┊</b>
<b>+┊  ┊56┊    // Copy the image contents to the canvas</b>
<b>+┊  ┊57┊    const context &#x3D; canvas.getContext(&#x27;2d&#x27;);</b>
<b>+┊  ┊58┊    context.drawImage(image, 0, 0);</b>
<b>+┊  ┊59┊</b>
<b>+┊  ┊60┊    // Get the data-URL formatted image</b>
<b>+┊  ┊61┊    // Firefox supports PNG and JPEG. You could check image.src to</b>
<b>+┊  ┊62┊    // guess the original format, but be aware the using &#x27;image/jpg&#x27;</b>
<b>+┊  ┊63┊    // will re-encode the image.</b>
<b>+┊  ┊64┊    const dataURL &#x3D; canvas.toDataURL(&#x27;image/png&#x27;);</b>
<b>+┊  ┊65┊</b>
<b>+┊  ┊66┊    return dataURL.replace(/^data:image\/(png|jpg);base64,/, &#x27;&#x27;);</b>
<b>+┊  ┊67┊  }</b>
<b>+┊  ┊68┊</b>
<b>+┊  ┊69┊  convertDataURIToBlob(dataURI): Blob {</b>
<b>+┊  ┊70┊    const binary &#x3D; atob(dataURI);</b>
<b>+┊  ┊71┊</b>
<b>+┊  ┊72┊    // Write the bytes of the string to a typed array</b>
<b>+┊  ┊73┊    const charCodes &#x3D; Object.keys(binary)</b>
<b>+┊  ┊74┊      .map&lt;number&gt;(Number)</b>
<b>+┊  ┊75┊      .map&lt;number&gt;(binary.charCodeAt.bind(binary));</b>
<b>+┊  ┊76┊</b>
<b>+┊  ┊77┊    // Build blob with typed array</b>
<b>+┊  ┊78┊    return new Blob([new Uint8Array(charCodes)], {type: &#x27;image/jpeg&#x27;});</b>
<b>+┊  ┊79┊  }</b>
<b>+┊  ┊80┊}</b>
</pre>

[}]: #

In order to use the service we will need to import it in the app's `NgModule` as a `provider`:

[{]: <helper> (diffStep 12.4)

#### [Step 12.4: Import PictureService](../../../../commit/744bfa7)
<br>
##### Changed src&#x2F;app&#x2F;app.module.ts
<pre>
<i>@@ -13,6 +13,7 @@</i>
 ┊13┊13┊import { ProfilePage } from &#x27;../pages/profile/profile&#x27;;
 ┊14┊14┊import { VerificationPage } from &#x27;../pages/verification/verification&#x27;;
 ┊15┊15┊import { PhoneService } from &#x27;../services/phone&#x27;;
<b>+┊  ┊16┊import { PictureService } from &#x27;../services/picture&#x27;;</b>
 ┊16┊17┊import { MyApp } from &#x27;./app.component&#x27;;
 ┊17┊18┊
 ┊18┊19┊@NgModule({
</pre>
<pre>
<i>@@ -52,7 +53,8 @@</i>
 ┊52┊53┊  ],
 ┊53┊54┊  providers: [
 ┊54┊55┊    {provide: ErrorHandler, useClass: IonicErrorHandler},
<b>+┊  ┊56┊    PhoneService,</b>
<b>+┊  ┊57┊    PictureService</b>
 ┊56┊58┊  ]
 ┊57┊59┊})
 ┊58┊60┊export class AppModule {}
</pre>

[}]: #

Since now we will be sending pictures, we will need to update the message schema to support picture typed messages:

[{]: <helper> (diffStep 12.5)

#### [Step 12.5: Added picture message type](../../../../commit/c55a318)
<br>
##### Changed api&#x2F;server&#x2F;models.ts
<pre>
<i>@@ -7,7 +7,8 @@</i>
 ┊ 7┊ 7┊
 ┊ 8┊ 8┊export enum MessageType {
 ┊ 9┊ 9┊  TEXT &#x3D; &lt;any&gt;&#x27;text&#x27;,
<b>+┊  ┊10┊  LOCATION &#x3D; &lt;any&gt;&#x27;location&#x27;,</b>
<b>+┊  ┊11┊  PICTURE &#x3D; &lt;any&gt;&#x27;picture&#x27;</b>
 ┊11┊12┊}
 ┊12┊13┊
 ┊13┊14┊export interface Chat {
</pre>

[}]: #

In the attachments menu, we will add a new handler for sending pictures, called `sendPicture`:

[{]: <helper> (diffStep 12.6)

#### [Step 12.6: Implement sendPicture method](../../../../commit/580a4bc)
<br>
##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages-attachments.ts
<pre>
<i>@@ -2,6 +2,7 @@</i>
 ┊2┊2┊import { AlertController, Platform, ModalController, ViewController } from &#x27;ionic-angular&#x27;;
 ┊3┊3┊import { NewLocationMessageComponent } from &#x27;./location-message&#x27;;
 ┊4┊4┊import { MessageType } from &#x27;api/models&#x27;;
<b>+┊ ┊5┊import { PictureService } from &#x27;../../services/picture&#x27;;</b>
 ┊5┊6┊
 ┊6┊7┊@Component({
 ┊7┊8┊  selector: &#x27;messages-attachments&#x27;,
</pre>
<pre>
<i>@@ -12,9 +13,19 @@</i>
 ┊12┊13┊    private alertCtrl: AlertController,
 ┊13┊14┊    private platform: Platform,
 ┊14┊15┊    private viewCtrl: ViewController,
<b>+┊  ┊16┊    private modelCtrl: ModalController,</b>
<b>+┊  ┊17┊    private pictureService: PictureService</b>
 ┊16┊18┊  ) {}
 ┊17┊19┊
<b>+┊  ┊20┊  sendPicture(): void {</b>
<b>+┊  ┊21┊    this.pictureService.select().then((file: File) &#x3D;&gt; {</b>
<b>+┊  ┊22┊      this.viewCtrl.dismiss({</b>
<b>+┊  ┊23┊        messageType: MessageType.PICTURE,</b>
<b>+┊  ┊24┊        selectedPicture: file</b>
<b>+┊  ┊25┊      });</b>
<b>+┊  ┊26┊    });</b>
<b>+┊  ┊27┊  }</b>
<b>+┊  ┊28┊</b>
 ┊18┊29┊  sendLocation(): void {
 ┊19┊30┊    const locationModal &#x3D; this.modelCtrl.create(NewLocationMessageComponent);
 ┊20┊31┊    locationModal.onDidDismiss((location) &#x3D;&gt; {
</pre>

[}]: #

And we will bind that handler to the view, so whenever we press the right button, the handler will be invoked with the selected picture:

[{]: <helper> (diffStep 12.7)

#### [Step 12.7: Bind click event for sendPicture](../../../../commit/97fe352)
<br>
##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages-attachments.html
<pre>
<i>@@ -1,6 +1,6 @@</i>
 ┊1┊1┊&lt;ion-content class&#x3D;&quot;messages-attachments-page-content&quot;&gt;
 ┊2┊2┊  &lt;ion-list class&#x3D;&quot;attachments&quot;&gt;
<b>+┊ ┊3┊    &lt;button ion-item class&#x3D;&quot;attachment attachment-gallery&quot; (click)&#x3D;&quot;sendPicture()&quot;&gt;</b>
 ┊4┊4┊      &lt;ion-icon name&#x3D;&quot;images&quot; class&#x3D;&quot;attachment-icon&quot;&gt;&lt;/ion-icon&gt;
 ┊5┊5┊      &lt;div class&#x3D;&quot;attachment-name&quot;&gt;Gallery&lt;/div&gt;
 ┊6┊6┊    &lt;/button&gt;
</pre>

[}]: #

Now we will be extending the `MessagesPage`, by adding a method which will send the picture selected in the attachments menu:

[{]: <helper> (diffStep 12.8)

#### [Step 12.8: Implement the actual send of picture message](../../../../commit/27702f1)
<br>
##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.ts
<pre>
<i>@@ -8,6 +8,7 @@</i>
 ┊ 8┊ 8┊import { MessagesOptionsComponent } from &#x27;./messages-options&#x27;;
 ┊ 9┊ 9┊import { Subscription, Observable, Subscriber } from &#x27;rxjs&#x27;;
 ┊10┊10┊import { MessagesAttachmentsComponent } from &#x27;./messages-attachments&#x27;;
<b>+┊  ┊11┊import { PictureService } from &#x27;../../services/picture&#x27;;</b>
 ┊11┊12┊
 ┊12┊13┊@Component({
 ┊13┊14┊  selector: &#x27;messages-page&#x27;,
</pre>
<pre>
<i>@@ -29,7 +30,8 @@</i>
 ┊29┊30┊  constructor(
 ┊30┊31┊    navParams: NavParams,
 ┊31┊32┊    private el: ElementRef,
<b>+┊  ┊33┊    private popoverCtrl: PopoverController,</b>
<b>+┊  ┊34┊    private pictureService: PictureService</b>
 ┊33┊35┊  ) {
 ┊34┊36┊    this.selectedChat &#x3D; &lt;Chat&gt;navParams.get(&#x27;chat&#x27;);
 ┊35┊37┊    this.title &#x3D; this.selectedChat.title;
</pre>
<pre>
<i>@@ -236,12 +238,25 @@</i>
 ┊236┊238┊          const location &#x3D; params.selectedLocation;
 ┊237┊239┊          this.sendLocationMessage(location);
 ┊238┊240┊        }
<b>+┊   ┊241┊        else if (params.messageType &#x3D;&#x3D;&#x3D; MessageType.PICTURE) {</b>
<b>+┊   ┊242┊          const blob: Blob &#x3D; params.selectedPicture;</b>
<b>+┊   ┊243┊          this.sendPictureMessage(blob);</b>
<b>+┊   ┊244┊        }</b>
 ┊239┊245┊      }
 ┊240┊246┊    });
 ┊241┊247┊
 ┊242┊248┊    popover.present();
 ┊243┊249┊  }
 ┊244┊250┊
<b>+┊   ┊251┊  sendPictureMessage(blob: Blob): void {</b>
<b>+┊   ┊252┊    this.pictureService.upload(blob).then((picture) &#x3D;&gt; {</b>
<b>+┊   ┊253┊      MeteorObservable.call(&#x27;addMessage&#x27;, MessageType.PICTURE,</b>
<b>+┊   ┊254┊        this.selectedChat._id,</b>
<b>+┊   ┊255┊        picture.url</b>
<b>+┊   ┊256┊      ).zone().subscribe();</b>
<b>+┊   ┊257┊    });</b>
<b>+┊   ┊258┊  }</b>
<b>+┊   ┊259┊</b>
 ┊245┊260┊  getLocation(locationString: string): Location {
 ┊246┊261┊    const splitted &#x3D; locationString.split(&#x27;,&#x27;).map(Number);
</pre>

[}]: #

For now, we will add a stub for the `upload` method in the `PictureService` and we will get back to it once we finish implementing the necessary logic in the server for storing a picture:

[{]: <helper> (diffStep 12.9)

#### [Step 12.9: Create stub method for upload method](../../../../commit/5fbbb57)
<br>
##### Changed src&#x2F;services&#x2F;picture.ts
<pre>
<i>@@ -27,6 +27,10 @@</i>
 ┊27┊27┊    });
 ┊28┊28┊  }
 ┊29┊29┊
<b>+┊  ┊30┊  upload(blob: Blob): Promise&lt;any&gt; {</b>
<b>+┊  ┊31┊    return Promise.resolve();</b>
<b>+┊  ┊32┊  }</b>
<b>+┊  ┊33┊</b>
 ┊30┊34┊  convertURLtoBlob(URL: string): Promise&lt;Blob&gt; {
 ┊31┊35┊    return new Promise((resolve, reject) &#x3D;&gt; {
 ┊32┊36┊      const image &#x3D; document.createElement(&#x27;img&#x27;);
</pre>

[}]: #

## Server Side

So as we said, need to handle storage of pictures that were sent by the client. First, we will create a `Picture` model so the compiler can recognize a picture object:

[{]: <helper> (diffStep 12.1)

#### [Step 12.1: Add cordova plugin for image picker](../../../../commit/4847c82)
<br>
##### Changed package.json
<pre>
<i>@@ -53,7 +53,8 @@</i>
 ┊53┊53┊    &quot;cordova-plugin-device&quot;,
 ┊54┊54┊    &quot;cordova-plugin-geolocation&quot;,
 ┊55┊55┊    &quot;ionic-plugin-keyboard&quot;,
<b>+┊  ┊56┊    &quot;cordova-plugin-splashscreen&quot;,</b>
<b>+┊  ┊57┊    &quot;https://github.com/Telerik-Verified-Plugins/ImagePicker&quot;</b>
 ┊57┊58┊  ],
 ┊58┊59┊  &quot;cordovaPlatforms&quot;: [
 ┊59┊60┊    &quot;ios&quot;,
</pre>

[}]: #

If you're familiar with `Whatsapp`, you'll know that sent pictures are compressed. That's so the data-base can store more pictures, and the traffic in the network will be faster. To compress the sent pictures, we will be using an `NPM` package called [sharp](https://www.npmjs.com/package/sharp), which is a utility library which will help us perform transformations on pictures:

    $ meteor npm install --save sharp

> Be sure to use `meteor npm` and not `npm`, and that's because we wanna make sure that `sharp` is compatible with the server.

Now we will create a picture store which will compress pictures using `sharp` right before they are inserted into the data-base:

[{]: <helper> (diffStep 12.12)

#### [Step 12.12: Create pictures store](../../../../commit/b5704b8)
<br>
##### Added api&#x2F;server&#x2F;collections&#x2F;pictures.ts
<pre>
<i>@@ -0,0 +1,40 @@</i>
<b>+┊  ┊ 1┊import { MongoObservable } from &#x27;meteor-rxjs&#x27;;</b>
<b>+┊  ┊ 2┊import { UploadFS } from &#x27;meteor/jalik:ufs&#x27;;</b>
<b>+┊  ┊ 3┊import { Meteor } from &#x27;meteor/meteor&#x27;;</b>
<b>+┊  ┊ 4┊import * as Sharp from &#x27;sharp&#x27;;</b>
<b>+┊  ┊ 5┊import { Picture, DEFAULT_PICTURE_URL } from &#x27;../models&#x27;;</b>
<b>+┊  ┊ 6┊</b>
<b>+┊  ┊ 7┊export interface PicturesCollection&lt;T&gt; extends MongoObservable.Collection&lt;T&gt; {</b>
<b>+┊  ┊ 8┊  getPictureUrl(selector?: Object | string): string;</b>
<b>+┊  ┊ 9┊}</b>
<b>+┊  ┊10┊</b>
<b>+┊  ┊11┊export const Pictures &#x3D;</b>
<b>+┊  ┊12┊  new MongoObservable.Collection&lt;Picture&gt;(&#x27;pictures&#x27;) as PicturesCollection&lt;Picture&gt;;</b>
<b>+┊  ┊13┊</b>
<b>+┊  ┊14┊export const PicturesStore &#x3D; new UploadFS.store.GridFS({</b>
<b>+┊  ┊15┊  collection: Pictures.collection,</b>
<b>+┊  ┊16┊  name: &#x27;pictures&#x27;,</b>
<b>+┊  ┊17┊  filter: new UploadFS.Filter({</b>
<b>+┊  ┊18┊    contentTypes: [&#x27;image/*&#x27;]</b>
<b>+┊  ┊19┊  }),</b>
<b>+┊  ┊20┊  permissions: new UploadFS.StorePermissions({</b>
<b>+┊  ┊21┊    insert: picturesPermissions,</b>
<b>+┊  ┊22┊    update: picturesPermissions,</b>
<b>+┊  ┊23┊    remove: picturesPermissions</b>
<b>+┊  ┊24┊  }),</b>
<b>+┊  ┊25┊  transformWrite(from, to) {</b>
<b>+┊  ┊26┊    // Compress picture to 75% from its original quality</b>
<b>+┊  ┊27┊    const transform &#x3D; Sharp().png({ quality: 75 });</b>
<b>+┊  ┊28┊    from.pipe(transform).pipe(to);</b>
<b>+┊  ┊29┊  }</b>
<b>+┊  ┊30┊});</b>
<b>+┊  ┊31┊</b>
<b>+┊  ┊32┊// Gets picture&#x27;s url by a given selector</b>
<b>+┊  ┊33┊Pictures.getPictureUrl &#x3D; function (selector) {</b>
<b>+┊  ┊34┊  const picture &#x3D; this.findOne(selector) || {};</b>
<b>+┊  ┊35┊  return picture.url || DEFAULT_PICTURE_URL;</b>
<b>+┊  ┊36┊};</b>
<b>+┊  ┊37┊</b>
<b>+┊  ┊38┊function picturesPermissions(userId: string): boolean {</b>
<b>+┊  ┊39┊  return Meteor.isServer || !!userId;</b>
<b>+┊  ┊40┊}</b>
</pre>

[}]: #

You can look at a store as some sort of a wrapper for a collection, which will run different kind of a operations before it mutates it or fetches data from it. Note that we used `GridFS` because this way an uploaded file is split into multiple packets, which is more efficient for storage. We also defined a small utility function on that store which will retrieve a profile picture. If the ID was not found, it will return a link for the default picture. To make things convenient, we will also export the store from the `index` file:

[{]: <helper> (diffStep 12.13)

#### [Step 12.13: Export pictures collection](../../../../commit/0415347)
<br>
##### Changed api&#x2F;server&#x2F;collections&#x2F;index.ts
<pre>
<i>@@ -1,3 +1,4 @@</i>
 ┊1┊1┊export * from &#x27;./chats&#x27;;
 ┊2┊2┊export * from &#x27;./messages&#x27;;
 ┊3┊3┊export * from &#x27;./users&#x27;;
<b>+┊ ┊4┊export * from &#x27;./pictures&#x27;;</b>
</pre>

[}]: #

Now that we have the pictures store, and the server knows how to handle uploaded pictures, we will implement the `upload` stub in the `PictureService`:

[{]: <helper> (diffStep 12.14)

#### [Step 12.14: Implement upload method](../../../../commit/078a022)
<br>
##### Changed src&#x2F;services&#x2F;picture.ts
<pre>
<i>@@ -2,6 +2,9 @@</i>
 ┊ 2┊ 2┊import { Platform } from &#x27;ionic-angular&#x27;;
 ┊ 3┊ 3┊import { ImagePicker } from &#x27;ionic-native&#x27;;
 ┊ 4┊ 4┊import { UploadFS } from &#x27;meteor/jalik:ufs&#x27;;
<b>+┊  ┊ 5┊import { PicturesStore } from &#x27;api/collections&#x27;;</b>
<b>+┊  ┊ 6┊import { _ } from &#x27;meteor/underscore&#x27;;</b>
<b>+┊  ┊ 7┊import { DEFAULT_PICTURE_URL } from &#x27;api/models&#x27;;</b>
 ┊ 5┊ 8┊
 ┊ 6┊ 9┊@Injectable()
 ┊ 7┊10┊export class PictureService {
</pre>
<pre>
<i>@@ -28,7 +31,23 @@</i>
 ┊28┊31┊  }
 ┊29┊32┊
 ┊30┊33┊  upload(blob: Blob): Promise&lt;any&gt; {
<b>+┊  ┊34┊    return new Promise((resolve, reject) &#x3D;&gt; {</b>
<b>+┊  ┊35┊      const metadata &#x3D; _.pick(blob, &#x27;name&#x27;, &#x27;type&#x27;, &#x27;size&#x27;);</b>
<b>+┊  ┊36┊</b>
<b>+┊  ┊37┊      if (!metadata.name) {</b>
<b>+┊  ┊38┊        metadata.name &#x3D; DEFAULT_PICTURE_URL;</b>
<b>+┊  ┊39┊      }</b>
<b>+┊  ┊40┊</b>
<b>+┊  ┊41┊      const upload &#x3D; new UploadFS.Uploader({</b>
<b>+┊  ┊42┊        data: blob,</b>
<b>+┊  ┊43┊        file: metadata,</b>
<b>+┊  ┊44┊        store: PicturesStore,</b>
<b>+┊  ┊45┊        onComplete: resolve,</b>
<b>+┊  ┊46┊        onError: reject</b>
<b>+┊  ┊47┊      });</b>
<b>+┊  ┊48┊</b>
<b>+┊  ┊49┊      upload.start();</b>
<b>+┊  ┊50┊    });</b>
 ┊32┊51┊  }
 ┊33┊52┊
 ┊34┊53┊  convertURLtoBlob(URL: string): Promise&lt;Blob&gt; {
</pre>

[}]: #

Since `sharp` is a server-only package, and it is not supported by the client, at all, we will replace it with an empty dummy-object so errors won't occur. This requires us to change the `Webpack` config as shown below:

[{]: <helper> (diffStep 12.15)

#### [Step 12.15: Ignore sharp package on client side](../../../../commit/a308456)
<br>
##### Changed webpack.config.js
<pre>
<i>@@ -20,6 +20,9 @@</i>
 ┊20┊20┊  },
 ┊21┊21┊
 ┊22┊22┊  externals: [
<b>+┊  ┊23┊    {</b>
<b>+┊  ┊24┊      sharp: &#x27;{}&#x27;</b>
<b>+┊  ┊25┊    },</b>
 ┊23┊26┊    resolveExternals
 ┊24┊27┊  ],
</pre>

[}]: #

## View Picture Messages

We will now add the support for picture typed messages in the `MessagesPage`, so whenever we send a picture, we will be able to see them in the messages list like any other message:

[{]: <helper> (diffStep 12.16)

#### [Step 12.16: Added view for picture message](../../../../commit/a2bf55d)
<br>
##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.html
<pre>
<i>@@ -24,6 +24,7 @@</i>
 ┊24┊24┊              &lt;sebm-google-map-marker [latitude]&#x3D;&quot;getLocation(message.content).lat&quot; [longitude]&#x3D;&quot;getLocation(message.content).lng&quot;&gt;&lt;/sebm-google-map-marker&gt;
 ┊25┊25┊            &lt;/sebm-google-map&gt;
 ┊26┊26┊          &lt;/div&gt;
<b>+┊  ┊27┊          &lt;img *ngIf&#x3D;&quot;message.type &#x3D;&#x3D; &#x27;picture&#x27;&quot; (click)&#x3D;&quot;showPicture($event)&quot; class&#x3D;&quot;message-content message-content-picture&quot; [src]&#x3D;&quot;message.content&quot;&gt;</b>
 ┊27┊28┊
 ┊28┊29┊          &lt;span class&#x3D;&quot;message-timestamp&quot;&gt;{{ message.createdAt | amDateFormat: &#x27;HH:mm&#x27; }}&lt;/span&gt;
 ┊29┊30┊        &lt;/div&gt;
</pre>

[}]: #

As you can see, we also bound the picture message to the `click` event, which means that whenever we click on it, a picture viewer should be opened with the clicked picture. Let's create the component for that picture viewer:

[{]: <helper> (diffStep 12.17)

#### [Step 12.17: Create show picture component](../../../../commit/5efd9c3)
<br>
##### Added src&#x2F;pages&#x2F;messages&#x2F;show-picture.ts
<pre>
<i>@@ -0,0 +1,14 @@</i>
<b>+┊  ┊ 1┊import { Component } from &#x27;@angular/core&#x27;;</b>
<b>+┊  ┊ 2┊import { NavParams, ViewController } from &#x27;ionic-angular&#x27;;</b>
<b>+┊  ┊ 3┊</b>
<b>+┊  ┊ 4┊@Component({</b>
<b>+┊  ┊ 5┊  selector: &#x27;show-picture&#x27;,</b>
<b>+┊  ┊ 6┊  templateUrl: &#x27;show-picture.html&#x27;</b>
<b>+┊  ┊ 7┊})</b>
<b>+┊  ┊ 8┊export class ShowPictureComponent {</b>
<b>+┊  ┊ 9┊  pictureSrc: string;</b>
<b>+┊  ┊10┊</b>
<b>+┊  ┊11┊  constructor(private navParams: NavParams, private viewCtrl: ViewController) {</b>
<b>+┊  ┊12┊    this.pictureSrc &#x3D; navParams.get(&#x27;pictureSrc&#x27;);</b>
<b>+┊  ┊13┊  }</b>
<b>+┊  ┊14┊}</b>
</pre>

[}]: #

[{]: <helper> (diffStep 12.18)

#### [Step 12.18: Create show picture template](../../../../commit/b8d9c62)
<br>
##### Added src&#x2F;pages&#x2F;messages&#x2F;show-picture.html
<pre>
<i>@@ -0,0 +1,13 @@</i>
<b>+┊  ┊ 1┊&lt;ion-header&gt;</b>
<b>+┊  ┊ 2┊  &lt;ion-toolbar color&#x3D;&quot;whatsapp&quot;&gt;</b>
<b>+┊  ┊ 3┊    &lt;ion-title&gt;Show Picture&lt;/ion-title&gt;</b>
<b>+┊  ┊ 4┊</b>
<b>+┊  ┊ 5┊    &lt;ion-buttons left&gt;</b>
<b>+┊  ┊ 6┊      &lt;button ion-button class&#x3D;&quot;dismiss-button&quot; (click)&#x3D;&quot;viewCtrl.dismiss()&quot;&gt;&lt;ion-icon name&#x3D;&quot;close&quot;&gt;&lt;/ion-icon&gt;&lt;/button&gt;</b>
<b>+┊  ┊ 7┊    &lt;/ion-buttons&gt;</b>
<b>+┊  ┊ 8┊  &lt;/ion-toolbar&gt;</b>
<b>+┊  ┊ 9┊&lt;/ion-header&gt;</b>
<b>+┊  ┊10┊</b>
<b>+┊  ┊11┊&lt;ion-content class&#x3D;&quot;show-picture&quot;&gt;</b>
<b>+┊  ┊12┊  &lt;img class&#x3D;&quot;picture&quot; [src]&#x3D;&quot;pictureSrc&quot;&gt;</b>
<b>+┊  ┊13┊&lt;/ion-content&gt;</b>
</pre>

[}]: #

[{]: <helper> (diffStep 12.19)

#### [Step 12.19: Create show pictuer component styles](../../../../commit/df7e92c)
<br>
##### Added src&#x2F;pages&#x2F;messages&#x2F;show-picture.scss
<pre>
<i>@@ -0,0 +1,10 @@</i>
<b>+┊  ┊ 1┊.show-picture {</b>
<b>+┊  ┊ 2┊  background-color: black;</b>
<b>+┊  ┊ 3┊</b>
<b>+┊  ┊ 4┊  .picture {</b>
<b>+┊  ┊ 5┊    position: absolute;</b>
<b>+┊  ┊ 6┊    top: 50%;</b>
<b>+┊  ┊ 7┊    left: 50%;</b>
<b>+┊  ┊ 8┊    transform: translate(-50%, -50%);</b>
<b>+┊  ┊ 9┊  }</b>
<b>+┊  ┊10┊}🚫↵</b>
</pre>

[}]: #

[{]: <helper> (diffStep 12.2)

#### [Step 12.2: Add server side fs packages](../../../../commit/d41ba6a)
<br>
##### Changed api&#x2F;.meteor&#x2F;packages
<pre>
<i>@@ -24,3 +24,5 @@</i>
 ┊24┊24┊mys:accounts-phone
 ┊25┊25┊npm-bcrypt
 ┊26┊26┊reywood:publish-composite
<b>+┊  ┊27┊jalik:ufs</b>
<b>+┊  ┊28┊jalik:ufs-gridfs</b>
</pre>

##### Changed api&#x2F;.meteor&#x2F;versions
<pre>
<i>@@ -35,11 +35,14 @@</i>
 ┊35┊35┊htmljs@1.0.11
 ┊36┊36┊http@1.1.8
 ┊37┊37┊id-map@1.0.9
<b>+┊  ┊38┊jalik:ufs@0.7.1_1</b>
<b>+┊  ┊39┊jalik:ufs-gridfs@0.1.4</b>
 ┊38┊40┊jquery@1.11.10
 ┊39┊41┊launch-screen@1.0.12
 ┊40┊42┊livedata@1.0.18
 ┊41┊43┊localstorage@1.0.12
 ┊42┊44┊logging@1.1.16
<b>+┊  ┊45┊matb33:collection-hooks@0.8.4</b>
 ┊43┊46┊meteor@1.6.0
 ┊44┊47┊meteor-base@1.0.4
 ┊45┊48┊minifier-css@1.2.15
</pre>

[}]: #

And now that we have that component ready, we will implement the `showPicture` method in the `MessagesPage` component, which will create a new instance of the `ShowPictureComponent`:

[{]: <helper> (diffStep 12.21)

#### [Step 12.21: Implement showPicture method](../../../../commit/4044412)
<br>
##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.ts
<pre>
<i>@@ -1,5 +1,5 @@</i>
 ┊1┊1┊import { Component, OnInit, OnDestroy, ElementRef } from &#x27;@angular/core&#x27;;
<b>+┊ ┊2┊import { NavParams, PopoverController, ModalController } from &#x27;ionic-angular&#x27;;</b>
 ┊3┊3┊import { Chat, Message, MessageType, Location } from &#x27;api/models&#x27;;
 ┊4┊4┊import { Messages } from &#x27;api/collections&#x27;;
 ┊5┊5┊import { MeteorObservable } from &#x27;meteor-rxjs&#x27;;
</pre>
<pre>
<i>@@ -9,6 +9,7 @@</i>
 ┊ 9┊ 9┊import { Subscription, Observable, Subscriber } from &#x27;rxjs&#x27;;
 ┊10┊10┊import { MessagesAttachmentsComponent } from &#x27;./messages-attachments&#x27;;
 ┊11┊11┊import { PictureService } from &#x27;../../services/picture&#x27;;
<b>+┊  ┊12┊import { ShowPictureComponent } from &#x27;./show-picture&#x27;;</b>
 ┊12┊13┊
 ┊13┊14┊@Component({
 ┊14┊15┊  selector: &#x27;messages-page&#x27;,
</pre>
<pre>
<i>@@ -31,7 +32,8 @@</i>
 ┊31┊32┊    navParams: NavParams,
 ┊32┊33┊    private el: ElementRef,
 ┊33┊34┊    private popoverCtrl: PopoverController,
<b>+┊  ┊35┊    private pictureService: PictureService,</b>
<b>+┊  ┊36┊    private modalCtrl: ModalController</b>
 ┊35┊37┊  ) {
 ┊36┊38┊    this.selectedChat &#x3D; &lt;Chat&gt;navParams.get(&#x27;chat&#x27;);
 ┊37┊39┊    this.title &#x3D; this.selectedChat.title;
</pre>
<pre>
<i>@@ -266,4 +268,12 @@</i>
 ┊266┊268┊      zoom: Math.min(splitted[2] || 0, 19)
 ┊267┊269┊    };
 ┊268┊270┊  }
<b>+┊   ┊271┊</b>
<b>+┊   ┊272┊  showPicture({ target }: Event) {</b>
<b>+┊   ┊273┊    const modal &#x3D; this.modalCtrl.create(ShowPictureComponent, {</b>
<b>+┊   ┊274┊      pictureSrc: (&lt;HTMLImageElement&gt;target).src</b>
<b>+┊   ┊275┊    });</b>
<b>+┊   ┊276┊</b>
<b>+┊   ┊277┊    modal.present();</b>
<b>+┊   ┊278┊  }</b>
 ┊269┊279┊}
</pre>

[}]: #

## Profile Picture

We have the ability to send picture messages. Now we will add the ability to change the user's profile picture using the infrastructure we've just created. To begin with, we will define a new property to our `User` model called `pictureId`, which will be used to determine the belonging profile picture of the current user:

[{]: <helper> (diffStep 12.22)

#### [Step 12.22: Add pictureId property to Profile](../../../../commit/dae6165)
<br>
##### Changed api&#x2F;server&#x2F;models.ts
<pre>
<i>@@ -3,6 +3,7 @@</i>
 ┊3┊3┊export interface Profile {
 ┊4┊4┊  name?: string;
 ┊5┊5┊  picture?: string;
<b>+┊ ┊6┊  pictureId?: string;</b>
 ┊6┊7┊}
 ┊7┊8┊
 ┊8┊9┊export enum MessageType {
</pre>

[}]: #

We will bind the editing button in the profile selection page into an event handler:

[{]: <helper> (diffStep 12.23)

#### [Step 12.23: Add event for changing profile picture](../../../../commit/e1d963f)
<br>
##### Changed src&#x2F;pages&#x2F;profile&#x2F;profile.html
<pre>
<i>@@ -11,6 +11,7 @@</i>
 ┊11┊11┊&lt;ion-content class&#x3D;&quot;profile-page-content&quot;&gt;
 ┊12┊12┊  &lt;div class&#x3D;&quot;profile-picture&quot;&gt;
 ┊13┊13┊    &lt;img *ngIf&#x3D;&quot;picture&quot; [src]&#x3D;&quot;picture&quot;&gt;
<b>+┊  ┊14┊    &lt;ion-icon name&#x3D;&quot;create&quot; (click)&#x3D;&quot;selectProfilePicture()&quot;&gt;&lt;/ion-icon&gt;</b>
 ┊14┊15┊  &lt;/div&gt;
 ┊15┊16┊
 ┊16┊17┊  &lt;ion-item class&#x3D;&quot;profile-name&quot;&gt;
</pre>

[}]: #

And we will add all the missing logic in the component, so the `pictureId` will be transformed into and actual reference, and so we can have the ability to select a picture from our gallery and upload it:

[{]: <helper> (diffStep 12.24)

#### [Step 12.24: Implement pick, update and set of profile image](../../../../commit/0c66513)
<br>
##### Changed src&#x2F;pages&#x2F;profile&#x2F;profile.ts
<pre>
<i>@@ -3,6 +3,8 @@</i>
 ┊ 3┊ 3┊import { AlertController, NavController } from &#x27;ionic-angular&#x27;;
 ┊ 4┊ 4┊import { MeteorObservable } from &#x27;meteor-rxjs&#x27;;
 ┊ 5┊ 5┊import { ChatsPage } from &#x27;../chats/chats&#x27;;
<b>+┊  ┊ 6┊import { PictureService } from &#x27;../../services/picture&#x27;;</b>
<b>+┊  ┊ 7┊import { Pictures } from &#x27;api/collections&#x27;;</b>
 ┊ 6┊ 8┊
 ┊ 7┊ 9┊@Component({
 ┊ 8┊10┊  selector: &#x27;profile&#x27;,
</pre>
<pre>
<i>@@ -14,13 +16,37 @@</i>
 ┊14┊16┊
 ┊15┊17┊  constructor(
 ┊16┊18┊    private alertCtrl: AlertController,
<b>+┊  ┊19┊    private navCtrl: NavController,</b>
<b>+┊  ┊20┊    private pictureService: PictureService</b>
 ┊18┊21┊  ) {}
 ┊19┊22┊
 ┊20┊23┊  ngOnInit(): void {
 ┊21┊24┊    this.profile &#x3D; Meteor.user().profile || {
 ┊22┊25┊      name: &#x27;&#x27;
 ┊23┊26┊    };
<b>+┊  ┊27┊</b>
<b>+┊  ┊28┊    MeteorObservable.subscribe(&#x27;user&#x27;).subscribe(() &#x3D;&gt; {</b>
<b>+┊  ┊29┊      this.picture &#x3D; Pictures.getPictureUrl(this.profile.pictureId);</b>
<b>+┊  ┊30┊    });</b>
<b>+┊  ┊31┊  }</b>
<b>+┊  ┊32┊</b>
<b>+┊  ┊33┊  selectProfilePicture(): void {</b>
<b>+┊  ┊34┊    this.pictureService.select().then((blob) &#x3D;&gt; {</b>
<b>+┊  ┊35┊      this.uploadProfilePicture(blob);</b>
<b>+┊  ┊36┊    })</b>
<b>+┊  ┊37┊      .catch((e) &#x3D;&gt; {</b>
<b>+┊  ┊38┊        this.handleError(e);</b>
<b>+┊  ┊39┊      });</b>
<b>+┊  ┊40┊  }</b>
<b>+┊  ┊41┊</b>
<b>+┊  ┊42┊  uploadProfilePicture(blob: Blob): void {</b>
<b>+┊  ┊43┊    this.pictureService.upload(blob).then((picture) &#x3D;&gt; {</b>
<b>+┊  ┊44┊      this.profile.pictureId &#x3D; picture._id;</b>
<b>+┊  ┊45┊      this.picture &#x3D; picture.url;</b>
<b>+┊  ┊46┊    })</b>
<b>+┊  ┊47┊      .catch((e) &#x3D;&gt; {</b>
<b>+┊  ┊48┊        this.handleError(e);</b>
<b>+┊  ┊49┊      });</b>
 ┊24┊50┊  }
 ┊25┊51┊
 ┊26┊52┊  updateProfile(): void {
</pre>

[}]: #

We will also define a new hook in the `Meteor.users` collection so whenever we update the profile picture, the previous one will be removed from the data-base. This way we won't have some unnecessary data in our data-base, which will save us some precious storage:

[{]: <helper> (diffStep 12.25)

#### [Step 12.25: Add after hook for user modification](../../../../commit/031ed3f)
<br>
##### Changed api&#x2F;server&#x2F;collections&#x2F;users.ts
<pre>
<i>@@ -1,5 +1,15 @@</i>
 ┊ 1┊ 1┊import { MongoObservable } from &#x27;meteor-rxjs&#x27;;
 ┊ 2┊ 2┊import { Meteor } from &#x27;meteor/meteor&#x27;;
 ┊ 3┊ 3┊import { User } from &#x27;../models&#x27;;
<b>+┊  ┊ 4┊import { Pictures } from &#x27;./pictures&#x27;;</b>
 ┊ 4┊ 5┊
 ┊ 5┊ 6┊export const Users &#x3D; MongoObservable.fromExisting&lt;User&gt;(Meteor.users);
<b>+┊  ┊ 7┊</b>
<b>+┊  ┊ 8┊// Dispose unused profile pictures</b>
<b>+┊  ┊ 9┊Meteor.users.after.update(function (userId, doc, fieldNames, modifier, options) {</b>
<b>+┊  ┊10┊  if (!doc.profile) return;</b>
<b>+┊  ┊11┊  if (!this.previous.profile) return;</b>
<b>+┊  ┊12┊  if (doc.profile.pictureId &#x3D;&#x3D; this.previous.profile.pictureId) return;</b>
<b>+┊  ┊13┊</b>
<b>+┊  ┊14┊  Pictures.collection.remove({ _id: doc.profile.pictureId });</b>
<b>+┊  ┊15┊}, { fetchPrevious: true });</b>
</pre>

[}]: #

Collection hooks are not part of `Meteor`'s official API and are added through a third-party package called `matb33:collection-hooks`. This requires us to install the necessary type definition:

    $ npm install --save-dev @types/meteor-collection-hooks

Now we need to import the type definition we've just installed in the `tsconfig.json` file:

[{]: <helper> (diffStep 12.27)

#### [Step 12.27: Import meteor-collection-hooks typings](../../../../commit/9ee57be)
<br>
##### Changed api&#x2F;tsconfig.json
<pre>
<i>@@ -18,7 +18,8 @@</i>
 ┊18┊18┊    &quot;types&quot;: [
 ┊19┊19┊      &quot;meteor-typings&quot;,
 ┊20┊20┊      &quot;@types/meteor-accounts-phone&quot;,
<b>+┊  ┊21┊      &quot;@types/meteor-publish-composite&quot;,</b>
<b>+┊  ┊22┊      &quot;@types/meteor-collection-hooks&quot;</b>
 ┊22┊23┊    ]
 ┊23┊24┊  },
 ┊24┊25┊  &quot;exclude&quot;: [
</pre>

##### Changed tsconfig.json
<pre>
<i>@@ -22,7 +22,8 @@</i>
 ┊22┊22┊    &quot;types&quot;: [
 ┊23┊23┊      &quot;meteor-typings&quot;,
 ┊24┊24┊      &quot;@types/underscore&quot;,
<b>+┊  ┊25┊      &quot;@types/meteor-accounts-phone&quot;,</b>
<b>+┊  ┊26┊      &quot;@types/meteor-collection-hooks&quot;</b>
 ┊26┊27┊    ]
 ┊27┊28┊  },
 ┊28┊29┊  &quot;include&quot;: [
</pre>

[}]: #

We now add a `user` publication which should be subscribed whenever we initialize the `ProfilePage`. This subscription should fetch some data from other collections which is related to the user which is currently logged in; And to be more specific, the document associated with the `profileId` defined in the `User` model:

[{]: <helper> (diffStep 12.28)

#### [Step 12.28: Add user publication](../../../../commit/dd0dda4)
<br>
##### Changed api&#x2F;server&#x2F;publications.ts
<pre>
<i>@@ -2,6 +2,7 @@</i>
 ┊2┊2┊import { Users } from &#x27;./collections/users&#x27;;
 ┊3┊3┊import { Messages } from &#x27;./collections/messages&#x27;;
 ┊4┊4┊import { Chats } from &#x27;./collections/chats&#x27;;
<b>+┊ ┊5┊import { Pictures } from &#x27;./collections/pictures&#x27;;</b>
 ┊5┊6┊
 ┊6┊7┊Meteor.publishComposite(&#x27;users&#x27;, function(
 ┊7┊8┊  pattern: string
</pre>
<pre>
<i>@@ -74,3 +75,15 @@</i>
 ┊74┊75┊    ]
 ┊75┊76┊  };
 ┊76┊77┊});
<b>+┊  ┊78┊</b>
<b>+┊  ┊79┊Meteor.publish(&#x27;user&#x27;, function () {</b>
<b>+┊  ┊80┊  if (!this.userId) {</b>
<b>+┊  ┊81┊    return;</b>
<b>+┊  ┊82┊  }</b>
<b>+┊  ┊83┊</b>
<b>+┊  ┊84┊  const profile &#x3D; Users.findOne(this.userId).profile || {};</b>
<b>+┊  ┊85┊</b>
<b>+┊  ┊86┊  return Pictures.collection.find({</b>
<b>+┊  ┊87┊    _id: profile.pictureId</b>
<b>+┊  ┊88┊  });</b>
<b>+┊  ┊89┊});</b>
</pre>

[}]: #

We will also modify the `users` and `chats` publication, so each user will contain its corresponding picture document as well:

[{]: <helper> (diffStep 12.29)

#### [Step 12.29: Added images to users publication](../../../../commit/7c82145)
<br>
##### Changed api&#x2F;server&#x2F;publications.ts
<pre>
<i>@@ -1,4 +1,4 @@</i>
<b>+┊ ┊1┊import { User, Message, Chat, Picture } from &#x27;./models&#x27;;</b>
 ┊2┊2┊import { Users } from &#x27;./collections/users&#x27;;
 ┊3┊3┊import { Messages } from &#x27;./collections/messages&#x27;;
 ┊4┊4┊import { Chats } from &#x27;./collections/chats&#x27;;
</pre>
<pre>
<i>@@ -25,7 +25,17 @@</i>
 ┊25┊25┊        fields: { profile: 1 },
 ┊26┊26┊        limit: 15
 ┊27┊27┊      });
<b>+┊  ┊28┊    },</b>
<b>+┊  ┊29┊</b>
<b>+┊  ┊30┊    children: [</b>
<b>+┊  ┊31┊      &lt;PublishCompositeConfig1&lt;User, Picture&gt;&gt; {</b>
<b>+┊  ┊32┊        find: (user) &#x3D;&gt; {</b>
<b>+┊  ┊33┊          return Pictures.collection.find(user.profile.pictureId, {</b>
<b>+┊  ┊34┊            fields: { url: 1 }</b>
<b>+┊  ┊35┊          });</b>
<b>+┊  ┊36┊        }</b>
<b>+┊  ┊37┊      }</b>
<b>+┊  ┊38┊    ]</b>
 ┊29┊39┊  };
 ┊30┊40┊});
</pre>

[}]: #

[{]: <helper> (diffStep 12.1)

#### [Step 12.1: Add cordova plugin for image picker](../../../../commit/4847c82)
<br>
##### Changed package.json
<pre>
<i>@@ -53,7 +53,8 @@</i>
 ┊53┊53┊    &quot;cordova-plugin-device&quot;,
 ┊54┊54┊    &quot;cordova-plugin-geolocation&quot;,
 ┊55┊55┊    &quot;ionic-plugin-keyboard&quot;,
<b>+┊  ┊56┊    &quot;cordova-plugin-splashscreen&quot;,</b>
<b>+┊  ┊57┊    &quot;https://github.com/Telerik-Verified-Plugins/ImagePicker&quot;</b>
 ┊57┊58┊  ],
 ┊58┊59┊  &quot;cordovaPlatforms&quot;: [
 ┊59┊60┊    &quot;ios&quot;,
</pre>

[}]: #

Since we already set up some collection hooks on the users collection, we can take it a step further by defining collection hooks on the chat collection, so whenever a chat is being removed, all its corresponding messages will be removed as well:

[{]: <helper> (diffStep 12.31)

#### [Step 12.31: Add hook for removing unused messages](../../../../commit/c71c935)
<br>
##### Changed api&#x2F;server&#x2F;collections&#x2F;chats.ts
<pre>
<i>@@ -1,4 +1,10 @@</i>
 ┊ 1┊ 1┊import { MongoObservable } from &#x27;meteor-rxjs&#x27;;
 ┊ 2┊ 2┊import { Chat } from &#x27;../models&#x27;;
<b>+┊  ┊ 3┊import { Messages } from &#x27;./messages&#x27;;</b>
 ┊ 3┊ 4┊
 ┊ 4┊ 5┊export const Chats &#x3D; new MongoObservable.Collection&lt;Chat&gt;(&#x27;chats&#x27;);
<b>+┊  ┊ 6┊</b>
<b>+┊  ┊ 7┊// Dispose unused messages</b>
<b>+┊  ┊ 8┊Chats.collection.after.remove(function (userId, doc) {</b>
<b>+┊  ┊ 9┊  Messages.collection.remove({ chatId: doc._id });</b>
<b>+┊  ┊10┊});</b>
</pre>

[}]: #

We will now update the `updateProfile` method in the server to accept `pictureId`, so whenever we pick up a new profile picture the server won't reject it:

[{]: <helper> (diffStep 12.32)

#### [Step 12.32: Allow updating pictureId](../../../../commit/27e916d)
<br>
##### Changed api&#x2F;server&#x2F;methods.ts
<pre>
<i>@@ -59,7 +59,8 @@</i>
 ┊59┊59┊      &#x27;User must be logged-in to create a new chat&#x27;);
 ┊60┊60┊
 ┊61┊61┊    check(profile, {
<b>+┊  ┊62┊      name: nonEmptyString,</b>
<b>+┊  ┊63┊      pictureId: Match.Maybe(nonEmptyString)</b>
 ┊63┊64┊    });
 ┊64┊65┊
 ┊65┊66┊    Meteor.users.update(this.userId, {
</pre>

[}]: #

Now we will update the users fabrication in our server's initialization, so instead of using hard-coded URLs, we will insert them as new documents to the `PicturesCollection`:

[{]: <helper> (diffStep 12.33)

#### [Step 12.33: Update creation of users stubs](../../../../commit/0a90535)
<br>
##### Changed api&#x2F;server&#x2F;main.ts
<pre>
<i>@@ -2,7 +2,7 @@</i>
 ┊2┊2┊import { Chats } from &#x27;./collections/chats&#x27;;
 ┊3┊3┊import { Messages } from &#x27;./collections/messages&#x27;;
 ┊4┊4┊import * as moment from &#x27;moment&#x27;;
<b>+┊ ┊5┊import { MessageType, Picture } from &#x27;./models&#x27;;</b>
 ┊6┊6┊import { Accounts } from &#x27;meteor/accounts-base&#x27;;
 ┊7┊7┊import { Users } from &#x27;./collections/users&#x27;;
 ┊8┊8┊
</pre>
<pre>
<i>@@ -16,43 +16,74 @@</i>
 ┊16┊16┊    return;
 ┊17┊17┊  }
 ┊18┊18┊
<b>+┊  ┊19┊  let picture &#x3D; importPictureFromUrl({</b>
<b>+┊  ┊20┊    name: &#x27;man1.jpg&#x27;,</b>
<b>+┊  ┊21┊    url: &#x27;https://randomuser.me/api/portraits/men/1.jpg&#x27;</b>
<b>+┊  ┊22┊  });</b>
<b>+┊  ┊23┊</b>
 ┊19┊24┊  Accounts.createUserWithPhone({
 ┊20┊25┊    phone: &#x27;+972540000001&#x27;,
 ┊21┊26┊    profile: {
 ┊22┊27┊      name: &#x27;Ethan Gonzalez&#x27;,
<b>+┊  ┊28┊      pictureId: picture._id</b>
 ┊24┊29┊    }
 ┊25┊30┊  });
 ┊26┊31┊
<b>+┊  ┊32┊  picture &#x3D; importPictureFromUrl({</b>
<b>+┊  ┊33┊    name: &#x27;lego1.jpg&#x27;,</b>
<b>+┊  ┊34┊    url: &#x27;https://randomuser.me/api/portraits/lego/1.jpg&#x27;</b>
<b>+┊  ┊35┊  });</b>
<b>+┊  ┊36┊</b>
 ┊27┊37┊  Accounts.createUserWithPhone({
 ┊28┊38┊    phone: &#x27;+972540000002&#x27;,
 ┊29┊39┊    profile: {
 ┊30┊40┊      name: &#x27;Bryan Wallace&#x27;,
<b>+┊  ┊41┊      pictureId: picture._id</b>
 ┊32┊42┊    }
 ┊33┊43┊  });
 ┊34┊44┊
<b>+┊  ┊45┊  picture &#x3D; importPictureFromUrl({</b>
<b>+┊  ┊46┊    name: &#x27;woman1.jpg&#x27;,</b>
<b>+┊  ┊47┊    url: &#x27;https://randomuser.me/api/portraits/women/1.jpg&#x27;</b>
<b>+┊  ┊48┊  });</b>
<b>+┊  ┊49┊</b>
 ┊35┊50┊  Accounts.createUserWithPhone({
 ┊36┊51┊    phone: &#x27;+972540000003&#x27;,
 ┊37┊52┊    profile: {
 ┊38┊53┊      name: &#x27;Avery Stewart&#x27;,
<b>+┊  ┊54┊      pictureId: picture._id</b>
 ┊40┊55┊    }
 ┊41┊56┊  });
 ┊42┊57┊
<b>+┊  ┊58┊  picture &#x3D; importPictureFromUrl({</b>
<b>+┊  ┊59┊    name: &#x27;woman2.jpg&#x27;,</b>
<b>+┊  ┊60┊    url: &#x27;https://randomuser.me/api/portraits/women/2.jpg&#x27;</b>
<b>+┊  ┊61┊  });</b>
<b>+┊  ┊62┊</b>
 ┊43┊63┊  Accounts.createUserWithPhone({
 ┊44┊64┊    phone: &#x27;+972540000004&#x27;,
 ┊45┊65┊    profile: {
 ┊46┊66┊      name: &#x27;Katie Peterson&#x27;,
<b>+┊  ┊67┊      pictureId: picture._id</b>
 ┊48┊68┊    }
 ┊49┊69┊  });
 ┊50┊70┊
<b>+┊  ┊71┊  picture &#x3D; importPictureFromUrl({</b>
<b>+┊  ┊72┊    name: &#x27;man2.jpg&#x27;,</b>
<b>+┊  ┊73┊    url: &#x27;https://randomuser.me/api/portraits/men/2.jpg&#x27;</b>
<b>+┊  ┊74┊  });</b>
<b>+┊  ┊75┊</b>
 ┊51┊76┊  Accounts.createUserWithPhone({
 ┊52┊77┊    phone: &#x27;+972540000005&#x27;,
 ┊53┊78┊    profile: {
 ┊54┊79┊      name: &#x27;Ray Edwards&#x27;,
<b>+┊  ┊80┊      pictureId: picture._id</b>
 ┊56┊81┊    }
 ┊57┊82┊  });
 ┊58┊83┊});
<b>+┊  ┊84┊</b>
<b>+┊  ┊85┊function importPictureFromUrl(options: { name: string, url: string }): Picture {</b>
<b>+┊  ┊86┊  const description &#x3D; { name: options.name };</b>
<b>+┊  ┊87┊</b>
<b>+┊  ┊88┊  return Meteor.call(&#x27;ufsImportURL&#x27;, options.url, description, &#x27;pictures&#x27;);</b>
<b>+┊  ┊89┊}</b>
</pre>

[}]: #

To avoid some unexpected behaviors, we will reset our data-base so our server can re-fabricate the data:

    api$ meteor reset

We will now update the `ChatsPage` to add the belonging picture for each chat during transformation:

[{]: <helper> (diffStep 12.34)

#### [Step 12.34: Fetch user image from server](../../../../commit/7396ed6)
<br>
##### Changed src&#x2F;pages&#x2F;chats&#x2F;chats.ts
<pre>
<i>@@ -1,5 +1,5 @@</i>
 ┊1┊1┊import { Component, OnInit } from &#x27;@angular/core&#x27;;
<b>+┊ ┊2┊import { Chats, Messages, Users, Pictures } from &#x27;api/collections&#x27;;</b>
 ┊3┊3┊import { Chat, Message } from &#x27;api/models&#x27;;
 ┊4┊4┊import { NavController, PopoverController, ModalController, AlertController } from &#x27;ionic-angular&#x27;;
 ┊5┊5┊import { MeteorObservable } from &#x27;meteor-rxjs&#x27;;
</pre>
<pre>
<i>@@ -48,7 +48,7 @@</i>
 ┊48┊48┊
 ┊49┊49┊        if (receiver) {
 ┊50┊50┊          chat.title &#x3D; receiver.profile.name;
<b>+┊  ┊51┊          chat.picture &#x3D; Pictures.getPictureUrl(receiver.profile.pictureId);</b>
 ┊52┊52┊        }
 ┊53┊53┊
 ┊54┊54┊        // This will make the last message reactive
</pre>

[}]: #

And we will do the same in the `NewChatComponent`:

[{]: <helper> (diffStep 12.35)

#### [Step 12.35: Use the new pictureId field for new chat modal](../../../../commit/d1449c8)
<br>
##### Changed src&#x2F;pages&#x2F;chats&#x2F;new-chat.html
<pre>
<i>@@ -26,7 +26,7 @@</i>
 ┊26┊26┊&lt;ion-content class&#x3D;&quot;new-chat&quot;&gt;
 ┊27┊27┊  &lt;ion-list class&#x3D;&quot;users&quot;&gt;
 ┊28┊28┊    &lt;button ion-item *ngFor&#x3D;&quot;let user of users | async&quot; class&#x3D;&quot;user&quot; (click)&#x3D;&quot;addChat(user)&quot;&gt;
<b>+┊  ┊29┊      &lt;img class&#x3D;&quot;user-picture&quot; [src]&#x3D;&quot;getPic(user.profile.pictureId)&quot;&gt;</b>
 ┊30┊30┊      &lt;h2 class&#x3D;&quot;user-name&quot;&gt;{{user.profile.name}}&lt;/h2&gt;
 ┊31┊31┊    &lt;/button&gt;
 ┊32┊32┊  &lt;/ion-list&gt;
</pre>

[}]: #

[{]: <helper> (diffStep 12.36)

#### [Step 12.36: Implement getPic](../../../../commit/2d6c9f1)
<br>
##### Changed src&#x2F;pages&#x2F;chats&#x2F;new-chat.ts
<pre>
<i>@@ -1,5 +1,5 @@</i>
 ┊1┊1┊import { Component, OnInit } from &#x27;@angular/core&#x27;;
<b>+┊ ┊2┊import { Chats, Users, Pictures } from &#x27;api/collections&#x27;;</b>
 ┊3┊3┊import { User } from &#x27;api/models&#x27;;
 ┊4┊4┊import { AlertController, ViewController } from &#x27;ionic-angular&#x27;;
 ┊5┊5┊import { MeteorObservable } from &#x27;meteor-rxjs&#x27;;
</pre>
<pre>
<i>@@ -107,4 +107,8 @@</i>
 ┊107┊107┊
 ┊108┊108┊    alert.present();
 ┊109┊109┊  }
<b>+┊   ┊110┊</b>
<b>+┊   ┊111┊  getPic(pictureId): string {</b>
<b>+┊   ┊112┊    return Pictures.getPictureUrl(pictureId);</b>
<b>+┊   ┊113┊  }</b>
 ┊110┊114┊}
</pre>

[}]: #

[{]: <helper> (navStep nextRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/native-mobile" prevRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/google-maps")

⟸ <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/google-maps">PREVIOUS STEP</a> <b>║</b> <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/native-mobile">NEXT STEP</a> ⟹

[}]: #

