# Step 14: Native Mobile

In this step, we will be implementing additional native features like automatic phone number detection and access to the device's camera, to enhance the user experience.

## Automatic phone number detection

`Ionic 2` is provided by default with a `Cordova` plug-in called `cordova-plugin-sim`, which allows us to retrieve some data from the current device's SIM card, if even exists. We will use the SIM card to automatically detect the current device's phone number, so this way the user won't need to manually fill-in his phone number whenever he tries to login.

Let's start installing the `Sim` `Cordova` plug-in:

    $ ionic cordova plugin add cordova-plugin-sim --save
    $ npm install --save @ionic-native/sim

Then let's add it to `app.module.ts`:

[{]: <helper> (diffStep 14.2)

#### [Step 14.2: Add Sim to app.module.ts](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/91fa0e5)

##### Changed src&#x2F;app&#x2F;app.module.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 5┊ 5┊import { StatusBar } from &#x27;@ionic-native/status-bar&#x27;;
 ┊ 6┊ 6┊import { Geolocation } from &#x27;@ionic-native/geolocation&#x27;;
 ┊ 7┊ 7┊import { ImagePicker } from &#x27;@ionic-native/image-picker&#x27;;
<b>+┊  ┊ 8┊import { Sim } from &#x27;@ionic-native/sim&#x27;;</b>
 ┊ 8┊ 9┊import { AgmCoreModule } from &#x27;@agm/core&#x27;;
 ┊ 9┊10┊import { MomentModule } from &#x27;angular2-moment&#x27;;
 ┊10┊11┊import { ChatsPage } from &#x27;../pages/chats/chats&#x27;;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊67┊68┊    {provide: ErrorHandler, useClass: IonicErrorHandler},
 ┊68┊69┊    PhoneService,
 ┊69┊70┊    ImagePicker,
<b>+┊  ┊71┊    PictureService,</b>
<b>+┊  ┊72┊    Sim</b>
 ┊71┊73┊  ]
 ┊72┊74┊})
 ┊73┊75┊export class AppModule {}
</pre>

[}]: #

Let's add the appropriate handler in the `PhoneService`, we will use it inside the `LoginPage`:

[{]: <helper> (diffStep 14.3)

#### [Step 14.3: Use getNumber native method](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/eeb8fbd)

##### Changed src&#x2F;pages&#x2F;login&#x2F;login.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊ ┊1┊import { Component, AfterContentInit } from &#x27;@angular/core&#x27;;</b>
 ┊2┊2┊import { Alert, AlertController, NavController } from &#x27;ionic-angular&#x27;;
 ┊3┊3┊import { PhoneService } from &#x27;../../services/phone&#x27;;
 ┊4┊4┊import { VerificationPage } from &#x27;../verification/verification&#x27;;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 7┊ 7┊  selector: &#x27;login&#x27;,
 ┊ 8┊ 8┊  templateUrl: &#x27;login.html&#x27;
 ┊ 9┊ 9┊})
<b>+┊  ┊10┊export class LoginPage implements AfterContentInit {</b>
 ┊11┊11┊  private phone &#x3D; &#x27;&#x27;;
 ┊12┊12┊
 ┊13┊13┊  constructor(
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊16┊16┊    private navCtrl: NavController
 ┊17┊17┊  ) {}
 ┊18┊18┊
<b>+┊  ┊19┊  ngAfterContentInit() {</b>
<b>+┊  ┊20┊    this.phoneService.getNumber()</b>
<b>+┊  ┊21┊      .then((phone) &#x3D;&gt; this.phone &#x3D; phone)</b>
<b>+┊  ┊22┊      .catch((e) &#x3D;&gt; console.error(e.message));</b>
<b>+┊  ┊23┊  }</b>
<b>+┊  ┊24┊</b>
 ┊19┊25┊  onInputKeypress({keyCode}: KeyboardEvent): void {
 ┊20┊26┊    if (keyCode &#x3D;&#x3D;&#x3D; 13) {
 ┊21┊27┊      this.login();
</pre>

[}]: #

[{]: <helper> (diffStep 14.4)

#### [Step 14.4: Implement getNumber with native ionic](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/2dfebce)

##### Changed src&#x2F;services&#x2F;phone.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 2┊ 2┊import { Accounts } from &#x27;meteor/accounts-base&#x27;;
 ┊ 3┊ 3┊import { Meteor } from &#x27;meteor/meteor&#x27;;
 ┊ 4┊ 4┊import { Platform } from &#x27;ionic-angular&#x27;;
<b>+┊  ┊ 5┊import { Sim } from &#x27;@ionic-native/sim&#x27;;</b>
 ┊ 5┊ 6┊
 ┊ 6┊ 7┊@Injectable()
 ┊ 7┊ 8┊export class PhoneService {
<b>+┊  ┊ 9┊  constructor(private platform: Platform,</b>
<b>+┊  ┊10┊              private sim: Sim) {</b>
 ┊ 9┊11┊
 ┊10┊12┊  }
 ┊11┊13┊
<b>+┊  ┊14┊  async getNumber(): Promise&lt;string&gt; {</b>
<b>+┊  ┊15┊    if (!this.platform.is(&#x27;cordova&#x27;)) {</b>
<b>+┊  ┊16┊      throw new Error(&#x27;Cannot read SIM, platform is not Cordova.&#x27;)</b>
<b>+┊  ┊17┊    }</b>
<b>+┊  ┊18┊</b>
<b>+┊  ┊19┊    if (!(await this.sim.hasReadPermission())) {</b>
<b>+┊  ┊20┊      try {</b>
<b>+┊  ┊21┊        await this.sim.requestReadPermission();</b>
<b>+┊  ┊22┊      } catch (e) {</b>
<b>+┊  ┊23┊        throw new Error(&#x27;User denied SIM access.&#x27;);</b>
<b>+┊  ┊24┊      }</b>
<b>+┊  ┊25┊    }</b>
<b>+┊  ┊26┊</b>
<b>+┊  ┊27┊    return &#x27;+&#x27; + (await this.sim.getSimInfo()).phoneNumber;</b>
<b>+┊  ┊28┊  }</b>
<b>+┊  ┊29┊</b>
 ┊12┊30┊  verify(phoneNumber: string): Promise&lt;void&gt; {
 ┊13┊31┊    return new Promise&lt;void&gt;((resolve, reject) &#x3D;&gt; {
 ┊14┊32┊      Accounts.requestPhoneVerification(phoneNumber, (e: Error) &#x3D;&gt; {
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊44┊62┊      });
 ┊45┊63┊    });
 ┊46┊64┊  }
<b>+┊  ┊65┊}</b>
</pre>

[}]: #

## SMS OTP autofill

On supported platforms (`Android`) it would be nice to automatically detect the incoming OTP (One Time Password) SMS and fill the verification field in place of the user.

We need to add the `Cordova` plugin first:

[{]: <helper> (diffStep 14.5)

#### [Step 14.5: Added cordova plugin for reading SMS OTP](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/251d487)

##### Changed config.xml
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊87┊87┊    &lt;plugin name&#x3D;&quot;cordova-plugin-geolocation&quot; spec&#x3D;&quot;^2.4.3&quot; /&gt;
 ┊88┊88┊    &lt;plugin name&#x3D;&quot;com.synconset.imagepicker&quot; spec&#x3D;&quot;git+https://github.com/darkbasic/ImagePicker.git&quot; /&gt;
 ┊89┊89┊    &lt;plugin name&#x3D;&quot;cordova-plugin-sim&quot; spec&#x3D;&quot;^1.3.3&quot; /&gt;
<b>+┊  ┊90┊    &lt;plugin name&#x3D;&quot;cordova-plugin-sms-receiver&quot; spec&#x3D;&quot;^0.1.6&quot; /&gt;</b>
 ┊90┊91┊&lt;/widget&gt;
</pre>

##### Changed package.json
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊44┊44┊    &quot;cordova-plugin-device&quot;: &quot;^1.1.4&quot;,
 ┊45┊45┊    &quot;cordova-plugin-geolocation&quot;: &quot;^2.4.3&quot;,
 ┊46┊46┊    &quot;cordova-plugin-sim&quot;: &quot;^1.3.3&quot;,
<b>+┊  ┊47┊    &quot;cordova-plugin-sms-receiver&quot;: &quot;^0.1.6&quot;,</b>
 ┊47┊48┊    &quot;cordova-plugin-splashscreen&quot;: &quot;^4.0.3&quot;,
 ┊48┊49┊    &quot;cordova-plugin-statusbar&quot;: &quot;^2.2.2&quot;,
 ┊49┊50┊    &quot;cordova-plugin-whitelist&quot;: &quot;^1.3.1&quot;,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊86┊87┊      &quot;ionic-plugin-keyboard&quot;: {},
 ┊87┊88┊      &quot;cordova-plugin-geolocation&quot;: {},
 ┊88┊89┊      &quot;com.synconset.imagepicker&quot;: {},
<b>+┊  ┊90┊      &quot;cordova-plugin-sim&quot;: {},</b>
<b>+┊  ┊91┊      &quot;cordova-plugin-sms-receiver&quot;: {}</b>
 ┊90┊92┊    },
 ┊91┊93┊    &quot;platforms&quot;: [
 ┊92┊94┊      &quot;android&quot;
</pre>

[}]: #

Then we must create the corresponding `ionic-native` plugin, since no one created it:

[{]: <helper> (diffStep 14.6)

#### [Step 14.6: Added ionic-native plugin for reading SMS OTP](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/5589e60)

##### Added src&#x2F;ionic&#x2F;sms-receiver&#x2F;index.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import {Injectable} from &#x27;@angular/core&#x27;;</b>
<b>+┊  ┊ 2┊import {Cordova, Plugin, IonicNativePlugin} from &#x27;@ionic-native/core&#x27;;</b>
<b>+┊  ┊ 3┊</b>
<b>+┊  ┊ 4┊</b>
<b>+┊  ┊ 5┊/**</b>
<b>+┊  ┊ 6┊ * @name SmsReceiver</b>
<b>+┊  ┊ 7┊ * @description</b>
<b>+┊  ┊ 8┊ * Allows you to receive incoming SMS. You have the possibility to start and stop the message broadcasting.</b>
<b>+┊  ┊ 9┊ *</b>
<b>+┊  ┊10┊ * Requires Cordova plugin: &#x60;cordova-plugin-smsreceiver&#x60;. For more info, please see the [Cordova SmsReceiver docs](https://github.com/ahmedwahba/cordova-plugin-smsreceiver).</b>
<b>+┊  ┊11┊ *</b>
<b>+┊  ┊12┊ * @usage</b>
<b>+┊  ┊13┊ * &#x60;&#x60;&#x60;typescript</b>
<b>+┊  ┊14┊ * import { SmsReceiver } from &#x27;@ionic-native/smsreceiver&#x27;;</b>
<b>+┊  ┊15┊ *</b>
<b>+┊  ┊16┊ *</b>
<b>+┊  ┊17┊ * constructor(private smsReceiver: SmsReceiver) { }</b>
<b>+┊  ┊18┊ *</b>
<b>+┊  ┊19┊ * ...</b>
<b>+┊  ┊20┊ *</b>
<b>+┊  ┊21┊ * this.smsReceiver.isSupported().then(</b>
<b>+┊  ┊22┊ *   (supported) &#x3D;&gt; console.log(&#x27;Permission granted&#x27;),</b>
<b>+┊  ┊23┊ *   (err) &#x3D;&gt; console.log(&#x27;Permission denied: &#x27;, err)</b>
<b>+┊  ┊24┊ * );</b>
<b>+┊  ┊25┊ *</b>
<b>+┊  ┊26┊ * this.smsReceiver.startReceiving().then(</b>
<b>+┊  ┊27┊ *   (msg) &#x3D;&gt; console.log(&#x27;Message received: &#x27;, msg)</b>
<b>+┊  ┊28┊ * );</b>
<b>+┊  ┊29┊ *</b>
<b>+┊  ┊30┊ * this.smsReceiver.stopReceiving().then(</b>
<b>+┊  ┊31┊ *   () &#x3D;&gt; console.log(&#x27;Stopped receiving&#x27;),</b>
<b>+┊  ┊32┊ *   (err) &#x3D;&gt; console.log(&#x27;Error: &#x27;, err)</b>
<b>+┊  ┊33┊ * );</b>
<b>+┊  ┊34┊ * &#x60;&#x60;&#x60;</b>
<b>+┊  ┊35┊ */</b>
<b>+┊  ┊36┊@Plugin({</b>
<b>+┊  ┊37┊  pluginName: &#x27;SmsReceiver&#x27;,</b>
<b>+┊  ┊38┊  plugin: &#x27;cordova-plugin-smsreceiver&#x27;,</b>
<b>+┊  ┊39┊  pluginRef: &#x27;sms&#x27;,</b>
<b>+┊  ┊40┊  repo: &#x27;https://github.com/ahmedwahba/cordova-plugin-smsreceiver&#x27;,</b>
<b>+┊  ┊41┊  platforms: [&#x27;Android&#x27;]</b>
<b>+┊  ┊42┊})</b>
<b>+┊  ┊43┊@Injectable()</b>
<b>+┊  ┊44┊export class SmsReceiver extends IonicNativePlugin {</b>
<b>+┊  ┊45┊  /**</b>
<b>+┊  ┊46┊   * Check if the SMS permission is granted and SMS technology is supported by the device.</b>
<b>+┊  ┊47┊   * In case of Marshmallow devices, it requests permission from user.</b>
<b>+┊  ┊48┊   * @returns {void}</b>
<b>+┊  ┊49┊   */</b>
<b>+┊  ┊50┊  @Cordova()</b>
<b>+┊  ┊51┊  isSupported(callback: (supported: boolean) &#x3D;&gt; void, error: () &#x3D;&gt; void): void {</b>
<b>+┊  ┊52┊    return;</b>
<b>+┊  ┊53┊  }</b>
<b>+┊  ┊54┊</b>
<b>+┊  ┊55┊  /**</b>
<b>+┊  ┊56┊   * Start the SMS receiver waiting for incoming message.</b>
<b>+┊  ┊57┊   * The success callback function will be called every time a new message is received.</b>
<b>+┊  ┊58┊   * The error callback is called if an error occurs.</b>
<b>+┊  ┊59┊   * @returns {void}</b>
<b>+┊  ┊60┊   */</b>
<b>+┊  ┊61┊  @Cordova({</b>
<b>+┊  ┊62┊    platforms: [&#x27;Android&#x27;]</b>
<b>+┊  ┊63┊  })</b>
<b>+┊  ┊64┊  startReceiving(callback: (msg: string) &#x3D;&gt; void, error: () &#x3D;&gt; void): void {</b>
<b>+┊  ┊65┊    return;</b>
<b>+┊  ┊66┊  }</b>
<b>+┊  ┊67┊</b>
<b>+┊  ┊68┊  /**</b>
<b>+┊  ┊69┊   * Stop the SMS receiver.</b>
<b>+┊  ┊70┊   * @returns {void}</b>
<b>+┊  ┊71┊   */</b>
<b>+┊  ┊72┊  @Cordova({</b>
<b>+┊  ┊73┊    platforms: [&#x27;Android&#x27;]</b>
<b>+┊  ┊74┊  })</b>
<b>+┊  ┊75┊  stopReceiving(callback: () &#x3D;&gt; void, error: () &#x3D;&gt; void): void {</b>
<b>+┊  ┊76┊    return;</b>
<b>+┊  ┊77┊  }</b>
<b>+┊  ┊78┊}</b>
</pre>

[}]: #

Last but not the least we must import it into `app.module.ts` as usual:

[{]: <helper> (diffStep 14.7)

#### [Step 14.7: Add SmsReceiver to app.module.ts](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/e34de72)

##### Changed src&#x2F;app&#x2F;app.module.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 6┊ 6┊import { Geolocation } from &#x27;@ionic-native/geolocation&#x27;;
 ┊ 7┊ 7┊import { ImagePicker } from &#x27;@ionic-native/image-picker&#x27;;
 ┊ 8┊ 8┊import { Sim } from &#x27;@ionic-native/sim&#x27;;
<b>+┊  ┊ 9┊import { SmsReceiver } from &quot;../ionic/sms-receiver&quot;;</b>
 ┊ 9┊10┊import { AgmCoreModule } from &#x27;@agm/core&#x27;;
 ┊10┊11┊import { MomentModule } from &#x27;angular2-moment&#x27;;
 ┊11┊12┊import { ChatsPage } from &#x27;../pages/chats/chats&#x27;;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊69┊70┊    PhoneService,
 ┊70┊71┊    ImagePicker,
 ┊71┊72┊    PictureService,
<b>+┊  ┊73┊    Sim,</b>
<b>+┊  ┊74┊    SmsReceiver</b>
 ┊73┊75┊  ]
 ┊74┊76┊})
 ┊75┊77┊export class AppModule {}
</pre>

[}]: #

Let's start by using the yet-to-be-created method in the `verification` page:

[{]: <helper> (diffStep 14.8)

#### [Step 14.8: Use getSMS method in verification.ts](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/2a2da87)

##### Changed src&#x2F;pages&#x2F;verification&#x2F;verification.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊ ┊1┊import { AfterContentInit, Component, OnInit } from &#x27;@angular/core&#x27;;</b>
 ┊2┊2┊import { AlertController, NavController, NavParams } from &#x27;ionic-angular&#x27;;
 ┊3┊3┊import { PhoneService } from &#x27;../../services/phone&#x27;;
 ┊4┊4┊import { ProfilePage } from &#x27;../profile/profile&#x27;;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 7┊ 7┊  selector: &#x27;verification&#x27;,
 ┊ 8┊ 8┊  templateUrl: &#x27;verification.html&#x27;
 ┊ 9┊ 9┊})
<b>+┊  ┊10┊export class VerificationPage implements OnInit, AfterContentInit {</b>
 ┊11┊11┊  private code: string &#x3D; &#x27;&#x27;;
 ┊12┊12┊  private phone: string;
 ┊13┊13┊
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊22┊22┊    this.phone &#x3D; this.navParams.get(&#x27;phone&#x27;);
 ┊23┊23┊  }
 ┊24┊24┊
<b>+┊  ┊25┊  ngAfterContentInit() {</b>
<b>+┊  ┊26┊    this.phoneService.getSMS()</b>
<b>+┊  ┊27┊      .then((code: string) &#x3D;&gt; {</b>
<b>+┊  ┊28┊        this.code &#x3D; code;</b>
<b>+┊  ┊29┊        this.verify();</b>
<b>+┊  ┊30┊      })</b>
<b>+┊  ┊31┊      .catch((e: Error) &#x3D;&gt; {</b>
<b>+┊  ┊32┊        if (e) {</b>
<b>+┊  ┊33┊          console.error(e.message);</b>
<b>+┊  ┊34┊        }</b>
<b>+┊  ┊35┊      });</b>
<b>+┊  ┊36┊  }</b>
<b>+┊  ┊37┊</b>
 ┊25┊38┊  onInputKeypress({keyCode}: KeyboardEvent): void {
 ┊26┊39┊    if (keyCode &#x3D;&#x3D;&#x3D; 13) {
 ┊27┊40┊      this.verify();
</pre>

[}]: #

We will need `bluebird` to promisify `sms-receiver`:

    $ npm install --save bluebird
    $ npm install --save-dev @types/bluebird

We will need to add support for `es2016` in Typescript, because we will use `Array.prototype.includes()`:

[{]: <helper> (diffStep "14.10")

#### [Step 14.10: Added support for es2016 in Typescript](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/66854b6)

##### Changed tsconfig.json
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 7┊ 7┊    &quot;experimentalDecorators&quot;: true,
 ┊ 8┊ 8┊    &quot;lib&quot;: [
 ┊ 9┊ 9┊      &quot;dom&quot;,
<b>+┊  ┊10┊      &quot;es2015&quot;,</b>
<b>+┊  ┊11┊      &quot;es2016&quot;</b>
 ┊11┊12┊    ],
 ┊12┊13┊    &quot;module&quot;: &quot;commonjs&quot;,
 ┊13┊14┊    &quot;moduleResolution&quot;: &quot;node&quot;,
</pre>

[}]: #

Now we can implement the method in the `phone` service:

[{]: <helper> (diffStep 14.11)

#### [Step 14.11: Add getSMS method to phone.ts](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/e8ab4a8)

##### Changed api&#x2F;server&#x2F;models.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊export const DEFAULT_PICTURE_URL &#x3D; &#x27;/assets/default-profile-pic.svg&#x27;;
<b>+┊ ┊2┊export const TWILIO_SMS_NUMBERS &#x3D; [&quot;+12248032362&quot;];</b>
 ┊2┊3┊
 ┊3┊4┊export interface Profile {
 ┊4┊5┊  name?: string;
</pre>

##### Changed src&#x2F;services&#x2F;phone.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 3┊ 3┊import { Meteor } from &#x27;meteor/meteor&#x27;;
 ┊ 4┊ 4┊import { Platform } from &#x27;ionic-angular&#x27;;
 ┊ 5┊ 5┊import { Sim } from &#x27;@ionic-native/sim&#x27;;
<b>+┊  ┊ 6┊import { SmsReceiver } from &quot;../ionic/sms-receiver&quot;;</b>
<b>+┊  ┊ 7┊import * as Bluebird from &quot;bluebird&quot;;</b>
<b>+┊  ┊ 8┊import { TWILIO_SMS_NUMBERS } from &quot;api/models&quot;;</b>
<b>+┊  ┊ 9┊import { Observable } from &quot;rxjs/Observable&quot;;</b>
 ┊ 6┊10┊
 ┊ 7┊11┊@Injectable()
 ┊ 8┊12┊export class PhoneService {
 ┊ 9┊13┊  constructor(private platform: Platform,
<b>+┊  ┊14┊              private sim: Sim,</b>
<b>+┊  ┊15┊              private smsReceiver: SmsReceiver) {</b>
<b>+┊  ┊16┊    Bluebird.promisifyAll(this.smsReceiver);</b>
 ┊12┊17┊  }
 ┊13┊18┊
 ┊14┊19┊  async getNumber(): Promise&lt;string&gt; {
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊27┊32┊    return &#x27;+&#x27; + (await this.sim.getSimInfo()).phoneNumber;
 ┊28┊33┊  }
 ┊29┊34┊
<b>+┊  ┊35┊  async getSMS(): Promise&lt;string&gt; {</b>
<b>+┊  ┊36┊    if (!this.platform.is(&#x27;android&#x27;)) {</b>
<b>+┊  ┊37┊      throw new Error(&#x27;Cannot read SMS, platform is not Android.&#x27;)</b>
<b>+┊  ┊38┊    }</b>
<b>+┊  ┊39┊</b>
<b>+┊  ┊40┊    try {</b>
<b>+┊  ┊41┊      await (&lt;any&gt;this.smsReceiver).isSupported();</b>
<b>+┊  ┊42┊    } catch (e) {</b>
<b>+┊  ┊43┊      throw new Error(&#x27;User denied SMS access.&#x27;);</b>
<b>+┊  ┊44┊    }</b>
<b>+┊  ┊45┊</b>
<b>+┊  ┊46┊    const startObs &#x3D; Observable.fromPromise((&lt;any&gt;this.smsReceiver).startReceiving()).map((msg: string) &#x3D;&gt; msg);</b>
<b>+┊  ┊47┊    const timeoutObs &#x3D; Observable.interval(120000).take(1).map(() &#x3D;&gt; {</b>
<b>+┊  ┊48┊      throw new Error(&#x27;Receiving SMS timed out.&#x27;)</b>
<b>+┊  ┊49┊    });</b>
<b>+┊  ┊50┊</b>
<b>+┊  ┊51┊    try {</b>
<b>+┊  ┊52┊      var msg &#x3D; await startObs.takeUntil(timeoutObs).toPromise();</b>
<b>+┊  ┊53┊    } catch (e) {</b>
<b>+┊  ┊54┊      await (&lt;any&gt;this.smsReceiver).stopReceiving();</b>
<b>+┊  ┊55┊      throw e;</b>
<b>+┊  ┊56┊    }</b>
<b>+┊  ┊57┊</b>
<b>+┊  ┊58┊    await (&lt;any&gt;this.smsReceiver).stopReceiving();</b>
<b>+┊  ┊59┊</b>
<b>+┊  ┊60┊    if (TWILIO_SMS_NUMBERS.includes(msg.split(&quot;&gt;&quot;)[0])) {</b>
<b>+┊  ┊61┊      return msg.substr(msg.length - 4);</b>
<b>+┊  ┊62┊    } else {</b>
<b>+┊  ┊63┊      throw new Error(&#x27;Sender is not a Twilio number.&#x27;)</b>
<b>+┊  ┊64┊    }</b>
<b>+┊  ┊65┊  }</b>
<b>+┊  ┊66┊</b>
 ┊30┊67┊  verify(phoneNumber: string): Promise&lt;void&gt; {
 ┊31┊68┊    return new Promise&lt;void&gt;((resolve, reject) &#x3D;&gt; {
 ┊32┊69┊      Accounts.requestPhoneVerification(phoneNumber, (e: Error) &#x3D;&gt; {
</pre>

[}]: #

## Camera

Next - we will grant access to the device's camera so we can send pictures which are yet to exist in the gallery. Since the `Camera` plugin can also access the gallery, we will replace the previously used `ImagePicker` plugin with `Camera`, which is better maintained and allows for more code reuse.
We will also use the `Crop` plugin to force a 1:1 aspect ratio, when needed.

We will start by adding the appropriate `Cordova` plug-ins:

    $ ionic cordova plugin add cordova-plugin-camera --save
    $ ionic cordova plugin add cordova-plugin-crop --save
    $ npm install --save @ionic-native/camera
    $ npm install --save @ionic-native/crop

Then let's add them to `app.module.ts`:

[{]: <helper> (diffStep 14.13)

#### [Step 14.13: Add Camera and Crop to app.module.ts](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/c61878d)

##### Changed src&#x2F;app&#x2F;app.module.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 7┊ 7┊import { ImagePicker } from &#x27;@ionic-native/image-picker&#x27;;
 ┊ 8┊ 8┊import { Sim } from &#x27;@ionic-native/sim&#x27;;
 ┊ 9┊ 9┊import { SmsReceiver } from &quot;../ionic/sms-receiver&quot;;
<b>+┊  ┊10┊import { Camera } from &#x27;@ionic-native/camera&#x27;;</b>
<b>+┊  ┊11┊import { Crop } from &#x27;@ionic-native/crop&#x27;;</b>
 ┊10┊12┊import { AgmCoreModule } from &#x27;@agm/core&#x27;;
 ┊11┊13┊import { MomentModule } from &#x27;angular2-moment&#x27;;
 ┊12┊14┊import { ChatsPage } from &#x27;../pages/chats/chats&#x27;;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊71┊73┊    ImagePicker,
 ┊72┊74┊    PictureService,
 ┊73┊75┊    Sim,
<b>+┊  ┊76┊    SmsReceiver,</b>
<b>+┊  ┊77┊    Camera,</b>
<b>+┊  ┊78┊    Crop</b>
 ┊75┊79┊  ]
 ┊76┊80┊})
 ┊77┊81┊export class AppModule {}
</pre>

[}]: #

We will bind the `click` event in the view:

[{]: <helper> (diffStep 14.14)

#### [Step 14.14: Use the new sendPicture method in the template](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/03d74c5)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages-attachments.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 1┊ 1┊&lt;ion-content class&#x3D;&quot;messages-attachments-page-content&quot;&gt;
 ┊ 2┊ 2┊  &lt;ion-list class&#x3D;&quot;attachments&quot;&gt;
<b>+┊  ┊ 3┊    &lt;button ion-item class&#x3D;&quot;attachment attachment-gallery&quot; (click)&#x3D;&quot;sendPicture(false)&quot;&gt;</b>
 ┊ 4┊ 4┊      &lt;ion-icon name&#x3D;&quot;images&quot; class&#x3D;&quot;attachment-icon&quot;&gt;&lt;/ion-icon&gt;
 ┊ 5┊ 5┊      &lt;div class&#x3D;&quot;attachment-name&quot;&gt;Gallery&lt;/div&gt;
 ┊ 6┊ 6┊    &lt;/button&gt;
 ┊ 7┊ 7┊
<b>+┊  ┊ 8┊    &lt;button ion-item class&#x3D;&quot;attachment attachment-camera&quot; (click)&#x3D;&quot;sendPicture(true)&quot;&gt;</b>
 ┊ 9┊ 9┊      &lt;ion-icon name&#x3D;&quot;camera&quot; class&#x3D;&quot;attachment-icon&quot;&gt;&lt;/ion-icon&gt;
 ┊10┊10┊      &lt;div class&#x3D;&quot;attachment-name&quot;&gt;Camera&lt;/div&gt;
 ┊11┊11┊    &lt;/button&gt;
</pre>

[}]: #

And we will create the event handler in `MessagesAttachmentsComponent`:

[{]: <helper> (diffStep 14.15)

#### [Step 14.15: Use the getPicture method into messages-attachment.ts](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/f5927c6)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages-attachments.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊17┊17┊    private pictureService: PictureService
 ┊18┊18┊  ) {}
 ┊19┊19┊
<b>+┊  ┊20┊  sendPicture(camera: boolean): void {</b>
<b>+┊  ┊21┊    if (camera &amp;&amp; !this.platform.is(&#x27;cordova&#x27;)) {</b>
<b>+┊  ┊22┊      return console.warn(&#x27;Device must run cordova in order to take pictures&#x27;);</b>
<b>+┊  ┊23┊    }</b>
<b>+┊  ┊24┊</b>
<b>+┊  ┊25┊    this.pictureService.getPicture(camera, false)</b>
<b>+┊  ┊26┊      .then((blob: File) &#x3D;&gt; {</b>
<b>+┊  ┊27┊        this.viewCtrl.dismiss({</b>
<b>+┊  ┊28┊          messageType: MessageType.PICTURE,</b>
<b>+┊  ┊29┊          selectedPicture: blob</b>
<b>+┊  ┊30┊        });</b>
<b>+┊  ┊31┊      })</b>
<b>+┊  ┊32┊      .catch((e) &#x3D;&gt; {</b>
<b>+┊  ┊33┊        this.handleError(e);</b>
 ┊25┊34┊      });
 ┊27┊35┊  }
 ┊28┊36┊
 ┊29┊37┊  sendLocation(): void {
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊43┊51┊
 ┊44┊52┊    locationModal.present();
 ┊45┊53┊  }
<b>+┊  ┊54┊</b>
<b>+┊  ┊55┊  handleError(e: Error): void {</b>
<b>+┊  ┊56┊    console.error(e);</b>
<b>+┊  ┊57┊</b>
<b>+┊  ┊58┊    const alert &#x3D; this.alertCtrl.create({</b>
<b>+┊  ┊59┊      title: &#x27;Oops!&#x27;,</b>
<b>+┊  ┊60┊      message: e.message,</b>
<b>+┊  ┊61┊      buttons: [&#x27;OK&#x27;]</b>
<b>+┊  ┊62┊    });</b>
<b>+┊  ┊63┊</b>
<b>+┊  ┊64┊    alert.present();</b>
<b>+┊  ┊65┊  }</b>
 ┊46┊66┊}
</pre>

[}]: #

Finally we can create a new method in the `PictureService` to take some pictures and remove the old method which used `ImagePicker`:

[{]: <helper> (diffStep 14.16)

#### [Step 14.16: Implement getPicture method in picture service](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/c889f03)

##### Changed src&#x2F;services&#x2F;picture.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 1┊ 1┊import { Injectable } from &#x27;@angular/core&#x27;;
 ┊ 2┊ 2┊import { Platform } from &#x27;ionic-angular&#x27;;
 ┊ 4┊ 3┊import { UploadFS } from &#x27;meteor/jalik:ufs&#x27;;
 ┊ 5┊ 4┊import { PicturesStore } from &#x27;api/collections&#x27;;
 ┊ 6┊ 5┊import { _ } from &#x27;meteor/underscore&#x27;;
 ┊ 7┊ 6┊import { DEFAULT_PICTURE_URL } from &#x27;api/models&#x27;;
<b>+┊  ┊ 7┊import { Camera, CameraOptions } from &#x27;@ionic-native/camera&#x27;;</b>
<b>+┊  ┊ 8┊import { Crop } from &#x27;@ionic-native/crop&#x27;;</b>
 ┊ 8┊ 9┊
 ┊ 9┊10┊@Injectable()
 ┊10┊11┊export class PictureService {
 ┊11┊12┊  constructor(private platform: Platform,
<b>+┊  ┊13┊              private camera: Camera,</b>
<b>+┊  ┊14┊              private crop: Crop) {</b>
 ┊13┊15┊  }
 ┊14┊16┊
<b>+┊  ┊17┊  getPicture(camera: boolean, crop: boolean): Promise&lt;File&gt; {</b>
<b>+┊  ┊18┊    if (!this.platform.is(&#x27;cordova&#x27;)) {</b>
 ┊17┊19┊      return new Promise((resolve, reject) &#x3D;&gt; {
<b>+┊  ┊20┊        //TODO: add javascript image crop</b>
<b>+┊  ┊21┊        if (camera &#x3D;&#x3D;&#x3D; true) {</b>
<b>+┊  ┊22┊          reject(new Error(&quot;Can&#x27;t access the camera on Browser&quot;));</b>
<b>+┊  ┊23┊        } else {</b>
<b>+┊  ┊24┊          try {</b>
<b>+┊  ┊25┊            UploadFS.selectFile((file: File) &#x3D;&gt; {</b>
<b>+┊  ┊26┊              resolve(file);</b>
<b>+┊  ┊27┊            });</b>
<b>+┊  ┊28┊          } catch (e) {</b>
<b>+┊  ┊29┊            reject(e);</b>
<b>+┊  ┊30┊          }</b>
 ┊25┊31┊        }
 ┊26┊32┊      });
 ┊27┊33┊    }
 ┊28┊34┊
<b>+┊  ┊35┊    return this.camera.getPicture(&lt;CameraOptions&gt;{</b>
<b>+┊  ┊36┊      destinationType: 1,</b>
<b>+┊  ┊37┊      quality: 50,</b>
<b>+┊  ┊38┊      correctOrientation: true,</b>
<b>+┊  ┊39┊      saveToPhotoAlbum: false,</b>
<b>+┊  ┊40┊      sourceType: camera ? 1 : 0</b>
<b>+┊  ┊41┊    })</b>
<b>+┊  ┊42┊      .then((fileURI) &#x3D;&gt; {</b>
<b>+┊  ┊43┊        return crop ? this.crop.crop(fileURI, {quality: 50}) : fileURI;</b>
<b>+┊  ┊44┊      })</b>
<b>+┊  ┊45┊      .then((croppedFileURI) &#x3D;&gt; {</b>
<b>+┊  ┊46┊        return this.convertURLtoBlob(croppedFileURI);</b>
<b>+┊  ┊47┊      });</b>
 ┊32┊48┊  }
 ┊33┊49┊
 ┊34┊50┊  upload(blob: File): Promise&lt;any&gt; {
</pre>

[}]: #

Choosing to take the picture from the camera instead of the gallery is as simple as passing a boolean parameter to the method. The same is true for cropping.

> *NOTE*: even if the client will not crop the image when passing `false`, the server will still crop it. Eventually, we will need to edit our `Store` in order to fix it.

We will also have to update `selectProfilePicture` in the profile `Page` to use `getPicture`:

[{]: <helper> (diffStep 14.17)

#### [Step 14.17: Update selectProfilePicture in profile.ts to use getPicture](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/9cd9c50)

##### Changed src&#x2F;pages&#x2F;profile&#x2F;profile.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊36┊36┊  }
 ┊37┊37┊
 ┊38┊38┊  selectProfilePicture(): void {
<b>+┊  ┊39┊    this.pictureService.getPicture(false, true).then((blob) &#x3D;&gt; {</b>
 ┊40┊40┊      this.uploadProfilePicture(blob);
 ┊41┊41┊    })
 ┊42┊42┊      .catch((e) &#x3D;&gt; {
</pre>

[}]: #

[{]: <helper> (navStep nextRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/addressbook" prevRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/file-upload")

⟸ <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/file-upload">PREVIOUS STEP</a> <b>║</b> <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/addressbook">NEXT STEP</a> ⟹

[}]: #

