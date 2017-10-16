# Step 13: File Upload &amp; Images

In this step, we will be using `Ionic 2` to pick up some images from our device's gallery, and we will use them to send pictures, and to set our profile picture.

## Image Picker

First, we will a `Cordova` plug-in which will give us the ability to access the gallery:

    $ ionic cordova plugin add git+https://github.com/darkbasic/ImagePicker.git --save
    $ npm install --save @ionic-native/image-picker

Then let's add it to `app.module.ts`:

[{]: <helper> (diffStep 13.2)

#### [Step 13.2: Add Image Picker to app.module.ts](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/04bbed3)

##### Changed src&#x2F;app&#x2F;app.module.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 4┊ 4┊import { SplashScreen } from &#x27;@ionic-native/splash-screen&#x27;;
 ┊ 5┊ 5┊import { StatusBar } from &#x27;@ionic-native/status-bar&#x27;;
 ┊ 6┊ 6┊import { Geolocation } from &#x27;@ionic-native/geolocation&#x27;;
<b>+┊  ┊ 7┊import { ImagePicker } from &#x27;@ionic-native/image-picker&#x27;;</b>
 ┊ 7┊ 8┊import { AgmCoreModule } from &#x27;@agm/core&#x27;;
 ┊ 8┊ 9┊import { MomentModule } from &#x27;angular2-moment&#x27;;
 ┊ 9┊10┊import { ChatsPage } from &#x27;../pages/chats/chats&#x27;;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊60┊61┊    SplashScreen,
 ┊61┊62┊    Geolocation,
 ┊62┊63┊    {provide: ErrorHandler, useClass: IonicErrorHandler},
<b>+┊  ┊64┊    PhoneService,</b>
<b>+┊  ┊65┊    ImagePicker</b>
 ┊64┊66┊  ]
 ┊65┊67┊})
 ┊66┊68┊export class AppModule {}
</pre>

[}]: #

## Meteor FS

Up next, would be adding the ability to store some files in our data-base. This requires us to add 2 `Meteor` packages, called `ufs` and `ufs-gridfs` (Which adds support for `GridFS` operations. See [reference](https://docs.mongodb.com/manual/core/gridfs/)), which will take care of FS operations:

    api$ meteor add jalik:ufs
    api$ meteor add jalik:ufs-gridfs

And be sure to re-bundle the `Meteor` client whenever you make changes in the server:

    $ npm run meteor-client:bundle

## Client Side

Before we proceed to the server, we will add the ability to select and upload pictures in the client. All our picture-related operations will be defined in a single service called `PictureService`; The first bit of this service would be picture-selection. The `UploadFS` package already supports that feature, **but only for the browser**, therefore we will be using the `Cordova` plug-in we've just installed to select some pictures from our mobile device:

[{]: <helper> (diffStep 13.4)

#### [Step 13.4: Create PictureService with utils for files](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/4cd2e32)

##### Added src&#x2F;services&#x2F;picture.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { Injectable } from &#x27;@angular/core&#x27;;</b>
<b>+┊  ┊ 2┊import { Platform } from &#x27;ionic-angular&#x27;;</b>
<b>+┊  ┊ 3┊import { ImagePicker } from &#x27;@ionic-native/image-picker&#x27;;</b>
<b>+┊  ┊ 4┊import { UploadFS } from &#x27;meteor/jalik:ufs&#x27;;</b>
<b>+┊  ┊ 5┊</b>
<b>+┊  ┊ 6┊@Injectable()</b>
<b>+┊  ┊ 7┊export class PictureService {</b>
<b>+┊  ┊ 8┊  constructor(private platform: Platform,</b>
<b>+┊  ┊ 9┊              private imagePicker: ImagePicker) {</b>
<b>+┊  ┊10┊  }</b>
<b>+┊  ┊11┊</b>
<b>+┊  ┊12┊  select(): Promise&lt;File&gt; {</b>
<b>+┊  ┊13┊    if (!this.platform.is(&#x27;cordova&#x27;) || !this.platform.is(&#x27;mobile&#x27;)) {</b>
<b>+┊  ┊14┊      return new Promise((resolve, reject) &#x3D;&gt; {</b>
<b>+┊  ┊15┊        try {</b>
<b>+┊  ┊16┊          UploadFS.selectFile((file: File) &#x3D;&gt; {</b>
<b>+┊  ┊17┊            resolve(file);</b>
<b>+┊  ┊18┊          });</b>
<b>+┊  ┊19┊        }</b>
<b>+┊  ┊20┊        catch (e) {</b>
<b>+┊  ┊21┊          reject(e);</b>
<b>+┊  ┊22┊        }</b>
<b>+┊  ┊23┊      });</b>
<b>+┊  ┊24┊    }</b>
<b>+┊  ┊25┊</b>
<b>+┊  ┊26┊    return this.imagePicker.getPictures({maximumImagesCount: 1}).then((URL: string) &#x3D;&gt; {</b>
<b>+┊  ┊27┊      return this.convertURLtoBlob(URL);</b>
<b>+┊  ┊28┊    });</b>
<b>+┊  ┊29┊  }</b>
<b>+┊  ┊30┊</b>
<b>+┊  ┊31┊  convertURLtoBlob(url: string, options &#x3D; {}): Promise&lt;File&gt; {</b>
<b>+┊  ┊32┊    return new Promise((resolve, reject) &#x3D;&gt; {</b>
<b>+┊  ┊33┊      const image &#x3D; document.createElement(&#x27;img&#x27;);</b>
<b>+┊  ┊34┊</b>
<b>+┊  ┊35┊      image.onload &#x3D; () &#x3D;&gt; {</b>
<b>+┊  ┊36┊        try {</b>
<b>+┊  ┊37┊          const dataURI &#x3D; this.convertImageToDataURI(image, options);</b>
<b>+┊  ┊38┊          const blob &#x3D; this.convertDataURIToBlob(dataURI);</b>
<b>+┊  ┊39┊          const pathname &#x3D; (new URL(url)).pathname;</b>
<b>+┊  ┊40┊          const filename &#x3D; pathname.substring(pathname.lastIndexOf(&#x27;/&#x27;) + 1);</b>
<b>+┊  ┊41┊          const file &#x3D; new File([blob], filename);</b>
<b>+┊  ┊42┊</b>
<b>+┊  ┊43┊          resolve(file);</b>
<b>+┊  ┊44┊        }</b>
<b>+┊  ┊45┊        catch (e) {</b>
<b>+┊  ┊46┊          reject(e);</b>
<b>+┊  ┊47┊        }</b>
<b>+┊  ┊48┊      };</b>
<b>+┊  ┊49┊</b>
<b>+┊  ┊50┊      image.src &#x3D; url;</b>
<b>+┊  ┊51┊    });</b>
<b>+┊  ┊52┊  }</b>
<b>+┊  ┊53┊</b>
<b>+┊  ┊54┊  convertImageToDataURI(image: HTMLImageElement, {MAX_WIDTH &#x3D; 400, MAX_HEIGHT &#x3D; 400} &#x3D; {}): string {</b>
<b>+┊  ┊55┊    // Create an empty canvas element</b>
<b>+┊  ┊56┊    const canvas &#x3D; document.createElement(&#x27;canvas&#x27;);</b>
<b>+┊  ┊57┊</b>
<b>+┊  ┊58┊    var width &#x3D; image.width, height &#x3D; image.height;</b>
<b>+┊  ┊59┊</b>
<b>+┊  ┊60┊    if (width &gt; height) {</b>
<b>+┊  ┊61┊      if (width &gt; MAX_WIDTH) {</b>
<b>+┊  ┊62┊        height *&#x3D; MAX_WIDTH / width;</b>
<b>+┊  ┊63┊        width &#x3D; MAX_WIDTH;</b>
<b>+┊  ┊64┊      }</b>
<b>+┊  ┊65┊    } else {</b>
<b>+┊  ┊66┊      if (height &gt; MAX_HEIGHT) {</b>
<b>+┊  ┊67┊        width *&#x3D; MAX_HEIGHT / height;</b>
<b>+┊  ┊68┊        height &#x3D; MAX_HEIGHT;</b>
<b>+┊  ┊69┊      }</b>
<b>+┊  ┊70┊    }</b>
<b>+┊  ┊71┊</b>
<b>+┊  ┊72┊    canvas.width &#x3D; width;</b>
<b>+┊  ┊73┊    canvas.height &#x3D; height;</b>
<b>+┊  ┊74┊</b>
<b>+┊  ┊75┊    // Copy the image contents to the canvas</b>
<b>+┊  ┊76┊    const context &#x3D; canvas.getContext(&#x27;2d&#x27;);</b>
<b>+┊  ┊77┊    context.drawImage(image, 0, 0, width, height);</b>
<b>+┊  ┊78┊</b>
<b>+┊  ┊79┊    // Get the data-URL formatted image</b>
<b>+┊  ┊80┊    // Firefox supports PNG and JPEG. You could check image.src to</b>
<b>+┊  ┊81┊    // guess the original format, but be aware the using &#x27;image/jpg&#x27;</b>
<b>+┊  ┊82┊    // will re-encode the image.</b>
<b>+┊  ┊83┊    const dataURL &#x3D; canvas.toDataURL(&#x27;image/png&#x27;);</b>
<b>+┊  ┊84┊</b>
<b>+┊  ┊85┊    return dataURL.replace(/^data:image\/(png|jpg);base64,/, &#x27;&#x27;);</b>
<b>+┊  ┊86┊  }</b>
<b>+┊  ┊87┊</b>
<b>+┊  ┊88┊  convertDataURIToBlob(dataURI): Blob {</b>
<b>+┊  ┊89┊    const binary &#x3D; atob(dataURI);</b>
<b>+┊  ┊90┊</b>
<b>+┊  ┊91┊    // Write the bytes of the string to a typed array</b>
<b>+┊  ┊92┊    const charCodes &#x3D; Object.keys(binary)</b>
<b>+┊  ┊93┊      .map&lt;number&gt;(Number)</b>
<b>+┊  ┊94┊      .map&lt;number&gt;(binary.charCodeAt.bind(binary));</b>
<b>+┊  ┊95┊</b>
<b>+┊  ┊96┊    // Build blob with typed array</b>
<b>+┊  ┊97┊    return new Blob([new Uint8Array(charCodes)], {type: &#x27;image/jpeg&#x27;});</b>
<b>+┊  ┊98┊  }</b>
<b>+┊  ┊99┊}</b>
</pre>

[}]: #

In order to use the service we will need to import it in the app's `NgModule` as a `provider`:

[{]: <helper> (diffStep 13.5)

#### [Step 13.5: Import PictureService](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/dacc5f0)

##### Changed src&#x2F;app&#x2F;app.module.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊18┊18┊import { ProfilePage } from &#x27;../pages/profile/profile&#x27;;
 ┊19┊19┊import { VerificationPage } from &#x27;../pages/verification/verification&#x27;;
 ┊20┊20┊import { PhoneService } from &#x27;../services/phone&#x27;;
<b>+┊  ┊21┊import { PictureService } from &#x27;../services/picture&#x27;;</b>
 ┊21┊22┊import { MyApp } from &#x27;./app.component&#x27;;
 ┊22┊23┊
 ┊23┊24┊@NgModule({
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊62┊63┊    Geolocation,
 ┊63┊64┊    {provide: ErrorHandler, useClass: IonicErrorHandler},
 ┊64┊65┊    PhoneService,
<b>+┊  ┊66┊    ImagePicker,</b>
<b>+┊  ┊67┊    PictureService</b>
 ┊66┊68┊  ]
 ┊67┊69┊})
 ┊68┊70┊export class AppModule {}
</pre>

[}]: #

Since now we will be sending pictures, we will need to update the message schema to support picture typed messages:

[{]: <helper> (diffStep 13.6)

#### [Step 13.6: Added picture message type](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/b6912d1)

##### Changed api&#x2F;server&#x2F;models.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
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

[{]: <helper> (diffStep 13.7)

#### [Step 13.7: Implement sendPicture method](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/160bae4)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages-attachments.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊2┊2┊import { AlertController, Platform, ModalController, ViewController } from &#x27;ionic-angular&#x27;;
 ┊3┊3┊import { NewLocationMessageComponent } from &#x27;./location-message&#x27;;
 ┊4┊4┊import { MessageType } from &#x27;api/models&#x27;;
<b>+┊ ┊5┊import { PictureService } from &#x27;../../services/picture&#x27;;</b>
 ┊5┊6┊
 ┊6┊7┊@Component({
 ┊7┊8┊  selector: &#x27;messages-attachments&#x27;,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
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

[{]: <helper> (diffStep 13.8)

#### [Step 13.8: Bind click event for sendPicture](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/ff9587c)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages-attachments.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊&lt;ion-content class&#x3D;&quot;messages-attachments-page-content&quot;&gt;
 ┊2┊2┊  &lt;ion-list class&#x3D;&quot;attachments&quot;&gt;
<b>+┊ ┊3┊    &lt;button ion-item class&#x3D;&quot;attachment attachment-gallery&quot; (click)&#x3D;&quot;sendPicture()&quot;&gt;</b>
 ┊4┊4┊      &lt;ion-icon name&#x3D;&quot;images&quot; class&#x3D;&quot;attachment-icon&quot;&gt;&lt;/ion-icon&gt;
 ┊5┊5┊      &lt;div class&#x3D;&quot;attachment-name&quot;&gt;Gallery&lt;/div&gt;
 ┊6┊6┊    &lt;/button&gt;
</pre>

[}]: #

Now we will be extending the `MessagesPage`, by adding a method which will send the picture selected in the attachments menu:

[{]: <helper> (diffStep 13.9)

#### [Step 13.9: Implement the actual send of picture message](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/eb2f15e)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 8┊ 8┊import { MessagesOptionsComponent } from &#x27;./messages-options&#x27;;
 ┊ 9┊ 9┊import { Subscription, Observable, Subscriber } from &#x27;rxjs&#x27;;
 ┊10┊10┊import { MessagesAttachmentsComponent } from &#x27;./messages-attachments&#x27;;
<b>+┊  ┊11┊import { PictureService } from &#x27;../../services/picture&#x27;;</b>
 ┊11┊12┊
 ┊12┊13┊@Component({
 ┊13┊14┊  selector: &#x27;messages-page&#x27;,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
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
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊236┊238┊          const location &#x3D; params.selectedLocation;
 ┊237┊239┊          this.sendLocationMessage(location);
 ┊238┊240┊        }
<b>+┊   ┊241┊        else if (params.messageType &#x3D;&#x3D;&#x3D; MessageType.PICTURE) {</b>
<b>+┊   ┊242┊          const blob: File &#x3D; params.selectedPicture;</b>
<b>+┊   ┊243┊          this.sendPictureMessage(blob);</b>
<b>+┊   ┊244┊        }</b>
 ┊239┊245┊      }
 ┊240┊246┊    });
 ┊241┊247┊
 ┊242┊248┊    popover.present();
 ┊243┊249┊  }
 ┊244┊250┊
<b>+┊   ┊251┊  sendPictureMessage(blob: File): void {</b>
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

[{]: <helper> (diffStep "13.10")

#### [Step 13.10: Create stub method for upload method](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/73fb067)

##### Changed src&#x2F;services&#x2F;picture.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊28┊28┊    });
 ┊29┊29┊  }
 ┊30┊30┊
<b>+┊  ┊31┊  upload(blob: File): Promise&lt;any&gt; {</b>
<b>+┊  ┊32┊    return Promise.resolve();</b>
<b>+┊  ┊33┊  }</b>
<b>+┊  ┊34┊</b>
 ┊31┊35┊  convertURLtoBlob(url: string, options &#x3D; {}): Promise&lt;File&gt; {
 ┊32┊36┊    return new Promise((resolve, reject) &#x3D;&gt; {
 ┊33┊37┊      const image &#x3D; document.createElement(&#x27;img&#x27;);
</pre>

[}]: #

## Server Side

So as we said, need to handle storage of pictures that were sent by the client. First, we will create a `Picture` model so the compiler can recognize a picture object:

[{]: <helper> (diffStep 13.11)

#### [Step 13.11: Create Picture model](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/5d1edf0)

##### Changed api&#x2F;server&#x2F;models.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊38┊38┊  lng: number;
 ┊39┊39┊  zoom: number;
 ┊40┊40┊}
<b>+┊  ┊41┊</b>
<b>+┊  ┊42┊export interface Picture {</b>
<b>+┊  ┊43┊  _id?: string;</b>
<b>+┊  ┊44┊  complete?: boolean;</b>
<b>+┊  ┊45┊  extension?: string;</b>
<b>+┊  ┊46┊  name?: string;</b>
<b>+┊  ┊47┊  progress?: number;</b>
<b>+┊  ┊48┊  size?: number;</b>
<b>+┊  ┊49┊  store?: string;</b>
<b>+┊  ┊50┊  token?: string;</b>
<b>+┊  ┊51┊  type?: string;</b>
<b>+┊  ┊52┊  uploadedAt?: Date;</b>
<b>+┊  ┊53┊  uploading?: boolean;</b>
<b>+┊  ┊54┊  url?: string;</b>
<b>+┊  ┊55┊  userId?: string;</b>
<b>+┊  ┊56┊}</b>
</pre>

[}]: #

If you're familiar with `Whatsapp`, you'll know that sent pictures are compressed. That's so the data-base can store more pictures, and the traffic in the network will be faster. To compress the sent pictures, we will be using an `NPM` package called [sharp](https://www.npmjs.com/package/sharp), which is a utility library which will help us perform transformations on pictures:

    $ meteor npm install --save sharp

> Be sure to use `meteor npm` and not `npm`, and that's because we wanna make sure that `sharp` is compatible with the server.

> Since `sharp` bundles a binary version of `libvips`, depending on your distro you may need to install a packaged version of `vips` in order to get it working.
> For example on Arch Linux you will need to install `vips` from AUR.

Now we will create a picture store which will compress pictures using `sharp` right before they are inserted into the data-base:

[{]: <helper> (diffStep 13.13)

#### [Step 13.13: Create pictures store](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/6541455)

##### Added api&#x2F;server&#x2F;collections&#x2F;pictures.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { MongoObservable } from &#x27;meteor-rxjs&#x27;;</b>
<b>+┊  ┊ 2┊import { UploadFS } from &#x27;meteor/jalik:ufs&#x27;;</b>
<b>+┊  ┊ 3┊import { Meteor } from &#x27;meteor/meteor&#x27;;</b>
<b>+┊  ┊ 4┊import * as sharp from &#x27;sharp&#x27;;</b>
<b>+┊  ┊ 5┊import { Picture, DEFAULT_PICTURE_URL } from &#x27;../models&#x27;;</b>
<b>+┊  ┊ 6┊</b>
<b>+┊  ┊ 7┊export interface PicturesCollection&lt;T&gt; extends MongoObservable.Collection&lt;T&gt; {</b>
<b>+┊  ┊ 8┊  getPictureUrl(selector?: Object | string, platform?: string): string;</b>
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
<b>+┊  ┊26┊    // Resize picture, then crop it to 1:1 aspect ratio, then compress it to 75% from its original quality</b>
<b>+┊  ┊27┊    const transform &#x3D; sharp().resize(800,800).min().crop().toFormat(&#x27;jpeg&#x27;, {quality: 75});</b>
<b>+┊  ┊28┊    from.pipe(transform).pipe(to);</b>
<b>+┊  ┊29┊  }</b>
<b>+┊  ┊30┊});</b>
<b>+┊  ┊31┊</b>
<b>+┊  ┊32┊// Gets picture&#x27;s url by a given selector</b>
<b>+┊  ┊33┊Pictures.getPictureUrl &#x3D; function (selector, platform &#x3D; &quot;&quot;) {</b>
<b>+┊  ┊34┊  const prefix &#x3D; platform &#x3D;&#x3D;&#x3D; &quot;android&quot; ? &quot;/android_asset/www&quot; :</b>
<b>+┊  ┊35┊    platform &#x3D;&#x3D;&#x3D; &quot;ios&quot; ? &quot;&quot; : &quot;&quot;;</b>
<b>+┊  ┊36┊</b>
<b>+┊  ┊37┊  const picture &#x3D; this.findOne(selector) || {};</b>
<b>+┊  ┊38┊  return picture.url || prefix + DEFAULT_PICTURE_URL;</b>
<b>+┊  ┊39┊};</b>
<b>+┊  ┊40┊</b>
<b>+┊  ┊41┊function picturesPermissions(userId: string): boolean {</b>
<b>+┊  ┊42┊  return Meteor.isServer || !!userId;</b>
<b>+┊  ┊43┊}</b>
</pre>

[}]: #

You can look at a store as some sort of a wrapper for a collection, which will run different kind of a operations before it mutates it or fetches data from it. Note that we used `GridFS` because this way an uploaded file is split into multiple packets, which is more efficient for storage. We also defined a small utility function on that store which will retrieve a profile picture. If the ID was not found, it will return a link for the default picture. To make things convenient, we will also export the store from the `index` file:

[{]: <helper> (diffStep 13.14)

#### [Step 13.14: Export pictures collection](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/33c541f)

##### Changed api&#x2F;server&#x2F;collections&#x2F;index.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊export * from &#x27;./chats&#x27;;
 ┊2┊2┊export * from &#x27;./messages&#x27;;
 ┊3┊3┊export * from &#x27;./users&#x27;;
<b>+┊ ┊4┊export * from &#x27;./pictures&#x27;;</b>
</pre>

[}]: #

Now that we have the pictures store, and the server knows how to handle uploaded pictures, we will implement the `upload` stub in the `PictureService`:

[{]: <helper> (diffStep 13.15)

#### [Step 13.15: Implement upload method](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/3ff56d0)

##### Changed src&#x2F;services&#x2F;picture.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 2┊ 2┊import { Platform } from &#x27;ionic-angular&#x27;;
 ┊ 3┊ 3┊import { ImagePicker } from &#x27;@ionic-native/image-picker&#x27;;
 ┊ 4┊ 4┊import { UploadFS } from &#x27;meteor/jalik:ufs&#x27;;
<b>+┊  ┊ 5┊import { PicturesStore } from &#x27;api/collections&#x27;;</b>
<b>+┊  ┊ 6┊import { _ } from &#x27;meteor/underscore&#x27;;</b>
<b>+┊  ┊ 7┊import { DEFAULT_PICTURE_URL } from &#x27;api/models&#x27;;</b>
 ┊ 5┊ 8┊
 ┊ 6┊ 9┊@Injectable()
 ┊ 7┊10┊export class PictureService {
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊29┊32┊  }
 ┊30┊33┊
 ┊31┊34┊  upload(blob: File): Promise&lt;any&gt; {
<b>+┊  ┊35┊    return new Promise((resolve, reject) &#x3D;&gt; {</b>
<b>+┊  ┊36┊      const metadata &#x3D; _.pick(blob, &#x27;name&#x27;, &#x27;type&#x27;, &#x27;size&#x27;);</b>
<b>+┊  ┊37┊</b>
<b>+┊  ┊38┊      if (!metadata.name) {</b>
<b>+┊  ┊39┊        metadata.name &#x3D; DEFAULT_PICTURE_URL;</b>
<b>+┊  ┊40┊      }</b>
<b>+┊  ┊41┊</b>
<b>+┊  ┊42┊      const upload &#x3D; new UploadFS.Uploader({</b>
<b>+┊  ┊43┊        data: blob,</b>
<b>+┊  ┊44┊        file: metadata,</b>
<b>+┊  ┊45┊        store: PicturesStore,</b>
<b>+┊  ┊46┊        onComplete: resolve,</b>
<b>+┊  ┊47┊        onError: reject</b>
<b>+┊  ┊48┊      });</b>
<b>+┊  ┊49┊</b>
<b>+┊  ┊50┊      upload.start();</b>
<b>+┊  ┊51┊    });</b>
 ┊33┊52┊  }
 ┊34┊53┊
 ┊35┊54┊  convertURLtoBlob(url: string, options &#x3D; {}): Promise&lt;File&gt; {
</pre>

[}]: #

Since `sharp` is a server-only package, and it is not supported by the client, at all, we will replace it with an empty dummy-object so errors won't occur. This requires us to change the `Webpack` config as shown below:

[{]: <helper> (diffStep 13.16)

#### [Step 13.16: Ignore sharp package on client side](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/4e1cfcc)

##### Changed webpack.config.js
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊21┊21┊  },
 ┊22┊22┊
 ┊23┊23┊  externals: [
<b>+┊  ┊24┊    {</b>
<b>+┊  ┊25┊      sharp: &#x27;{}&#x27;</b>
<b>+┊  ┊26┊    },</b>
 ┊24┊27┊    resolveExternals
 ┊25┊28┊  ],
</pre>

[}]: #

## View Picture Messages

We will now add the support for picture typed messages in the `MessagesPage`, so whenever we send a picture, we will be able to see them in the messages list like any other message:

[{]: <helper> (diffStep 13.17)

#### [Step 13.17: Added view for picture message](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/714a18b)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊24┊24┊              &lt;agm-marker [latitude]&#x3D;&quot;getLocation(message.content).lat&quot; [longitude]&#x3D;&quot;getLocation(message.content).lng&quot;&gt;&lt;/agm-marker&gt;
 ┊25┊25┊            &lt;/agm-map&gt;
 ┊26┊26┊          &lt;/div&gt;
<b>+┊  ┊27┊          &lt;img *ngIf&#x3D;&quot;message.type &#x3D;&#x3D; &#x27;picture&#x27;&quot; (click)&#x3D;&quot;showPicture($event)&quot; class&#x3D;&quot;message-content message-content-picture&quot; [src]&#x3D;&quot;message.content&quot;&gt;</b>
 ┊27┊28┊
 ┊28┊29┊          &lt;span class&#x3D;&quot;message-timestamp&quot;&gt;{{ message.createdAt | amDateFormat: &#x27;HH:mm&#x27; }}&lt;/span&gt;
 ┊29┊30┊        &lt;/div&gt;
</pre>

[}]: #

As you can see, we also bound the picture message to the `click` event, which means that whenever we click on it, a picture viewer should be opened with the clicked picture. Let's create the component for that picture viewer:

[{]: <helper> (diffStep 13.18)

#### [Step 13.18: Create show picture component](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/c8c6e27)

##### Added src&#x2F;pages&#x2F;messages&#x2F;show-picture.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
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

[{]: <helper> (diffStep 13.19)

#### [Step 13.19: Create show picture template](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/7a0fe7f)

##### Added src&#x2F;pages&#x2F;messages&#x2F;show-picture.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
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

[{]: <helper> (diffStep "13.20")

#### [Step 13.20: Create show pictuer component styles](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/a86992a)

##### Added src&#x2F;pages&#x2F;messages&#x2F;show-picture.scss
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
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

[{]: <helper> (diffStep 13.21)

#### [Step 13.21: Import ShowPictureComponent](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/85cb86d)

##### Changed src&#x2F;app&#x2F;app.module.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊15┊15┊import { MessagesAttachmentsComponent } from &#x27;../pages/messages/messages-attachments&#x27;;
 ┊16┊16┊import { MessagesOptionsComponent } from &#x27;../pages/messages/messages-options&#x27;;
 ┊17┊17┊import { NewLocationMessageComponent } from &#x27;../pages/messages/location-message&#x27;;
<b>+┊  ┊18┊import { ShowPictureComponent } from &#x27;../pages/messages/show-picture&#x27;;</b>
 ┊18┊19┊import { ProfilePage } from &#x27;../pages/profile/profile&#x27;;
 ┊19┊20┊import { VerificationPage } from &#x27;../pages/verification/verification&#x27;;
 ┊20┊21┊import { PhoneService } from &#x27;../services/phone&#x27;;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊33┊34┊    NewChatComponent,
 ┊34┊35┊    MessagesOptionsComponent,
 ┊35┊36┊    MessagesAttachmentsComponent,
<b>+┊  ┊37┊    NewLocationMessageComponent,</b>
<b>+┊  ┊38┊    ShowPictureComponent</b>
 ┊37┊39┊  ],
 ┊38┊40┊  imports: [
 ┊39┊41┊    BrowserModule,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊55┊57┊    NewChatComponent,
 ┊56┊58┊    MessagesOptionsComponent,
 ┊57┊59┊    MessagesAttachmentsComponent,
<b>+┊  ┊60┊    NewLocationMessageComponent,</b>
<b>+┊  ┊61┊    ShowPictureComponent</b>
 ┊59┊62┊  ],
 ┊60┊63┊  providers: [
 ┊61┊64┊    StatusBar,
</pre>

[}]: #

And now that we have that component ready, we will implement the `showPicture` method in the `MessagesPage` component, which will create a new instance of the `ShowPictureComponent`:

[{]: <helper> (diffStep 13.22)

#### [Step 13.22: Implement showPicture method](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/9c880ec)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊import { Component, OnInit, OnDestroy, ElementRef } from &#x27;@angular/core&#x27;;
<b>+┊ ┊2┊import { NavParams, PopoverController, ModalController } from &#x27;ionic-angular&#x27;;</b>
 ┊3┊3┊import { Chat, Message, MessageType, Location } from &#x27;api/models&#x27;;
 ┊4┊4┊import { Messages } from &#x27;api/collections&#x27;;
 ┊5┊5┊import { MeteorObservable } from &#x27;meteor-rxjs&#x27;;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 9┊ 9┊import { Subscription, Observable, Subscriber } from &#x27;rxjs&#x27;;
 ┊10┊10┊import { MessagesAttachmentsComponent } from &#x27;./messages-attachments&#x27;;
 ┊11┊11┊import { PictureService } from &#x27;../../services/picture&#x27;;
<b>+┊  ┊12┊import { ShowPictureComponent } from &#x27;./show-picture&#x27;;</b>
 ┊12┊13┊
 ┊13┊14┊@Component({
 ┊14┊15┊  selector: &#x27;messages-page&#x27;,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
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
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
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

[{]: <helper> (diffStep 13.23)

#### [Step 13.23: Add pictureId property to Profile](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/ace63e3)

##### Changed api&#x2F;server&#x2F;models.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
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

[{]: <helper> (diffStep 13.24)

#### [Step 13.24: Add event for changing profile picture](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/3c1d127)

##### Changed src&#x2F;pages&#x2F;profile&#x2F;profile.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
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

[{]: <helper> (diffStep 13.25)

#### [Step 13.25: Implement pick, update and set of profile image](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/57b9089)

##### Changed src&#x2F;pages&#x2F;profile&#x2F;profile.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 1┊ 1┊import { Component, OnInit } from &#x27;@angular/core&#x27;;
 ┊ 2┊ 2┊import { Profile } from &#x27;api/models&#x27;;
<b>+┊  ┊ 3┊import { AlertController, NavController, Platform } from &#x27;ionic-angular&#x27;;</b>
 ┊ 4┊ 4┊import { MeteorObservable } from &#x27;meteor-rxjs&#x27;;
 ┊ 5┊ 5┊import { ChatsPage } from &#x27;../chats/chats&#x27;;
<b>+┊  ┊ 6┊import { PictureService } from &#x27;../../services/picture&#x27;;</b>
<b>+┊  ┊ 7┊import { Pictures } from &#x27;api/collections&#x27;;</b>
 ┊ 6┊ 8┊
 ┊ 7┊ 9┊@Component({
 ┊ 8┊10┊  selector: &#x27;profile&#x27;,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊14┊16┊
 ┊15┊17┊  constructor(
 ┊16┊18┊    private alertCtrl: AlertController,
<b>+┊  ┊19┊    private navCtrl: NavController,</b>
<b>+┊  ┊20┊    private pictureService: PictureService,</b>
<b>+┊  ┊21┊    private platform: Platform</b>
 ┊18┊22┊  ) {}
 ┊19┊23┊
 ┊20┊24┊  ngOnInit(): void {
 ┊21┊25┊    this.profile &#x3D; Meteor.user().profile || {
 ┊22┊26┊      name: &#x27;&#x27;
 ┊23┊27┊    };
<b>+┊  ┊28┊</b>
<b>+┊  ┊29┊    MeteorObservable.subscribe(&#x27;user&#x27;).subscribe(() &#x3D;&gt; {</b>
<b>+┊  ┊30┊      let platform &#x3D; this.platform.is(&#x27;android&#x27;) ? &quot;android&quot; :</b>
<b>+┊  ┊31┊        this.platform.is(&#x27;ios&#x27;) ? &quot;ios&quot; : &quot;&quot;;</b>
<b>+┊  ┊32┊      platform &#x3D; this.platform.is(&#x27;cordova&#x27;) ? platform : &quot;&quot;;</b>
<b>+┊  ┊33┊</b>
<b>+┊  ┊34┊      this.picture &#x3D; Pictures.getPictureUrl(this.profile.pictureId, platform);</b>
<b>+┊  ┊35┊    });</b>
<b>+┊  ┊36┊  }</b>
<b>+┊  ┊37┊</b>
<b>+┊  ┊38┊  selectProfilePicture(): void {</b>
<b>+┊  ┊39┊    this.pictureService.select().then((blob) &#x3D;&gt; {</b>
<b>+┊  ┊40┊      this.uploadProfilePicture(blob);</b>
<b>+┊  ┊41┊    })</b>
<b>+┊  ┊42┊      .catch((e) &#x3D;&gt; {</b>
<b>+┊  ┊43┊        this.handleError(e);</b>
<b>+┊  ┊44┊      });</b>
<b>+┊  ┊45┊  }</b>
<b>+┊  ┊46┊</b>
<b>+┊  ┊47┊  uploadProfilePicture(blob: File): void {</b>
<b>+┊  ┊48┊    this.pictureService.upload(blob).then((picture) &#x3D;&gt; {</b>
<b>+┊  ┊49┊      this.profile.pictureId &#x3D; picture._id;</b>
<b>+┊  ┊50┊      this.picture &#x3D; picture.url;</b>
<b>+┊  ┊51┊    })</b>
<b>+┊  ┊52┊      .catch((e) &#x3D;&gt; {</b>
<b>+┊  ┊53┊        this.handleError(e);</b>
<b>+┊  ┊54┊      });</b>
 ┊24┊55┊  }
 ┊25┊56┊
 ┊26┊57┊  updateProfile(): void {
</pre>

[}]: #

We will also define a new hook in the `Meteor.users` collection so whenever we update the profile picture, the previous one will be removed from the data-base. This way we won't have some unnecessary data in our data-base, which will save us some precious storage:

[{]: <helper> (diffStep 13.26)

#### [Step 13.26: Add after hook for user modification](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/7f552a0)

##### Changed api&#x2F;server&#x2F;collections&#x2F;users.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
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
<b>+┊  ┊14┊  Pictures.collection.remove({ _id: this.previous.profile.pictureId });</b>
<b>+┊  ┊15┊}, { fetchPrevious: true });</b>
</pre>

[}]: #

Collection hooks are not part of `Meteor`'s official API and are added through a third-party package called `matb33:collection-hooks`. This requires us to install the necessary type definition:

    $ npm install --save-dev @types/meteor-collection-hooks

Now we need to import the type definition we've just installed in the `tsconfig.json` file:

[{]: <helper> (diffStep 13.28)

#### [Step 13.28: Import meteor-collection-hooks typings](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/036e575)

##### Changed api&#x2F;tsconfig.json
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
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
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊21┊21┊    &quot;noImplicitAny&quot;: false,
 ┊22┊22┊    &quot;types&quot;: [
 ┊23┊23┊      &quot;@types/underscore&quot;,
<b>+┊  ┊24┊      &quot;@types/meteor-accounts-phone&quot;,</b>
<b>+┊  ┊25┊      &quot;@types/meteor-collection-hooks&quot;</b>
 ┊25┊26┊    ]
 ┊26┊27┊  },
 ┊27┊28┊  &quot;include&quot;: [
</pre>

[}]: #

We now add a `user` publication which should be subscribed whenever we initialize the `ProfilePage`. This subscription should fetch some data from other collections which is related to the user which is currently logged in; And to be more specific, the document associated with the `profileId` defined in the `User` model:

[{]: <helper> (diffStep 13.29)

#### [Step 13.29: Add user publication](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/f9e0703)

##### Changed api&#x2F;server&#x2F;publications.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊2┊2┊import { Users } from &#x27;./collections/users&#x27;;
 ┊3┊3┊import { Messages } from &#x27;./collections/messages&#x27;;
 ┊4┊4┊import { Chats } from &#x27;./collections/chats&#x27;;
<b>+┊ ┊5┊import { Pictures } from &#x27;./collections/pictures&#x27;;</b>
 ┊5┊6┊
 ┊6┊7┊Meteor.publishComposite(&#x27;users&#x27;, function(
 ┊7┊8┊  pattern: string
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
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

[{]: <helper> (diffStep "13.30")

#### [Step 13.30: Added images to users publication](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/eaecfd4)

##### Changed api&#x2F;server&#x2F;publications.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊ ┊1┊import { User, Message, Chat, Picture } from &#x27;./models&#x27;;</b>
 ┊2┊2┊import { Users } from &#x27;./collections/users&#x27;;
 ┊3┊3┊import { Messages } from &#x27;./collections/messages&#x27;;
 ┊4┊4┊import { Chats } from &#x27;./collections/chats&#x27;;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
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

[{]: <helper> (diffStep 13.31)

#### [Step 13.31: Add images to chats publication](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/ba64a09)

##### Changed api&#x2F;server&#x2F;publications.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊80┊80┊          }, {
 ┊81┊81┊            fields: { profile: 1 }
 ┊82┊82┊          });
<b>+┊  ┊83┊        },</b>
<b>+┊  ┊84┊        children: [</b>
<b>+┊  ┊85┊          &lt;PublishCompositeConfig2&lt;Chat, User, Picture&gt;&gt; {</b>
<b>+┊  ┊86┊            find: (user, chat) &#x3D;&gt; {</b>
<b>+┊  ┊87┊              return Pictures.collection.find(user.profile.pictureId, {</b>
<b>+┊  ┊88┊                fields: { url: 1 }</b>
<b>+┊  ┊89┊              });</b>
<b>+┊  ┊90┊            }</b>
<b>+┊  ┊91┊          }</b>
<b>+┊  ┊92┊        ]</b>
 ┊84┊93┊      }
 ┊85┊94┊    ]
 ┊86┊95┊  };
</pre>

[}]: #

Since we already set up some collection hooks on the users collection, we can take it a step further by defining collection hooks on the chat collection, so whenever a chat is being removed, all its corresponding messages will be removed as well:

[{]: <helper> (diffStep 13.32)

#### [Step 13.32: Add hook for removing unused messages](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/4a8e355)

##### Changed api&#x2F;server&#x2F;collections&#x2F;chats.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
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

[{]: <helper> (diffStep 13.33)

#### [Step 13.33: Allow updating pictureId](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/5d17337)

##### Changed api&#x2F;server&#x2F;methods.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
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

[{]: <helper> (diffStep 13.34)

#### [Step 13.34: Update creation of users stubs](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/0082f4f)

##### Changed api&#x2F;server&#x2F;main.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊import { Meteor } from &#x27;meteor/meteor&#x27;;
<b>+┊ ┊2┊import { Picture } from &#x27;./models&#x27;;</b>
 ┊2┊3┊import { Accounts } from &#x27;meteor/accounts-base&#x27;;
 ┊3┊4┊import { Users } from &#x27;./collections/users&#x27;;
 ┊4┊5┊
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊12┊13┊    return;
 ┊13┊14┊  }
 ┊14┊15┊
<b>+┊  ┊16┊  let picture &#x3D; importPictureFromUrl({</b>
<b>+┊  ┊17┊    name: &#x27;man1.jpg&#x27;,</b>
<b>+┊  ┊18┊    url: &#x27;https://randomuser.me/api/portraits/men/1.jpg&#x27;</b>
<b>+┊  ┊19┊  });</b>
<b>+┊  ┊20┊</b>
 ┊15┊21┊  Accounts.createUserWithPhone({
 ┊16┊22┊    phone: &#x27;+972540000001&#x27;,
 ┊17┊23┊    profile: {
 ┊18┊24┊      name: &#x27;Ethan Gonzalez&#x27;,
<b>+┊  ┊25┊      pictureId: picture._id</b>
 ┊20┊26┊    }
 ┊21┊27┊  });
 ┊22┊28┊
<b>+┊  ┊29┊  picture &#x3D; importPictureFromUrl({</b>
<b>+┊  ┊30┊    name: &#x27;lego1.jpg&#x27;,</b>
<b>+┊  ┊31┊    url: &#x27;https://randomuser.me/api/portraits/lego/1.jpg&#x27;</b>
<b>+┊  ┊32┊  });</b>
<b>+┊  ┊33┊</b>
 ┊23┊34┊  Accounts.createUserWithPhone({
 ┊24┊35┊    phone: &#x27;+972540000002&#x27;,
 ┊25┊36┊    profile: {
 ┊26┊37┊      name: &#x27;Bryan Wallace&#x27;,
<b>+┊  ┊38┊      pictureId: picture._id</b>
 ┊28┊39┊    }
 ┊29┊40┊  });
 ┊30┊41┊
<b>+┊  ┊42┊  picture &#x3D; importPictureFromUrl({</b>
<b>+┊  ┊43┊    name: &#x27;woman1.jpg&#x27;,</b>
<b>+┊  ┊44┊    url: &#x27;https://randomuser.me/api/portraits/women/1.jpg&#x27;</b>
<b>+┊  ┊45┊  });</b>
<b>+┊  ┊46┊</b>
 ┊31┊47┊  Accounts.createUserWithPhone({
 ┊32┊48┊    phone: &#x27;+972540000003&#x27;,
 ┊33┊49┊    profile: {
 ┊34┊50┊      name: &#x27;Avery Stewart&#x27;,
<b>+┊  ┊51┊      pictureId: picture._id</b>
 ┊36┊52┊    }
 ┊37┊53┊  });
 ┊38┊54┊
<b>+┊  ┊55┊  picture &#x3D; importPictureFromUrl({</b>
<b>+┊  ┊56┊    name: &#x27;woman2.jpg&#x27;,</b>
<b>+┊  ┊57┊    url: &#x27;https://randomuser.me/api/portraits/women/2.jpg&#x27;</b>
<b>+┊  ┊58┊  });</b>
<b>+┊  ┊59┊</b>
 ┊39┊60┊  Accounts.createUserWithPhone({
 ┊40┊61┊    phone: &#x27;+972540000004&#x27;,
 ┊41┊62┊    profile: {
 ┊42┊63┊      name: &#x27;Katie Peterson&#x27;,
<b>+┊  ┊64┊      pictureId: picture._id</b>
 ┊44┊65┊    }
 ┊45┊66┊  });
 ┊46┊67┊
<b>+┊  ┊68┊  picture &#x3D; importPictureFromUrl({</b>
<b>+┊  ┊69┊    name: &#x27;man2.jpg&#x27;,</b>
<b>+┊  ┊70┊    url: &#x27;https://randomuser.me/api/portraits/men/2.jpg&#x27;</b>
<b>+┊  ┊71┊  });</b>
<b>+┊  ┊72┊</b>
 ┊47┊73┊  Accounts.createUserWithPhone({
 ┊48┊74┊    phone: &#x27;+972540000005&#x27;,
 ┊49┊75┊    profile: {
 ┊50┊76┊      name: &#x27;Ray Edwards&#x27;,
<b>+┊  ┊77┊      pictureId: picture._id</b>
 ┊52┊78┊    }
 ┊53┊79┊  });
 ┊54┊80┊});
<b>+┊  ┊81┊</b>
<b>+┊  ┊82┊function importPictureFromUrl(options: { name: string, url: string }): Picture {</b>
<b>+┊  ┊83┊  const description &#x3D; { name: options.name };</b>
<b>+┊  ┊84┊</b>
<b>+┊  ┊85┊  return Meteor.call(&#x27;ufsImportURL&#x27;, options.url, description, &#x27;pictures&#x27;);</b>
<b>+┊  ┊86┊}</b>
</pre>

[}]: #

In order for `ufs-gridfs` to work properly on Android we need to specify how the client is supposed to reach the backend and how to generate the URLs when importing the images:

[{]: <helper> (diffStep 13.35)

#### [Step 13.35: Set ROOT_URL environmental parameter before launching Meteor](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/fe6f4c2)

##### Changed package.json
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 9┊ 9┊    &quot;url&quot;: &quot;https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp.git&quot;
 ┊10┊10┊  },
 ┊11┊11┊  &quot;scripts&quot;: {
<b>+┊  ┊12┊    &quot;api&quot;: &quot;cd api &amp;&amp; export ROOT_URL&#x3D;http://192.168.1.156:3000 &amp;&amp; meteor run --settings private/settings.json&quot;,</b>
<b>+┊  ┊13┊    &quot;api:reset&quot;: &quot;cd api &amp;&amp; export ROOT_URL&#x3D;http://192.168.1.156:3000 &amp;&amp; meteor reset&quot;,</b>
 ┊13┊14┊    &quot;clean&quot;: &quot;ionic-app-scripts clean&quot;,
 ┊14┊15┊    &quot;build&quot;: &quot;ionic-app-scripts build&quot;,
 ┊15┊16┊    &quot;lint&quot;: &quot;ionic-app-scripts lint&quot;,
</pre>

[}]: #

To avoid some unexpected behaviors, we will reset our data-base so our server can re-fabricate the data:

    $ npm run meteor:reset

> *NOTE*: we used `$ npm run meteor:reset` instead of `api$ meteor reset` because we need to set the environmental variable to let ufs generate the right URLs during the initial importation.

We will now update the `ChatsPage` to add the belonging picture for each chat during transformation:

[{]: <helper> (diffStep 13.36)

#### [Step 13.36: Fetch user image from server](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/3ea6c69)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;chats.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊import { Component, OnInit } from &#x27;@angular/core&#x27;;
<b>+┊ ┊2┊import { Chats, Messages, Users, Pictures } from &#x27;api/collections&#x27;;</b>
 ┊3┊3┊import { Chat, Message } from &#x27;api/models&#x27;;
<b>+┊ ┊4┊import { NavController, PopoverController, ModalController, AlertController, Platform } from &#x27;ionic-angular&#x27;;</b>
 ┊5┊5┊import { MeteorObservable } from &#x27;meteor-rxjs&#x27;;
 ┊6┊6┊import { Observable, Subscriber } from &#x27;rxjs&#x27;;
 ┊7┊7┊import { MessagesPage } from &#x27;../messages/messages&#x27;;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊19┊19┊    private navCtrl: NavController,
 ┊20┊20┊    private popoverCtrl: PopoverController,
 ┊21┊21┊    private modalCtrl: ModalController,
<b>+┊  ┊22┊    private alertCtrl: AlertController,</b>
<b>+┊  ┊23┊    private platform: Platform) {</b>
 ┊23┊24┊    this.senderId &#x3D; Meteor.userId();
 ┊24┊25┊  }
 ┊25┊26┊
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊48┊49┊
 ┊49┊50┊        if (receiver) {
 ┊50┊51┊          chat.title &#x3D; receiver.profile.name;
<b>+┊  ┊52┊</b>
<b>+┊  ┊53┊          let platform &#x3D; this.platform.is(&#x27;android&#x27;) ? &quot;android&quot; :</b>
<b>+┊  ┊54┊            this.platform.is(&#x27;ios&#x27;) ? &quot;ios&quot; : &quot;&quot;;</b>
<b>+┊  ┊55┊          platform &#x3D; this.platform.is(&#x27;cordova&#x27;) ? platform : &quot;&quot;;</b>
<b>+┊  ┊56┊</b>
<b>+┊  ┊57┊          chat.picture &#x3D; Pictures.getPictureUrl(receiver.profile.pictureId, platform);</b>
 ┊52┊58┊        }
 ┊53┊59┊
 ┊54┊60┊        // This will make the last message reactive
</pre>

[}]: #

And we will do the same in the `NewChatComponent`:

[{]: <helper> (diffStep 13.37)

#### [Step 13.37: Use the new pictureId field for new chat modal](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/15fb6b9)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;new-chat.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊26┊26┊&lt;ion-content class&#x3D;&quot;new-chat&quot;&gt;
 ┊27┊27┊  &lt;ion-list class&#x3D;&quot;users&quot;&gt;
 ┊28┊28┊    &lt;button ion-item *ngFor&#x3D;&quot;let user of users | async&quot; class&#x3D;&quot;user&quot; (click)&#x3D;&quot;addChat(user)&quot;&gt;
<b>+┊  ┊29┊      &lt;img class&#x3D;&quot;user-picture&quot; [src]&#x3D;&quot;getPic(user.profile.pictureId)&quot;&gt;</b>
 ┊30┊30┊      &lt;h2 class&#x3D;&quot;user-name&quot;&gt;{{user.profile.name}}&lt;/h2&gt;
 ┊31┊31┊    &lt;/button&gt;
 ┊32┊32┊  &lt;/ion-list&gt;
</pre>

[}]: #

[{]: <helper> (diffStep 13.38)

#### [Step 13.38: Implement getPic](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/5bffc17)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;new-chat.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊import { Component, OnInit } from &#x27;@angular/core&#x27;;
<b>+┊ ┊2┊import { Chats, Users, Pictures } from &#x27;api/collections&#x27;;</b>
 ┊3┊3┊import { User } from &#x27;api/models&#x27;;
<b>+┊ ┊4┊import { AlertController, Platform, ViewController } from &#x27;ionic-angular&#x27;;</b>
 ┊5┊5┊import { MeteorObservable } from &#x27;meteor-rxjs&#x27;;
 ┊6┊6┊import { _ } from &#x27;meteor/underscore&#x27;;
 ┊7┊7┊import { Observable, Subscription, BehaviorSubject } from &#x27;rxjs&#x27;;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊18┊18┊
 ┊19┊19┊  constructor(
 ┊20┊20┊    private alertCtrl: AlertController,
<b>+┊  ┊21┊    private viewCtrl: ViewController,</b>
<b>+┊  ┊22┊    private platform: Platform</b>
 ┊22┊23┊  ) {
 ┊23┊24┊    this.senderId &#x3D; Meteor.userId();
 ┊24┊25┊    this.searchPattern &#x3D; new BehaviorSubject(undefined);
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊107┊108┊
 ┊108┊109┊    alert.present();
 ┊109┊110┊  }
<b>+┊   ┊111┊</b>
<b>+┊   ┊112┊  getPic(pictureId): string {</b>
<b>+┊   ┊113┊    let platform &#x3D; this.platform.is(&#x27;android&#x27;) ? &quot;android&quot; :</b>
<b>+┊   ┊114┊      this.platform.is(&#x27;ios&#x27;) ? &quot;ios&quot; : &quot;&quot;;</b>
<b>+┊   ┊115┊    platform &#x3D; this.platform.is(&#x27;cordova&#x27;) ? platform : &quot;&quot;;</b>
<b>+┊   ┊116┊</b>
<b>+┊   ┊117┊    return Pictures.getPictureUrl(pictureId, platform);</b>
<b>+┊   ┊118┊  }</b>
 ┊110┊119┊}
</pre>

[}]: #

[{]: <helper> (navStep nextRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/native-mobile" prevRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/google-maps")

⟸ <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/google-maps">PREVIOUS STEP</a> <b>║</b> <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/native-mobile">NEXT STEP</a> ⟹

[}]: #

