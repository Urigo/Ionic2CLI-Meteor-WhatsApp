# Step 17: Facebook authentication

In this step we are going to implement `Facebook` auth and allow our users to start new chats with their Facebook friends who already use our app.

First we will have to install a couple of Meteor packages:

    api$ meteor add btafel:accounts-facebook-cordova
    api$ meteor add service-configuration

Then we will need to add the `Cordova` plugin `cordova-plugin-facebook4`:

    $ ionic cordova plugin add git+https://github.com/darkbasic/cordova-plugin-facebook4.git --save

Now we need to configure `oauth` services using `service-configuration`:

[{]: <helper> (diffStep 17.3)

#### [Step 17.3: Configure oauth services using service-configuration](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/2ff4f0e)

##### Changed api&#x2F;server&#x2F;main.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 1┊ 1┊import { Meteor } from &#x27;meteor/meteor&#x27;;
 ┊ 2┊ 2┊import { Accounts } from &#x27;meteor/accounts-base&#x27;;
<b>+┊  ┊ 3┊declare const ServiceConfiguration: any;</b>
 ┊ 3┊ 4┊
 ┊ 4┊ 5┊Meteor.startup(() &#x3D;&gt; {
 ┊ 5┊ 6┊  if (Meteor.settings) {
 ┊ 6┊ 7┊    Object.assign(Accounts._options, Meteor.settings[&#x27;accounts-phone&#x27;]);
 ┊ 7┊ 8┊    SMS.twilio &#x3D; Meteor.settings[&#x27;twilio&#x27;];
 ┊ 8┊ 9┊  }
<b>+┊  ┊10┊</b>
<b>+┊  ┊11┊  // Configuring oAuth services</b>
<b>+┊  ┊12┊  const services &#x3D; Meteor.settings.private.oAuth;</b>
<b>+┊  ┊13┊</b>
<b>+┊  ┊14┊  if (services) {</b>
<b>+┊  ┊15┊    for (let service in services) {</b>
<b>+┊  ┊16┊      ServiceConfiguration.configurations.upsert({service: service}, {</b>
<b>+┊  ┊17┊        $set: services[service]</b>
<b>+┊  ┊18┊      });</b>
<b>+┊  ┊19┊    }</b>
<b>+┊  ┊20┊  }</b>
 ┊ 9┊21┊});
</pre>

[}]: #

And store credentials in `settings.json`:

[{]: <helper> (diffStep 17.4)

#### [Step 17.4: Store credentials in settings.json](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/37f8f3d)

##### Changed api&#x2F;private&#x2F;settings.json
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 5┊ 5┊    &quot;adminPhoneNumbers&quot;: [&quot;+9721234567&quot;, &quot;+97212345678&quot;, &quot;+97212345679&quot;],
 ┊ 6┊ 6┊    &quot;phoneVerificationMasterCode&quot;: &quot;1234&quot;
 ┊ 7┊ 7┊  },
<b>+┊  ┊ 8┊  &quot;public&quot;: {</b>
<b>+┊  ┊ 9┊    &quot;facebook&quot;: {</b>
<b>+┊  ┊10┊      &quot;permissions&quot;: [</b>
<b>+┊  ┊11┊        &quot;public_profile&quot;,</b>
<b>+┊  ┊12┊        &quot;user_friends&quot;,</b>
<b>+┊  ┊13┊        &quot;email&quot;</b>
<b>+┊  ┊14┊      ],</b>
<b>+┊  ┊15┊      &quot;profileFields&quot;: [</b>
<b>+┊  ┊16┊        &quot;name&quot;,</b>
<b>+┊  ┊17┊        &quot;gender&quot;,</b>
<b>+┊  ┊18┊        &quot;location&quot;</b>
<b>+┊  ┊19┊      ]</b>
<b>+┊  ┊20┊    }</b>
<b>+┊  ┊21┊  },</b>
 ┊ 8┊22┊  &quot;private&quot;: {
 ┊ 9┊23┊    &quot;fcm&quot;: {
 ┊10┊24┊      &quot;key&quot;: &quot;AIzaSyBnmvN5WNv3rAaLra1RUr9vA5k0pNp0KuY&quot;
<b>+┊  ┊25┊    },</b>
<b>+┊  ┊26┊    &quot;oAuth&quot;: {</b>
<b>+┊  ┊27┊      &quot;facebook&quot;: {</b>
<b>+┊  ┊28┊        &quot;appId&quot;: &quot;1800004730327605&quot;,</b>
<b>+┊  ┊29┊        &quot;secret&quot;: &quot;57f57a93e8847896a0b779c0d0cdfa7b&quot;</b>
<b>+┊  ┊30┊      }</b>
 ┊11┊31┊    }
 ┊12┊32┊  }
 ┊13┊33┊}
</pre>

[}]: #

Since `accounts-facebook-cordova` pollutes our user `profile` on `Cordova`, let's filter it in our `ProfilePage`:

[{]: <helper> (diffStep 17.5)

#### [Step 17.5: Filter user profile](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/ace6535)

##### Changed src&#x2F;pages&#x2F;profile&#x2F;profile.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊22┊22┊  ) {}
 ┊23┊23┊
 ┊24┊24┊  ngOnInit(): void {
<b>+┊  ┊25┊    this.profile &#x3D; (({name &#x3D; &#x27;&#x27;, pictureId} &#x3D; {}) &#x3D;&gt; ({</b>
<b>+┊  ┊26┊      name,</b>
<b>+┊  ┊27┊      pictureId</b>
<b>+┊  ┊28┊    }))(Meteor.user().profile);</b>
 ┊28┊29┊
 ┊29┊30┊    MeteorObservable.subscribe(&#x27;user&#x27;).subscribe(() &#x3D;&gt; {
 ┊30┊31┊      let platform &#x3D; this.platform.is(&#x27;android&#x27;) ? &quot;android&quot; :
</pre>

[}]: #

Now we can create a test login method to check if everything works so far:

[{]: <helper> (diffStep 17.6)

#### [Step 17.6: Create a test login method and bind it to the user interface](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/fd95986)

##### Changed src&#x2F;pages&#x2F;login&#x2F;login.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊22┊22┊  &lt;ion-item&gt;
 ┊23┊23┊    &lt;ion-input [(ngModel)]&#x3D;&quot;phone&quot; (keypress)&#x3D;&quot;onInputKeypress($event)&quot; type&#x3D;&quot;tel&quot; placeholder&#x3D;&quot;Your phone number&quot;&gt;&lt;/ion-input&gt;
 ┊24┊24┊  &lt;/ion-item&gt;
<b>+┊  ┊25┊</b>
<b>+┊  ┊26┊  &lt;ion-item&gt;</b>
<b>+┊  ┊27┊    &lt;ion-buttons&gt;</b>
<b>+┊  ┊28┊      &lt;button ion-button (click)&#x3D;&quot;loginFacebook()&quot;&gt;Login with Facebook&lt;/button&gt;</b>
<b>+┊  ┊29┊    &lt;/ion-buttons&gt;</b>
<b>+┊  ┊30┊  &lt;/ion-item&gt;</b>
 ┊25┊31┊&lt;/ion-content&gt;
</pre>

##### Changed src&#x2F;pages&#x2F;login&#x2F;login.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊50┊50┊    alert.present();
 ┊51┊51┊  }
 ┊52┊52┊
<b>+┊  ┊53┊  loginFacebook(): void {</b>
<b>+┊  ┊54┊    const options &#x3D; {</b>
<b>+┊  ┊55┊      requestPermissions: [&#x27;public_profile&#x27;, &#x27;user_friends&#x27;, &#x27;email&#x27;]</b>
<b>+┊  ┊56┊    };</b>
<b>+┊  ┊57┊</b>
<b>+┊  ┊58┊    (&lt;any&gt;Meteor).loginWithFacebook(options, (error: Error) &#x3D;&gt; {</b>
<b>+┊  ┊59┊      if (error) {</b>
<b>+┊  ┊60┊        this.handleError(error);</b>
<b>+┊  ┊61┊      } else {</b>
<b>+┊  ┊62┊        console.log(&quot;Logged in with Facebook succesfully.&quot;);</b>
<b>+┊  ┊63┊        console.log(Meteor.user());</b>
<b>+┊  ┊64┊      }</b>
<b>+┊  ┊65┊    });</b>
<b>+┊  ┊66┊  }</b>
<b>+┊  ┊67┊</b>
 ┊53┊68┊  handleLogin(alert: Alert): void {
 ┊54┊69┊    alert.dismiss().then(() &#x3D;&gt; {
 ┊55┊70┊      return this.phoneService.verify(this.phone);
</pre>

[}]: #

We will need to pass every connection through `Nginx`:

[{]: <helper> (diffStep 17.7)

#### [Step 17.7: Let every connection pass through Nginx](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/ebce75e)

##### Changed meteor-client.config.json
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊{
 ┊2┊2┊  &quot;runtime&quot;: {
<b>+┊ ┊3┊    &quot;DDP_DEFAULT_CONNECTION_URL&quot;: &quot;http://meteor.linuxsystems.it&quot;,</b>
<b>+┊ ┊4┊    &quot;ROOT_URL&quot;: &quot;http://meteor.linuxsystems.it&quot;</b>
 ┊4┊5┊  },
 ┊5┊6┊  &quot;import&quot;: [
 ┊6┊7┊
</pre>

##### Changed package.json
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 9┊ 9┊    &quot;url&quot;: &quot;https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp.git&quot;
 ┊10┊10┊  },
 ┊11┊11┊  &quot;scripts&quot;: {
<b>+┊  ┊12┊    &quot;api&quot;: &quot;cd api &amp;&amp; export ROOT_URL&#x3D;http://meteor.linuxsystems.it &amp;&amp; meteor run --settings private/settings.json&quot;,</b>
<b>+┊  ┊13┊    &quot;api:reset&quot;: &quot;cd api &amp;&amp; export ROOT_URL&#x3D;http://meteor.linuxsystems.it &amp;&amp; meteor reset&quot;,</b>
 ┊14┊14┊    &quot;clean&quot;: &quot;ionic-app-scripts clean&quot;,
 ┊15┊15┊    &quot;build&quot;: &quot;ionic-app-scripts build&quot;,
 ┊16┊16┊    &quot;lint&quot;: &quot;ionic-app-scripts lint&quot;,
</pre>

[}]: #

This is the core of our `Nginx` config:

    server {
      listen 80;
      server_name meteor.linuxsystems.it;

      location / {
        proxy_pass http://meteor.linuxsystems.it:8100;
      }

      location ~ ^/(_oauth|packages|ufs) {
        proxy_pass http://meteor.linuxsystems.it:3000;
      }

      location /sockjs {
        proxy_pass http://meteor.linuxsystems.it:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
      }

      error_page  500 502 503 504  /50x.html;

      location = /50x.html {
        root /usr/share/nginx/html;
      }
    }

Now that we know that everything works we can remove our login test code:

[{]: <helper> (diffStep 17.8)

#### [Step 17.8: Remove the login test code](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/e7eecdc)

##### Changed src&#x2F;pages&#x2F;login&#x2F;login.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊22┊22┊  &lt;ion-item&gt;
 ┊23┊23┊    &lt;ion-input [(ngModel)]&#x3D;&quot;phone&quot; (keypress)&#x3D;&quot;onInputKeypress($event)&quot; type&#x3D;&quot;tel&quot; placeholder&#x3D;&quot;Your phone number&quot;&gt;&lt;/ion-input&gt;
 ┊24┊24┊  &lt;/ion-item&gt;
 ┊31┊25┊&lt;/ion-content&gt;
</pre>

##### Changed src&#x2F;pages&#x2F;login&#x2F;login.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊50┊50┊    alert.present();
 ┊51┊51┊  }
 ┊52┊52┊
 ┊68┊53┊  handleLogin(alert: Alert): void {
 ┊69┊54┊    alert.dismiss().then(() &#x3D;&gt; {
 ┊70┊55┊      return this.phoneService.verify(this.phone);
</pre>

[}]: #

Since we need to link our users to their `Facebook` accounts instead of creating brand new accounts, let's add the `darkbasic:link-accounts` `Meteor` package:

    api$ meteor add darkbasic:link-accounts

Now we create the `linkFacebook` method in the `phone` service:

[{]: <helper> (diffStep "17.10")

#### [Step 17.10: Create linkFacebook method in phone service](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/f07559d)

##### Changed src&#x2F;services&#x2F;phone.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊146┊146┊    });
 ┊147┊147┊  }
 ┊148┊148┊
<b>+┊   ┊149┊  linkFacebook(): Promise&lt;any&gt; {</b>
<b>+┊   ┊150┊    return new Promise((resolve, reject) &#x3D;&gt; {</b>
<b>+┊   ┊151┊      const options &#x3D; {</b>
<b>+┊   ┊152┊        requestPermissions: [&#x27;public_profile&#x27;, &#x27;user_friends&#x27;, &#x27;email&#x27;]</b>
<b>+┊   ┊153┊      };</b>
<b>+┊   ┊154┊</b>
<b>+┊   ┊155┊      // TODO: add link-accounts types to meteor typings</b>
<b>+┊   ┊156┊      (&lt;any&gt;Meteor).linkWithFacebook(options, (error: Error) &#x3D;&gt; {</b>
<b>+┊   ┊157┊        if (error) {</b>
<b>+┊   ┊158┊          reject(new Error(error.message));</b>
<b>+┊   ┊159┊        } else {</b>
<b>+┊   ┊160┊          resolve();</b>
<b>+┊   ┊161┊        }</b>
<b>+┊   ┊162┊      });</b>
<b>+┊   ┊163┊    });</b>
<b>+┊   ┊164┊  }</b>
<b>+┊   ┊165┊</b>
 ┊149┊166┊  logout(): Promise&lt;void&gt; {
 ┊150┊167┊    return new Promise&lt;void&gt;((resolve, reject) &#x3D;&gt; {
 ┊151┊168┊      Meteor.logout((e: Error) &#x3D;&gt; {
</pre>

[}]: #

And `FacebookPage` with its view and style sheet:

[{]: <helper> (diffStep 17.11)

#### [Step 17.11: Create FacebookPage](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/fe7bdc3)

##### Added src&#x2F;pages&#x2F;login&#x2F;facebook.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { Component } from &quot;@angular/core&quot;;</b>
<b>+┊  ┊ 2┊import { Alert, AlertController, NavController } from &quot;ionic-angular&quot;;</b>
<b>+┊  ┊ 3┊import { PhoneService } from &quot;../../services/phone&quot;;</b>
<b>+┊  ┊ 4┊import { ProfilePage } from &quot;../profile/profile&quot;;</b>
<b>+┊  ┊ 5┊</b>
<b>+┊  ┊ 6┊@Component({</b>
<b>+┊  ┊ 7┊  selector: &#x27;facebook&#x27;,</b>
<b>+┊  ┊ 8┊  templateUrl: &#x27;facebook.html&#x27;</b>
<b>+┊  ┊ 9┊})</b>
<b>+┊  ┊10┊export class FacebookPage {</b>
<b>+┊  ┊11┊</b>
<b>+┊  ┊12┊  constructor(private alertCtrl: AlertController,</b>
<b>+┊  ┊13┊              private phoneService: PhoneService,</b>
<b>+┊  ┊14┊              private navCtrl: NavController) {</b>
<b>+┊  ┊15┊  }</b>
<b>+┊  ┊16┊</b>
<b>+┊  ┊17┊  cancel(): void {</b>
<b>+┊  ┊18┊    const alert: Alert &#x3D; this.alertCtrl.create({</b>
<b>+┊  ┊19┊      title: &#x27;Confirm&#x27;,</b>
<b>+┊  ┊20┊      message: &#x60;Would you like to proceed without linking your account with Facebook?&#x60;,</b>
<b>+┊  ┊21┊      buttons: [</b>
<b>+┊  ┊22┊        {</b>
<b>+┊  ┊23┊          text: &#x27;Cancel&#x27;,</b>
<b>+┊  ┊24┊          role: &#x27;cancel&#x27;</b>
<b>+┊  ┊25┊        },</b>
<b>+┊  ┊26┊        {</b>
<b>+┊  ┊27┊          text: &#x27;Yes&#x27;,</b>
<b>+┊  ┊28┊          handler: () &#x3D;&gt; {</b>
<b>+┊  ┊29┊            this.dontLink(alert);</b>
<b>+┊  ┊30┊            return false;</b>
<b>+┊  ┊31┊          }</b>
<b>+┊  ┊32┊        }</b>
<b>+┊  ┊33┊      ]</b>
<b>+┊  ┊34┊    });</b>
<b>+┊  ┊35┊</b>
<b>+┊  ┊36┊    alert.present();</b>
<b>+┊  ┊37┊  }</b>
<b>+┊  ┊38┊</b>
<b>+┊  ┊39┊  linkFacebook(): void {</b>
<b>+┊  ┊40┊    this.phoneService.linkFacebook()</b>
<b>+┊  ┊41┊      .then(() &#x3D;&gt; {</b>
<b>+┊  ┊42┊        this.navCtrl.setRoot(ProfilePage, {}, {</b>
<b>+┊  ┊43┊          animate: true</b>
<b>+┊  ┊44┊        });</b>
<b>+┊  ┊45┊      })</b>
<b>+┊  ┊46┊      .catch((e) &#x3D;&gt; {</b>
<b>+┊  ┊47┊        this.handleError(e);</b>
<b>+┊  ┊48┊      });</b>
<b>+┊  ┊49┊  }</b>
<b>+┊  ┊50┊</b>
<b>+┊  ┊51┊  dontLink(alert: Alert): void {</b>
<b>+┊  ┊52┊    alert.dismiss()</b>
<b>+┊  ┊53┊      .then(() &#x3D;&gt; {</b>
<b>+┊  ┊54┊        this.navCtrl.setRoot(ProfilePage, {}, {</b>
<b>+┊  ┊55┊          animate: true</b>
<b>+┊  ┊56┊        });</b>
<b>+┊  ┊57┊      })</b>
<b>+┊  ┊58┊      .catch((e) &#x3D;&gt; {</b>
<b>+┊  ┊59┊        this.handleError(e);</b>
<b>+┊  ┊60┊      });</b>
<b>+┊  ┊61┊  }</b>
<b>+┊  ┊62┊</b>
<b>+┊  ┊63┊  handleError(e: Error): void {</b>
<b>+┊  ┊64┊    console.error(e);</b>
<b>+┊  ┊65┊</b>
<b>+┊  ┊66┊    const alert &#x3D; this.alertCtrl.create({</b>
<b>+┊  ┊67┊      title: &#x27;Oops!&#x27;,</b>
<b>+┊  ┊68┊      message: e.message,</b>
<b>+┊  ┊69┊      buttons: [&#x27;OK&#x27;]</b>
<b>+┊  ┊70┊    });</b>
<b>+┊  ┊71┊</b>
<b>+┊  ┊72┊    alert.present();</b>
<b>+┊  ┊73┊  }</b>
<b>+┊  ┊74┊}</b>
</pre>

[}]: #

[{]: <helper> (diffStep 17.12)

#### [Step 17.12: Create FacebookPage View](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/98ca00d)

##### Added src&#x2F;pages&#x2F;login&#x2F;facebook.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊&lt;ion-header&gt;</b>
<b>+┊  ┊ 2┊  &lt;ion-navbar color&#x3D;&quot;whatsapp&quot;&gt;</b>
<b>+┊  ┊ 3┊    &lt;ion-title&gt;Link with Facebook&lt;/ion-title&gt;</b>
<b>+┊  ┊ 4┊</b>
<b>+┊  ┊ 5┊    &lt;ion-buttons end&gt;</b>
<b>+┊  ┊ 6┊      &lt;button ion-button class&#x3D;&quot;done-button&quot; (click)&#x3D;&quot;cancel()&quot;&gt;Cancel&lt;/button&gt;</b>
<b>+┊  ┊ 7┊    &lt;/ion-buttons&gt;</b>
<b>+┊  ┊ 8┊  &lt;/ion-navbar&gt;</b>
<b>+┊  ┊ 9┊&lt;/ion-header&gt;</b>
<b>+┊  ┊10┊</b>
<b>+┊  ┊11┊&lt;ion-content padding class&#x3D;&quot;login-page-content&quot;&gt;</b>
<b>+┊  ┊12┊  &lt;div class&#x3D;&quot;instructions&quot;&gt;</b>
<b>+┊  ┊13┊    &lt;div&gt;</b>
<b>+┊  ┊14┊      You can link your account with Facebook to chat with more friends.</b>
<b>+┊  ┊15┊    &lt;/div&gt;</b>
<b>+┊  ┊16┊    &lt;br&gt;</b>
<b>+┊  ┊17┊    &lt;ion-item&gt;</b>
<b>+┊  ┊18┊      &lt;ion-buttons&gt;</b>
<b>+┊  ┊19┊        &lt;button ion-button (click)&#x3D;&quot;linkFacebook()&quot;&gt;Login with Facebook&lt;/button&gt;</b>
<b>+┊  ┊20┊      &lt;/ion-buttons&gt;</b>
<b>+┊  ┊21┊    &lt;/ion-item&gt;</b>
<b>+┊  ┊22┊  &lt;/div&gt;</b>
<b>+┊  ┊23┊&lt;/ion-content&gt;</b>
</pre>

[}]: #

[{]: <helper> (diffStep 17.13)

#### [Step 17.13: Create FacebookPage style sheet](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/200564a)

##### Added src&#x2F;pages&#x2F;login&#x2F;facebook.scss
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊.login-page-content {</b>
<b>+┊  ┊ 2┊  .instructions {</b>
<b>+┊  ┊ 3┊    text-align: center;</b>
<b>+┊  ┊ 4┊    font-size: medium;</b>
<b>+┊  ┊ 5┊    margin: 50px;</b>
<b>+┊  ┊ 6┊  }</b>
<b>+┊  ┊ 7┊</b>
<b>+┊  ┊ 8┊  .text-input {</b>
<b>+┊  ┊ 9┊    text-align: center;</b>
<b>+┊  ┊10┊  }</b>
<b>+┊  ┊11┊}</b>
</pre>

[}]: #

Let's add it to `app.module.ts`:

[{]: <helper> (diffStep 17.14)

#### [Step 17.14: Add FacebookPage to app.module.ts](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/3d51393)

##### Changed src&#x2F;app&#x2F;app.module.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊23┊23┊import { NewLocationMessageComponent } from &#x27;../pages/messages/location-message&#x27;;
 ┊24┊24┊import { ShowPictureComponent } from &#x27;../pages/messages/show-picture&#x27;;
 ┊25┊25┊import { ProfilePage } from &#x27;../pages/profile/profile&#x27;;
<b>+┊  ┊26┊import { FacebookPage } from &quot;../pages/login/facebook&quot;;</b>
 ┊26┊27┊import { VerificationPage } from &#x27;../pages/verification/verification&#x27;;
 ┊27┊28┊import { PhoneService } from &#x27;../services/phone&#x27;;
 ┊28┊29┊import { PictureService } from &#x27;../services/picture&#x27;;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊36┊37┊    LoginPage,
 ┊37┊38┊    VerificationPage,
 ┊38┊39┊    ProfilePage,
<b>+┊  ┊40┊    FacebookPage,</b>
 ┊39┊41┊    ChatsOptionsComponent,
 ┊40┊42┊    NewChatComponent,
 ┊41┊43┊    MessagesOptionsComponent,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊59┊61┊    LoginPage,
 ┊60┊62┊    VerificationPage,
 ┊61┊63┊    ProfilePage,
<b>+┊  ┊64┊    FacebookPage,</b>
 ┊62┊65┊    ChatsOptionsComponent,
 ┊63┊66┊    NewChatComponent,
 ┊64┊67┊    MessagesOptionsComponent,
</pre>

[}]: #

Now we can finally redirect to `FacebookPage` from `VerificationPage` and the `Facebook` account linking should be finally working:

[{]: <helper> (diffStep 17.15)

#### [Step 17.15: Redirect to FacebookPage from the VerificationPage](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/43a15a1)

##### Changed src&#x2F;pages&#x2F;verification&#x2F;verification.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊import { AfterContentInit, Component, OnInit } from &#x27;@angular/core&#x27;;
 ┊2┊2┊import { AlertController, NavController, NavParams } from &#x27;ionic-angular&#x27;;
 ┊3┊3┊import { PhoneService } from &#x27;../../services/phone&#x27;;
<b>+┊ ┊4┊import { FacebookPage } from &quot;../login/facebook&quot;;</b>
 ┊5┊5┊
 ┊6┊6┊@Component({
 ┊7┊7┊  selector: &#x27;verification&#x27;,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊43┊43┊
 ┊44┊44┊  verify(): void {
 ┊45┊45┊    this.phoneService.login(this.phone, this.code).then(() &#x3D;&gt; {
<b>+┊  ┊46┊      this.navCtrl.setRoot(FacebookPage, {}, {</b>
 ┊47┊47┊        animate: true
 ┊48┊48┊      });
 ┊49┊49┊    })
</pre>

[}]: #

It's time to fetch our name and profile picture from `Facebook`, as well as listing our `Facebook` friends who we want to chat with.

Let's start by adding the `fb` package:

    $ npm install --save fb

Now we can create our server side `Facebook` service:

[{]: <helper> (diffStep 17.17)

#### [Step 17.17: Create facebook Meteor service](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/cb34bc1)

##### Added api&#x2F;server&#x2F;services&#x2F;facebook.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊   ┊  1┊import {Users} from &quot;../collections/users&quot;;</b>
<b>+┊   ┊  2┊import {FB} from &quot;fb&quot;;</b>
<b>+┊   ┊  3┊</b>
<b>+┊   ┊  4┊export interface FbProfile {</b>
<b>+┊   ┊  5┊  name?: string;</b>
<b>+┊   ┊  6┊  pictureUrl?: string;</b>
<b>+┊   ┊  7┊};</b>
<b>+┊   ┊  8┊</b>
<b>+┊   ┊  9┊export class FacebookService {</b>
<b>+┊   ┊ 10┊  private APP_ID: string &#x3D; Meteor.settings.private.oAuth.facebook.appId;</b>
<b>+┊   ┊ 11┊  private APP_SECRET: string &#x3D; Meteor.settings.private.oAuth.facebook.secret;</b>
<b>+┊   ┊ 12┊</b>
<b>+┊   ┊ 13┊  constructor() {</b>
<b>+┊   ┊ 14┊  }</b>
<b>+┊   ┊ 15┊</b>
<b>+┊   ┊ 16┊  async getAppToken(): Promise&lt;string&gt; {</b>
<b>+┊   ┊ 17┊    try {</b>
<b>+┊   ┊ 18┊      return (await FB.api(&#x60;/oauth/access_token?client_id&#x3D;${this.APP_ID}&amp;client_secret&#x3D;${this.APP_SECRET}&amp;grant_type&#x3D;client_credentials&#x60;)).access_token;</b>
<b>+┊   ┊ 19┊    } catch (e) {</b>
<b>+┊   ┊ 20┊      throw new Meteor.Error(&#x27;cannot-receive&#x27;, &#x27;Cannot get an app token&#x27;);</b>
<b>+┊   ┊ 21┊    }</b>
<b>+┊   ┊ 22┊  }</b>
<b>+┊   ┊ 23┊</b>
<b>+┊   ┊ 24┊//TODO: create a before.insert in the users collection to check if the token is valid</b>
<b>+┊   ┊ 25┊  async tokenIsValid(token: string): Promise&lt;boolean&gt; {</b>
<b>+┊   ┊ 26┊    try {</b>
<b>+┊   ┊ 27┊      return (await FB.api(&#x60;debug_token?input_token&#x3D;${token}&amp;access_token&#x3D;${await this.getAppToken()}&#x60;)).data.is_valid;</b>
<b>+┊   ┊ 28┊    } catch (e) {</b>
<b>+┊   ┊ 29┊      console.error(e);</b>
<b>+┊   ┊ 30┊      return false;</b>
<b>+┊   ┊ 31┊    }</b>
<b>+┊   ┊ 32┊  }</b>
<b>+┊   ┊ 33┊</b>
<b>+┊   ┊ 34┊// Useless because we already got a long lived token</b>
<b>+┊   ┊ 35┊  async getLongLivedToken(token: string): Promise&lt;string&gt; {</b>
<b>+┊   ┊ 36┊    try {</b>
<b>+┊   ┊ 37┊      return (await FB.api(&#x60;/oauth/access_token?grant_type&#x3D;fb_exchange_token&amp;client_id&#x3D;${this.APP_ID}&amp;client_secret&#x3D;${this.APP_SECRET}&amp;fb_exchange_token&#x3D;${token}&#x60;)).access_token;</b>
<b>+┊   ┊ 38┊    } catch (e) {</b>
<b>+┊   ┊ 39┊      throw new Meteor.Error(&#x27;cannot-receive&#x27;, &#x27;Cannot get a long lived token&#x27;);</b>
<b>+┊   ┊ 40┊    }</b>
<b>+┊   ┊ 41┊  }</b>
<b>+┊   ┊ 42┊</b>
<b>+┊   ┊ 43┊  async getAccessToken(user: string): Promise&lt;string&gt; {</b>
<b>+┊   ┊ 44┊    //TODO: check if token has expired, if so the user must login again</b>
<b>+┊   ┊ 45┊    try {</b>
<b>+┊   ┊ 46┊      const facebook &#x3D; await Users.findOne(user).services.facebook;</b>
<b>+┊   ┊ 47┊      if (facebook.accessToken) {</b>
<b>+┊   ┊ 48┊        return facebook.accessToken;</b>
<b>+┊   ┊ 49┊      } else {</b>
<b>+┊   ┊ 50┊        throw new Error();</b>
<b>+┊   ┊ 51┊      }</b>
<b>+┊   ┊ 52┊    } catch (e) {</b>
<b>+┊   ┊ 53┊      throw new Meteor.Error(&#x27;unauthorized&#x27;, &#x27;User must be logged-in with Facebook to call this method&#x27;);</b>
<b>+┊   ┊ 54┊    }</b>
<b>+┊   ┊ 55┊  }</b>
<b>+┊   ┊ 56┊</b>
<b>+┊   ┊ 57┊  async getFriends(accessToken: string, user?: string): Promise&lt;any&gt; {</b>
<b>+┊   ┊ 58┊    //TODO: check if more permissions are needed, if so user must login again</b>
<b>+┊   ┊ 59┊    try {</b>
<b>+┊   ┊ 60┊      const params: any &#x3D; {</b>
<b>+┊   ┊ 61┊        //fields: &#x27;id,name&#x27;,</b>
<b>+┊   ┊ 62┊        limit: 5000</b>
<b>+┊   ┊ 63┊      };</b>
<b>+┊   ┊ 64┊      let friends: string[] &#x3D; [];</b>
<b>+┊   ┊ 65┊      let result: any;</b>
<b>+┊   ┊ 66┊      const fb &#x3D; FB.withAccessToken(accessToken);</b>
<b>+┊   ┊ 67┊</b>
<b>+┊   ┊ 68┊      do {</b>
<b>+┊   ┊ 69┊        result &#x3D; await fb.api(&#x60;/${user || &#x27;me&#x27;}/friends&#x60;, params);</b>
<b>+┊   ┊ 70┊        friends &#x3D; friends.concat(result.data);</b>
<b>+┊   ┊ 71┊        params.after &#x3D; result.paging &amp;&amp; result.paging.cursors &amp;&amp; result.paging.cursors.after;</b>
<b>+┊   ┊ 72┊      } while (result.paging &amp;&amp; result.paging.next);</b>
<b>+┊   ┊ 73┊</b>
<b>+┊   ┊ 74┊      return friends;</b>
<b>+┊   ┊ 75┊    } catch (e) {</b>
<b>+┊   ┊ 76┊      console.error(e);</b>
<b>+┊   ┊ 77┊      throw new Meteor.Error(&#x27;cannot-receive&#x27;, &#x27;Cannot get friends&#x27;)</b>
<b>+┊   ┊ 78┊    }</b>
<b>+┊   ┊ 79┊  }</b>
<b>+┊   ┊ 80┊</b>
<b>+┊   ┊ 81┊  async getProfile(accessToken: string, user?: string): Promise&lt;FbProfile&gt; {</b>
<b>+┊   ┊ 82┊    //TODO: check if more permissions are needed, if so user must login again</b>
<b>+┊   ┊ 83┊    try {</b>
<b>+┊   ┊ 84┊      const params: any &#x3D; {</b>
<b>+┊   ┊ 85┊        fields: &#x27;id,name,picture.width(800).height(800)&#x27;</b>
<b>+┊   ┊ 86┊      };</b>
<b>+┊   ┊ 87┊</b>
<b>+┊   ┊ 88┊      let profile: FbProfile &#x3D; {};</b>
<b>+┊   ┊ 89┊</b>
<b>+┊   ┊ 90┊      const fb &#x3D; FB.withAccessToken(accessToken);</b>
<b>+┊   ┊ 91┊      const result &#x3D; await fb.api(&#x60;/${user || &#x27;me&#x27;}&#x60;, params);</b>
<b>+┊   ┊ 92┊</b>
<b>+┊   ┊ 93┊      profile.name &#x3D; result.name;</b>
<b>+┊   ┊ 94┊      profile.pictureUrl &#x3D; result.picture.data.url;</b>
<b>+┊   ┊ 95┊</b>
<b>+┊   ┊ 96┊      return profile;</b>
<b>+┊   ┊ 97┊    } catch (e) {</b>
<b>+┊   ┊ 98┊      console.error(e);</b>
<b>+┊   ┊ 99┊      throw new Meteor.Error(&#x27;cannot-receive&#x27;, &#x27;Cannot get profile&#x27;)</b>
<b>+┊   ┊100┊    }</b>
<b>+┊   ┊101┊  }</b>
<b>+┊   ┊102┊}</b>
<b>+┊   ┊103┊</b>
<b>+┊   ┊104┊export const facebookService &#x3D; new FacebookService();</b>
</pre>

[}]: #

And the `getFbProfile` `Meteor` method:

[{]: <helper> (diffStep 17.18)

#### [Step 17.18: Create getFbProfile Meteor method](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/7a45ee1)

##### Changed api&#x2F;server&#x2F;methods.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 4┊ 4┊import { check, Match } from &#x27;meteor/check&#x27;;
 ┊ 5┊ 5┊import { Users } from &quot;./collections/users&quot;;
 ┊ 6┊ 6┊import { fcmService } from &quot;./services/fcm&quot;;
<b>+┊  ┊ 7┊import { facebookService, FbProfile } from &quot;./services/facebook&quot;;</b>
 ┊ 7┊ 8┊
 ┊ 8┊ 9┊const nonEmptyString &#x3D; Match.Where((str) &#x3D;&gt; {
 ┊ 9┊10┊  check(str, String);
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊118┊119┊    check(token, nonEmptyString);
 ┊119┊120┊
 ┊120┊121┊    Users.collection.update({_id: this.userId}, {$set: {&quot;fcmToken&quot;: token}});
<b>+┊   ┊122┊  },</b>
<b>+┊   ┊123┊  async getFbProfile(): Promise&lt;FbProfile&gt; {</b>
<b>+┊   ┊124┊    if (!this.userId) throw new Meteor.Error(&#x27;unauthorized&#x27;, &#x27;User must be logged-in to call this method&#x27;);</b>
<b>+┊   ┊125┊</b>
<b>+┊   ┊126┊    if (!Users.collection.findOne({&#x27;_id&#x27;: this.userId}).services.facebook) {</b>
<b>+┊   ┊127┊      throw new Meteor.Error(&#x27;unauthorized&#x27;, &#x27;User must be logged-in with Facebook to call this method&#x27;);</b>
<b>+┊   ┊128┊    }</b>
<b>+┊   ┊129┊</b>
<b>+┊   ┊130┊    //TODO: handle error: token may be expired</b>
<b>+┊   ┊131┊    const accessToken &#x3D; await facebookService.getAccessToken(this.userId);</b>
<b>+┊   ┊132┊    //TODO: handle error: user may have denied permissions</b>
<b>+┊   ┊133┊    return await facebookService.getProfile(accessToken);</b>
 ┊121┊134┊  }
 ┊122┊135┊});
</pre>

[}]: #

Finally we can update the `FacebookPage` to set the name and the picture from `Facebook`:

[{]: <helper> (diffStep 17.19)

#### [Step 17.19: Update facebook.ts to set name and picture from Facebook](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/348fd48)

##### Changed src&#x2F;pages&#x2F;login&#x2F;facebook.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 2┊ 2┊import { Alert, AlertController, NavController } from &quot;ionic-angular&quot;;
 ┊ 3┊ 3┊import { PhoneService } from &quot;../../services/phone&quot;;
 ┊ 4┊ 4┊import { ProfilePage } from &quot;../profile/profile&quot;;
<b>+┊  ┊ 5┊import { MeteorObservable } from &quot;meteor-rxjs&quot;;</b>
<b>+┊  ┊ 6┊import { FbProfile } from &quot;api/services/facebook&quot;;</b>
<b>+┊  ┊ 7┊import { Profile } from &quot;api/models&quot;;</b>
 ┊ 5┊ 8┊
 ┊ 6┊ 9┊@Component({
 ┊ 7┊10┊  selector: &#x27;facebook&#x27;,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊39┊42┊  linkFacebook(): void {
 ┊40┊43┊    this.phoneService.linkFacebook()
 ┊41┊44┊      .then(() &#x3D;&gt; {
<b>+┊  ┊45┊        MeteorObservable.call(&#x27;getFbProfile&#x27;).subscribe({</b>
<b>+┊  ┊46┊          next: (fbProfile: FbProfile) &#x3D;&gt; {</b>
<b>+┊  ┊47┊            const pathname &#x3D; (new URL(fbProfile.pictureUrl)).pathname;</b>
<b>+┊  ┊48┊            const filename &#x3D; pathname.substring(pathname.lastIndexOf(&#x27;/&#x27;) + 1);</b>
<b>+┊  ┊49┊            const description &#x3D; {name: filename};</b>
<b>+┊  ┊50┊            let profile: Profile &#x3D; {name: fbProfile.name, pictureId: &quot;&quot;};</b>
<b>+┊  ┊51┊            MeteorObservable.call(&#x27;ufsImportURL&#x27;, fbProfile.pictureUrl, description, &#x27;pictures&#x27;)</b>
<b>+┊  ┊52┊              .map((value) &#x3D;&gt; profile.pictureId &#x3D; (&lt;any&gt;value)._id)</b>
<b>+┊  ┊53┊              .switchMapTo(MeteorObservable.call(&#x27;updateProfile&#x27;, profile))</b>
<b>+┊  ┊54┊              .subscribe({</b>
<b>+┊  ┊55┊                next: () &#x3D;&gt; {</b>
<b>+┊  ┊56┊                  this.navCtrl.setRoot(ProfilePage, {}, {</b>
<b>+┊  ┊57┊                    animate: true</b>
<b>+┊  ┊58┊                  });</b>
<b>+┊  ┊59┊                },</b>
<b>+┊  ┊60┊                error: (e: Error) &#x3D;&gt; {</b>
<b>+┊  ┊61┊                  this.handleError(e);</b>
<b>+┊  ┊62┊                }</b>
<b>+┊  ┊63┊              });</b>
<b>+┊  ┊64┊          },</b>
<b>+┊  ┊65┊          error: (e: Error) &#x3D;&gt; {</b>
<b>+┊  ┊66┊            this.handleError(e);</b>
<b>+┊  ┊67┊          }</b>
 ┊44┊68┊        });
 ┊45┊69┊      })
 ┊46┊70┊      .catch((e) &#x3D;&gt; {
</pre>

[}]: #

To use promises inside publications we will install the `promise` `Meteor` package:

    api$ meteor add promise

Now we can update the `users` publication to also publish `Facebook` friends:

[{]: <helper> (diffStep 17.21)

#### [Step 17.21: Update users publication to publish Facebook friends](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/b189664)

##### Changed api&#x2F;server&#x2F;publications.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊3┊3┊import { Messages } from &#x27;./collections/messages&#x27;;
 ┊4┊4┊import { Chats } from &#x27;./collections/chats&#x27;;
 ┊5┊5┊import { Pictures } from &#x27;./collections/pictures&#x27;;
<b>+┊ ┊6┊import { facebookService } from &quot;./services/facebook&quot;;</b>
 ┊6┊7┊
 ┊7┊8┊Meteor.publishComposite(&#x27;users&#x27;, function(
 ┊8┊9┊  pattern: string,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊14┊15┊
 ┊15┊16┊  let selector &#x3D; {};
 ┊16┊17┊
<b>+┊  ┊18┊  var facebookFriendsIds: string[] &#x3D; [];</b>
<b>+┊  ┊19┊  if (Users.collection.findOne({&#x27;_id&#x27;: this.userId}).services.facebook) {</b>
<b>+┊  ┊20┊    //FIXME: add definitions for the promise Meteor package</b>
<b>+┊  ┊21┊    //TODO: handle error: token may be expired</b>
<b>+┊  ┊22┊    const accessToken &#x3D; (&lt;any&gt;Promise).await(facebookService.getAccessToken(this.userId));</b>
<b>+┊  ┊23┊    //TODO: handle error: user may have denied permissions</b>
<b>+┊  ┊24┊    const facebookFriends &#x3D; (&lt;any&gt;Promise).await(facebookService.getFriends(accessToken));</b>
<b>+┊  ┊25┊    facebookFriendsIds &#x3D; facebookFriends.map((friend) &#x3D;&gt; friend.id);</b>
<b>+┊  ┊26┊  }</b>
<b>+┊  ┊27┊</b>
 ┊17┊28┊  if (pattern) {
 ┊18┊29┊    selector &#x3D; {
 ┊19┊30┊      &#x27;profile.name&#x27;: { $regex: pattern, $options: &#x27;i&#x27; },
<b>+┊  ┊31┊      $or: [</b>
<b>+┊  ┊32┊        {&#x27;phone.number&#x27;: {$in: contacts}},</b>
<b>+┊  ┊33┊        {&#x27;services.facebook.id&#x27;: {$in: facebookFriendsIds}}</b>
<b>+┊  ┊34┊      ]</b>
 ┊21┊35┊    };
 ┊22┊36┊  } else {
<b>+┊  ┊37┊    selector &#x3D; {</b>
<b>+┊  ┊38┊      $or: [</b>
<b>+┊  ┊39┊        {&#x27;phone.number&#x27;: {$in: contacts}},</b>
<b>+┊  ┊40┊        {&#x27;services.facebook.id&#x27;: {$in: facebookFriendsIds}}</b>
<b>+┊  ┊41┊      ]</b>
<b>+┊  ┊42┊    }</b>
 ┊24┊43┊  }
 ┊25┊44┊
 ┊26┊45┊  return {
</pre>

[}]: #

[{]: <helper> (navStep nextRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/summary" prevRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/push-notifications")

⟸ <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/push-notifications">PREVIOUS STEP</a> <b>║</b> <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/summary">NEXT STEP</a> ⟹

[}]: #

