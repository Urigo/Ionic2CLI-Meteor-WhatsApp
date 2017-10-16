# Step 13: Native Mobile

In this step, we will be implementing additional native features, to enhance the user experience.

## Automatic phone number detection

`Ionic 2` is provided by default with a `Cordova` plug-in called `cordova-plugin-sim`, which allows us to retrieve some data from the current device's SIM card, if even exists. We will use the SIM card to automatically detect the current device's phone number, so this way the user won't need to manually fill-in his phone number whenever he tries to login. We will start by adding the appropriate handler in the `PhoneService`:

[{]: <helper> (diffStep 13.1)

#### [Step 13.1: Implement getNumber with native ionic](../../../../commit/a86d4b1)
<br>
##### Changed src&#x2F;services&#x2F;phone.ts
<pre>
<i>@@ -2,6 +2,7 @@</i>
 ┊2┊2┊import { Accounts } from &#x27;meteor/accounts-base&#x27;;
 ┊3┊3┊import { Meteor } from &#x27;meteor/meteor&#x27;;
 ┊4┊4┊import { Platform } from &#x27;ionic-angular&#x27;;
<b>+┊ ┊5┊import { Sim } from &#x27;ionic-native&#x27;;</b>
 ┊5┊6┊
 ┊6┊7┊@Injectable()
 ┊7┊8┊export class PhoneService {
</pre>
<pre>
<i>@@ -9,6 +10,17 @@</i>
 ┊ 9┊10┊
 ┊10┊11┊  }
 ┊11┊12┊
<b>+┊  ┊13┊  getNumber(): Promise&lt;string&gt; {</b>
<b>+┊  ┊14┊    if (!this.platform.is(&#x27;cordova&#x27;) ||</b>
<b>+┊  ┊15┊      !this.platform.is(&#x27;mobile&#x27;)) {</b>
<b>+┊  ┊16┊      return Promise.resolve(&#x27;&#x27;);</b>
<b>+┊  ┊17┊    }</b>
<b>+┊  ┊18┊</b>
<b>+┊  ┊19┊    return Sim.getSimInfo().then((info) &#x3D;&gt; {</b>
<b>+┊  ┊20┊      return &#x27;+&#x27; + info.phoneNumber;</b>
<b>+┊  ┊21┊    });</b>
<b>+┊  ┊22┊  }</b>
<b>+┊  ┊23┊</b>
 ┊12┊24┊  verify(phoneNumber: string): Promise&lt;void&gt; {
 ┊13┊25┊    return new Promise&lt;void&gt;((resolve, reject) &#x3D;&gt; {
 ┊14┊26┊      Accounts.requestPhoneVerification(phoneNumber, (e: Error) &#x3D;&gt; {
</pre>

[}]: #

And we will use it inside the `LoginPage`:

[{]: <helper> (diffStep 13.2)

#### [Step 13.2: Use getNumber native method](../../../../commit/f635a64)
<br>
##### Changed src&#x2F;pages&#x2F;login&#x2F;login.ts
<pre>
<i>@@ -1,4 +1,4 @@</i>
<b>+┊ ┊1┊import { Component, AfterContentInit } from &#x27;@angular/core&#x27;;</b>
 ┊2┊2┊import { Alert, AlertController, NavController } from &#x27;ionic-angular&#x27;;
 ┊3┊3┊import { PhoneService } from &#x27;../../services/phone&#x27;;
 ┊4┊4┊import { VerificationPage } from &#x27;../verification/verification&#x27;;
</pre>
<pre>
<i>@@ -7,7 +7,7 @@</i>
 ┊ 7┊ 7┊  selector: &#x27;login&#x27;,
 ┊ 8┊ 8┊  templateUrl: &#x27;login.html&#x27;
 ┊ 9┊ 9┊})
<b>+┊  ┊10┊export class LoginPage implements AfterContentInit {</b>
 ┊11┊11┊  private phone &#x3D; &#x27;&#x27;;
 ┊12┊12┊
 ┊13┊13┊  constructor(
</pre>
<pre>
<i>@@ -16,6 +16,14 @@</i>
 ┊16┊16┊    private navCtrl: NavController
 ┊17┊17┊  ) {}
 ┊18┊18┊
<b>+┊  ┊19┊  ngAfterContentInit() {</b>
<b>+┊  ┊20┊    this.phoneService.getNumber().then((phone) &#x3D;&gt; {</b>
<b>+┊  ┊21┊      if (phone) {</b>
<b>+┊  ┊22┊        this.login(phone);</b>
<b>+┊  ┊23┊      }</b>
<b>+┊  ┊24┊    });</b>
<b>+┊  ┊25┊  }</b>
<b>+┊  ┊26┊</b>
 ┊19┊27┊  onInputKeypress({keyCode}: KeyboardEvent): void {
 ┊20┊28┊    if (keyCode &#x3D;&#x3D;&#x3D; 13) {
 ┊21┊29┊      this.login();
</pre>

[}]: #

In-order for it to work, be sure to install the following `Cordova` plug-in:

    $ ionic plugin add cordova-plugin-sim

## Camera

Next - we will grant access to the device's camera so we can send pictures which are yet to exist in the gallery.

We will start by adding the appropriate `Cordova` plug-in:

    $ ionic plugin add cordova-plugin-camera

We will bind the `click` event in the `MessagesAttachmentsComponent`:

[{]: <helper> (diffStep 13.5)

#### [Step 13.5: Added click event for takePicture](../../../../commit/502deb8)
<br>
##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages-attachments.html
<pre>
<i>@@ -5,7 +5,7 @@</i>
 ┊ 5┊ 5┊      &lt;div class&#x3D;&quot;attachment-name&quot;&gt;Gallery&lt;/div&gt;
 ┊ 6┊ 6┊    &lt;/button&gt;
 ┊ 7┊ 7┊
<b>+┊  ┊ 8┊    &lt;button ion-item class&#x3D;&quot;attachment attachment-camera&quot; (click)&#x3D;&quot;takePicture()&quot;&gt;</b>
 ┊ 9┊ 9┊      &lt;ion-icon name&#x3D;&quot;camera&quot; class&#x3D;&quot;attachment-icon&quot;&gt;&lt;/ion-icon&gt;
 ┊10┊10┊      &lt;div class&#x3D;&quot;attachment-name&quot;&gt;Camera&lt;/div&gt;
 ┊11┊11┊    &lt;/button&gt;
</pre>

[}]: #

And we will use the recently installed `Cordova` plug-in in the event handler to take some pictures:

[{]: <helper> (diffStep 13.6)

#### [Step 13.6: Implement takePicture](../../../../commit/48a4f0a)
<br>
##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages-attachments.ts
<pre>
<i>@@ -3,6 +3,7 @@</i>
 ┊3┊3┊import { NewLocationMessageComponent } from &#x27;./location-message&#x27;;
 ┊4┊4┊import { MessageType } from &#x27;api/models&#x27;;
 ┊5┊5┊import { PictureService } from &#x27;../../services/picture&#x27;;
<b>+┊ ┊6┊import { Camera } from &#x27;ionic-native&#x27;;</b>
 ┊6┊7┊
 ┊7┊8┊@Component({
 ┊8┊9┊  selector: &#x27;messages-attachments&#x27;,
</pre>
<pre>
<i>@@ -26,6 +27,21 @@</i>
 ┊26┊27┊    });
 ┊27┊28┊  }
 ┊28┊29┊
<b>+┊  ┊30┊  takePicture(): void {</b>
<b>+┊  ┊31┊    if (!this.platform.is(&#x27;cordova&#x27;)) {</b>
<b>+┊  ┊32┊      return console.warn(&#x27;Device must run cordova in order to take pictures&#x27;);</b>
<b>+┊  ┊33┊    }</b>
<b>+┊  ┊34┊</b>
<b>+┊  ┊35┊    Camera.getPicture().then((dataURI) &#x3D;&gt; {</b>
<b>+┊  ┊36┊      const blob &#x3D; this.pictureService.convertDataURIToBlob(dataURI);</b>
<b>+┊  ┊37┊</b>
<b>+┊  ┊38┊      this.viewCtrl.dismiss({</b>
<b>+┊  ┊39┊        messageType: MessageType.PICTURE,</b>
<b>+┊  ┊40┊        selectedPicture: blob</b>
<b>+┊  ┊41┊      });</b>
<b>+┊  ┊42┊    });</b>
<b>+┊  ┊43┊  }</b>
<b>+┊  ┊44┊</b>
 ┊29┊45┊  sendLocation(): void {
 ┊30┊46┊    const locationModal &#x3D; this.modelCtrl.create(NewLocationMessageComponent);
 ┊31┊47┊    locationModal.onDidDismiss((location) &#x3D;&gt; {
</pre>

[}]: #

Note that take pictures are retrieved as relative paths in the device, but we use some existing methods in the `PictureService` to convert these paths into the desired format.

[{]: <helper> (navStep nextRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/summary" prevRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/file-upload")

⟸ <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/file-upload">PREVIOUS STEP</a> <b>║</b> <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/summary">NEXT STEP</a> ⟹

[}]: #

