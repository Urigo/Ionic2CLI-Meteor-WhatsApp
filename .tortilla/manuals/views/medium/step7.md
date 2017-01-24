# Step 7: Users &amp; Authentication

In this step we will authenticate and identify users in our app.

Before we go ahead and start extending our app, we will add a few packages which will make our lives a bit less complex when it comes to authentication and users management.

First we will update our Meteor server and add few `Meteor` packages called `accounts-base` and `accounts-phone` which will give us the ability to verify a user using an SMS code, so run the following inside `api` directory:

    api$ meteor add accounts-base
    api$ meteor add npm-bcrypt
    api$ meteor add mys:accounts-phone

Be sure to keep your `Meteor` client script updated as well by running:

    $ npm run meteor-client:bundle

For the sake of debugging we gonna write an authentication settings file (`api/private/settings.json`) which might make our life easier, but once you're in production mode you *shouldn't* use this configuration:

[{]: <helper> (diffStep 7.2)

#### [Step 7.2: Add accounts-phone settings](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/6e95b43)

##### Added api&#x2F;private&#x2F;settings.json
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊ ┊1┊{</b>
<b>+┊ ┊2┊  &quot;accounts-phone&quot;: {</b>
<b>+┊ ┊3┊    &quot;verificationWaitTime&quot;: 0,</b>
<b>+┊ ┊4┊    &quot;verificationRetriesWaitTime&quot;: 0,</b>
<b>+┊ ┊5┊    &quot;adminPhoneNumbers&quot;: [&quot;+9721234567&quot;, &quot;+97212345678&quot;, &quot;+97212345679&quot;],</b>
<b>+┊ ┊6┊    &quot;phoneVerificationMasterCode&quot;: &quot;1234&quot;</b>
<b>+┊ ┊7┊  }</b>
<b>+┊ ┊8┊}</b>
</pre>

[}]: #

Now anytime we run our app we should provide it with a `settings.json`:

    api$ meteor run --settings private/settings.json

To make it simpler we can add a script called `api` script to the `package.json` which will start the Meteor server:

[{]: <helper> (diffStep 7.3)

#### [Step 7.3: Updated NPM script](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/9d76a73)

##### Changed package.json
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 9┊ 9┊    &quot;url&quot;: &quot;https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp.git&quot;
 ┊10┊10┊  },
 ┊11┊11┊  &quot;scripts&quot;: {
<b>+┊  ┊12┊    &quot;api&quot;: &quot;cd api &amp;&amp; meteor run --settings private/settings.json&quot;,</b>
 ┊12┊13┊    &quot;clean&quot;: &quot;ionic-app-scripts clean&quot;,
 ┊13┊14┊    &quot;build&quot;: &quot;ionic-app-scripts build&quot;,
 ┊14┊15┊    &quot;lint&quot;: &quot;ionic-app-scripts lint&quot;,
</pre>

[}]: #

> *NOTE*: If you would like to test the verification with a real phone number, `accounts-phone` provides an easy access for [twilio's API](https://www.twilio.com/), for more information see [accounts-phone's repo](https://github.com/okland/accounts-phone).

We will now apply the settings file we've just created so it can actually take effect:

[{]: <helper> (diffStep 7.4)

#### [Step 7.4: Added meteor accounts config](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/1f25f50)

##### Changed api&#x2F;server&#x2F;main.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 3┊ 3┊import { Messages } from &#x27;./collections/messages&#x27;;
 ┊ 4┊ 4┊import * as moment from &#x27;moment&#x27;;
 ┊ 5┊ 5┊import { MessageType } from &#x27;./models&#x27;;
<b>+┊  ┊ 6┊import { Accounts } from &#x27;meteor/accounts-base&#x27;;</b>
 ┊ 6┊ 7┊
 ┊ 7┊ 8┊Meteor.startup(() &#x3D;&gt; {
<b>+┊  ┊ 9┊  if (Meteor.settings) {</b>
<b>+┊  ┊10┊    Object.assign(Accounts._options, Meteor.settings[&#x27;accounts-phone&#x27;]);</b>
<b>+┊  ┊11┊    SMS.twilio &#x3D; Meteor.settings[&#x27;twilio&#x27;];</b>
<b>+┊  ┊12┊  }</b>
<b>+┊  ┊13┊</b>
 ┊ 8┊14┊  if (Chats.find({}).cursor.count() &#x3D;&#x3D;&#x3D; 0) {
 ┊ 9┊15┊    let chatId;
</pre>

[}]: #

We also need to make sure we have the necessary declaration files for the package we've just added, so the compiler can recognize the new API:

    $ npm install --save-dev @types/meteor-accounts-phone

And we will reference from the `tsconfig` like so:

[{]: <helper> (diffStep 7.6)

#### [Step 7.6: Updated tsconfig](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/e5f1144)

##### Changed api&#x2F;tsconfig.json
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊16┊16┊    &quot;stripInternal&quot;: true,
 ┊17┊17┊    &quot;noImplicitAny&quot;: false,
 ┊18┊18┊    &quot;types&quot;: [
<b>+┊  ┊19┊      &quot;meteor-typings&quot;,</b>
<b>+┊  ┊20┊      &quot;@types/meteor-accounts-phone&quot;</b>
 ┊20┊21┊    ]
 ┊21┊22┊  },
 ┊22┊23┊  &quot;exclude&quot;: [
</pre>

[}]: #

## Using Meteor's Accounts System

Now, we will use the `Meteor`'s accounts system in the client. Our first use case would be delaying our app's bootstrap phase, until `Meteor`'s accounts system has done it's initialization.

`Meteor`'s accounts API exposes a method called `loggingIn` which indicates if the authentication flow is done, which we gonna use before bootstraping our application, to make sure we provide the client with the necessary views which are right to his current state:

[{]: <helper> (diffStep 7.7)

#### [Step 7.7: Wait for user if logging in](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/cb2a59c)

##### Changed src&#x2F;app&#x2F;main.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 1┊ 1┊import &#x27;meteor-client&#x27;;
 ┊ 2┊ 2┊
 ┊ 3┊ 3┊import { platformBrowserDynamic } from &#x27;@angular/platform-browser-dynamic&#x27;;
<b>+┊  ┊ 4┊import { MeteorObservable } from &#x27;meteor-rxjs&#x27;;</b>
<b>+┊  ┊ 5┊import { Meteor } from &#x27;meteor/meteor&#x27;;</b>
 ┊ 5┊ 6┊import { AppModule } from &#x27;./app.module&#x27;;
 ┊ 6┊ 7┊
<b>+┊  ┊ 8┊Meteor.startup(() &#x3D;&gt; {</b>
<b>+┊  ┊ 9┊  const subscription &#x3D; MeteorObservable.autorun().subscribe(() &#x3D;&gt; {</b>
<b>+┊  ┊10┊</b>
<b>+┊  ┊11┊    if (Meteor.loggingIn()) {</b>
<b>+┊  ┊12┊      return;</b>
<b>+┊  ┊13┊    }</b>
<b>+┊  ┊14┊</b>
<b>+┊  ┊15┊    setTimeout(() &#x3D;&gt; subscription.unsubscribe());</b>
<b>+┊  ┊16┊    platformBrowserDynamic().bootstrapModule(AppModule);</b>
<b>+┊  ┊17┊  });</b>
<b>+┊  ┊18┊});</b>
</pre>

[}]: #

To make things easier, we're going to organize all authentication related functions into a single service which we're gonna call `PhoneService`:

[{]: <helper> (diffStep 7.8)

#### [Step 7.8: Added phone service](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/7ce27ce)

##### Added src&#x2F;services&#x2F;phone.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { Injectable } from &#x27;@angular/core&#x27;;</b>
<b>+┊  ┊ 2┊import { Accounts } from &#x27;meteor/accounts-base&#x27;;</b>
<b>+┊  ┊ 3┊import { Meteor } from &#x27;meteor/meteor&#x27;;</b>
<b>+┊  ┊ 4┊import { Platform } from &#x27;ionic-angular&#x27;;</b>
<b>+┊  ┊ 5┊</b>
<b>+┊  ┊ 6┊@Injectable()</b>
<b>+┊  ┊ 7┊export class PhoneService {</b>
<b>+┊  ┊ 8┊  constructor(private platform: Platform) {</b>
<b>+┊  ┊ 9┊</b>
<b>+┊  ┊10┊  }</b>
<b>+┊  ┊11┊</b>
<b>+┊  ┊12┊  verify(phoneNumber: string): Promise&lt;void&gt; {</b>
<b>+┊  ┊13┊    return new Promise&lt;void&gt;((resolve, reject) &#x3D;&gt; {</b>
<b>+┊  ┊14┊      Accounts.requestPhoneVerification(phoneNumber, (e: Error) &#x3D;&gt; {</b>
<b>+┊  ┊15┊        if (e) {</b>
<b>+┊  ┊16┊          return reject(e);</b>
<b>+┊  ┊17┊        }</b>
<b>+┊  ┊18┊</b>
<b>+┊  ┊19┊        resolve();</b>
<b>+┊  ┊20┊      });</b>
<b>+┊  ┊21┊    });</b>
<b>+┊  ┊22┊  }</b>
<b>+┊  ┊23┊</b>
<b>+┊  ┊24┊  login(phoneNumber: string, code: string): Promise&lt;void&gt; {</b>
<b>+┊  ┊25┊    return new Promise&lt;void&gt;((resolve, reject) &#x3D;&gt; {</b>
<b>+┊  ┊26┊      Accounts.verifyPhone(phoneNumber, code, (e: Error) &#x3D;&gt; {</b>
<b>+┊  ┊27┊        if (e) {</b>
<b>+┊  ┊28┊          return reject(e);</b>
<b>+┊  ┊29┊        }</b>
<b>+┊  ┊30┊</b>
<b>+┊  ┊31┊        resolve();</b>
<b>+┊  ┊32┊      });</b>
<b>+┊  ┊33┊    });</b>
<b>+┊  ┊34┊  }</b>
<b>+┊  ┊35┊</b>
<b>+┊  ┊36┊  logout(): Promise&lt;void&gt; {</b>
<b>+┊  ┊37┊    return new Promise&lt;void&gt;((resolve, reject) &#x3D;&gt; {</b>
<b>+┊  ┊38┊      Meteor.logout((e: Error) &#x3D;&gt; {</b>
<b>+┊  ┊39┊        if (e) {</b>
<b>+┊  ┊40┊          return reject(e);</b>
<b>+┊  ┊41┊        }</b>
<b>+┊  ┊42┊</b>
<b>+┊  ┊43┊        resolve();</b>
<b>+┊  ┊44┊      });</b>
<b>+┊  ┊45┊    });</b>
<b>+┊  ┊46┊  }</b>
<b>+┊  ┊47┊}🚫↵</b>
</pre>

[}]: #

And we gonna require it in the app's `NgModule` so it can be recognized:

[{]: <helper> (diffStep 7.9)

#### [Step 7.9: Added phone service to NgModule](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/bd755f3)

##### Changed src&#x2F;app&#x2F;app.module.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 6┊ 6┊import { MomentModule } from &#x27;angular2-moment&#x27;;
 ┊ 7┊ 7┊import { ChatsPage } from &#x27;../pages/chats/chats&#x27;;
 ┊ 8┊ 8┊import { MessagesPage } from &#x27;../pages/messages/messages&#x27;;
<b>+┊  ┊ 9┊import { PhoneService } from &#x27;../services/phone&#x27;;</b>
 ┊ 9┊10┊import { MyApp } from &#x27;./app.component&#x27;;
 ┊10┊11┊
 ┊11┊12┊@NgModule({
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊28┊29┊  providers: [
 ┊29┊30┊    StatusBar,
 ┊30┊31┊    SplashScreen,
<b>+┊  ┊32┊    {provide: ErrorHandler, useClass: IonicErrorHandler},</b>
<b>+┊  ┊33┊    PhoneService</b>
 ┊32┊34┊  ]
 ┊33┊35┊})
 ┊34┊36┊export class AppModule {}
</pre>

[}]: #

The `PhoneService` is not only packed with whatever functionality we need, but it also wraps async callbacks with promises, which has several advantages:

- A promise is chainable, and provides an easy way to manage an async flow.
- A promise is wrapped with `zone`, which means the view will be updated automatically once the callback has been invoked.
- A promise can interface with an `Observable`.

Just so the `TypeScript` compiler will know how to digest it, we shall also specify the `accounts-phone` types in the client `tsconfig.json` as well:

[{]: <helper> (diffStep "7.10")

#### [Step 7.10: Added meteor accouts typings to client side](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/20a8111)

##### Changed tsconfig.json
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊20┊20┊    &quot;stripInternal&quot;: true,
 ┊21┊21┊    &quot;noImplicitAny&quot;: false,
 ┊22┊22┊    &quot;types&quot;: [
<b>+┊  ┊23┊      &quot;@types/underscore&quot;,</b>
<b>+┊  ┊24┊      &quot;@types/meteor-accounts-phone&quot;</b>
 ┊24┊25┊    ]
 ┊25┊26┊  },
 ┊26┊27┊  &quot;include&quot;: [
</pre>

[}]: #

## UI

For authentication purposes, we gonna create the following flow in our app:

- login - The initial page in the authentication flow where the user fills up his phone number.
- verification - Verify a user's phone number by an SMS authentication.
- profile - Ask a user to pickup its name. Afterwards he will be promoted to the tabs page.

Let's start by creating the `LoginComponent`. In this component we will request an SMS verification right after a phone number has been entered:

[{]: <helper> (diffStep 7.11)

#### [Step 7.11: Add login component](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/9ac1d18)

##### Added src&#x2F;pages&#x2F;login&#x2F;login.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { Component } from &#x27;@angular/core&#x27;;</b>
<b>+┊  ┊ 2┊import { Alert, AlertController, NavController } from &#x27;ionic-angular&#x27;;</b>
<b>+┊  ┊ 3┊import { PhoneService } from &#x27;../../services/phone&#x27;;</b>
<b>+┊  ┊ 4┊</b>
<b>+┊  ┊ 5┊@Component({</b>
<b>+┊  ┊ 6┊  selector: &#x27;login&#x27;,</b>
<b>+┊  ┊ 7┊  templateUrl: &#x27;login.html&#x27;</b>
<b>+┊  ┊ 8┊})</b>
<b>+┊  ┊ 9┊export class LoginPage {</b>
<b>+┊  ┊10┊  private phone &#x3D; &#x27;&#x27;;</b>
<b>+┊  ┊11┊</b>
<b>+┊  ┊12┊  constructor(</b>
<b>+┊  ┊13┊    private alertCtrl: AlertController,</b>
<b>+┊  ┊14┊    private phoneService: PhoneService,</b>
<b>+┊  ┊15┊    private navCtrl: NavController</b>
<b>+┊  ┊16┊  ) {}</b>
<b>+┊  ┊17┊</b>
<b>+┊  ┊18┊  onInputKeypress({keyCode}: KeyboardEvent): void {</b>
<b>+┊  ┊19┊    if (keyCode &#x3D;&#x3D;&#x3D; 13) {</b>
<b>+┊  ┊20┊      this.login();</b>
<b>+┊  ┊21┊    }</b>
<b>+┊  ┊22┊  }</b>
<b>+┊  ┊23┊</b>
<b>+┊  ┊24┊  login(phone: string &#x3D; this.phone): void {</b>
<b>+┊  ┊25┊    const alert &#x3D; this.alertCtrl.create({</b>
<b>+┊  ┊26┊      title: &#x27;Confirm&#x27;,</b>
<b>+┊  ┊27┊      message: &#x60;Would you like to proceed with the phone number ${phone}?&#x60;,</b>
<b>+┊  ┊28┊      buttons: [</b>
<b>+┊  ┊29┊        {</b>
<b>+┊  ┊30┊          text: &#x27;Cancel&#x27;,</b>
<b>+┊  ┊31┊          role: &#x27;cancel&#x27;</b>
<b>+┊  ┊32┊        },</b>
<b>+┊  ┊33┊        {</b>
<b>+┊  ┊34┊          text: &#x27;Yes&#x27;,</b>
<b>+┊  ┊35┊          handler: () &#x3D;&gt; {</b>
<b>+┊  ┊36┊            this.handleLogin(alert);</b>
<b>+┊  ┊37┊            return false;</b>
<b>+┊  ┊38┊          }</b>
<b>+┊  ┊39┊        }</b>
<b>+┊  ┊40┊      ]</b>
<b>+┊  ┊41┊    });</b>
<b>+┊  ┊42┊</b>
<b>+┊  ┊43┊    alert.present();</b>
<b>+┊  ┊44┊  }</b>
<b>+┊  ┊45┊</b>
<b>+┊  ┊46┊  handleLogin(alert: Alert): void {</b>
<b>+┊  ┊47┊    alert.dismiss().then(() &#x3D;&gt; {</b>
<b>+┊  ┊48┊      return this.phoneService.verify(this.phone);</b>
<b>+┊  ┊49┊    })</b>
<b>+┊  ┊50┊    .catch((e) &#x3D;&gt; {</b>
<b>+┊  ┊51┊      this.handleError(e);</b>
<b>+┊  ┊52┊    });</b>
<b>+┊  ┊53┊  }</b>
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
<b>+┊  ┊66┊}</b>
</pre>

[}]: #

In short, once we press the login button, the `login` method is called and shows an alert dialog to confirm the action (See [reference](http://ionicframework.com/docs/v2/components/#alert)). If an error has occurred, the `handlerError` method is called and shows an alert dialog with the received error. If everything went as expected the `handleLogin` method is invoked, which will call the `login` method in the `PhoneService`.

Hopefully that the component's logic is clear now, let's move to the template:

[{]: <helper> (diffStep 7.12)

#### [Step 7.12: Add login template](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/8c74e9a)

##### Added src&#x2F;pages&#x2F;login&#x2F;login.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊&lt;ion-header&gt;</b>
<b>+┊  ┊ 2┊  &lt;ion-navbar color&#x3D;&quot;whatsapp&quot;&gt;</b>
<b>+┊  ┊ 3┊    &lt;ion-title&gt;Login&lt;/ion-title&gt;</b>
<b>+┊  ┊ 4┊</b>
<b>+┊  ┊ 5┊    &lt;ion-buttons end&gt;</b>
<b>+┊  ┊ 6┊      &lt;button ion-button class&#x3D;&quot;done-button&quot; (click)&#x3D;&quot;login()&quot;&gt;Done&lt;/button&gt;</b>
<b>+┊  ┊ 7┊    &lt;/ion-buttons&gt;</b>
<b>+┊  ┊ 8┊  &lt;/ion-navbar&gt;</b>
<b>+┊  ┊ 9┊&lt;/ion-header&gt;</b>
<b>+┊  ┊10┊</b>
<b>+┊  ┊11┊&lt;ion-content padding class&#x3D;&quot;login-page-content&quot;&gt;</b>
<b>+┊  ┊12┊  &lt;div class&#x3D;&quot;instructions&quot;&gt;</b>
<b>+┊  ┊13┊    &lt;div&gt;</b>
<b>+┊  ┊14┊      Please enter your phone number including its country code.</b>
<b>+┊  ┊15┊    &lt;/div&gt;</b>
<b>+┊  ┊16┊    &lt;br&gt;</b>
<b>+┊  ┊17┊    &lt;div&gt;</b>
<b>+┊  ┊18┊      The messenger will send a one time SMS message to verify your phone number. Carrier SMS charges may apply.</b>
<b>+┊  ┊19┊    &lt;/div&gt;</b>
<b>+┊  ┊20┊  &lt;/div&gt;</b>
<b>+┊  ┊21┊</b>
<b>+┊  ┊22┊  &lt;ion-item&gt;</b>
<b>+┊  ┊23┊    &lt;ion-input [(ngModel)]&#x3D;&quot;phone&quot; (keypress)&#x3D;&quot;onInputKeypress($event)&quot; type&#x3D;&quot;tel&quot; placeholder&#x3D;&quot;Your phone number&quot;&gt;&lt;/ion-input&gt;</b>
<b>+┊  ┊24┊  &lt;/ion-item&gt;</b>
<b>+┊  ┊25┊&lt;/ion-content&gt;</b>
</pre>

[}]: #

And add some style into it:

[{]: <helper> (diffStep 7.13)

#### [Step 7.13: Add login component styles](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/194f8fd)

##### Added src&#x2F;pages&#x2F;login&#x2F;login.scss
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

And as usual, newly created components should be imported in the app's module:

[{]: <helper> (diffStep 7.14)

#### [Step 7.14: Import login component](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/dd39584)

##### Changed src&#x2F;app&#x2F;app.module.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 5┊ 5┊import { StatusBar } from &#x27;@ionic-native/status-bar&#x27;;
 ┊ 6┊ 6┊import { MomentModule } from &#x27;angular2-moment&#x27;;
 ┊ 7┊ 7┊import { ChatsPage } from &#x27;../pages/chats/chats&#x27;;
<b>+┊  ┊ 8┊import { LoginPage } from &#x27;../pages/login/login&#x27;;</b>
 ┊ 8┊ 9┊import { MessagesPage } from &#x27;../pages/messages/messages&#x27;;
 ┊ 9┊10┊import { PhoneService } from &#x27;../services/phone&#x27;;
 ┊10┊11┊import { MyApp } from &#x27;./app.component&#x27;;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊13┊14┊  declarations: [
 ┊14┊15┊    MyApp,
 ┊15┊16┊    ChatsPage,
<b>+┊  ┊17┊    MessagesPage,</b>
<b>+┊  ┊18┊    LoginPage</b>
 ┊17┊19┊  ],
 ┊18┊20┊  imports: [
 ┊19┊21┊    BrowserModule,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊24┊26┊  entryComponents: [
 ┊25┊27┊    MyApp,
 ┊26┊28┊    ChatsPage,
<b>+┊  ┊29┊    MessagesPage,</b>
<b>+┊  ┊30┊    LoginPage</b>
 ┊28┊31┊  ],
 ┊29┊32┊  providers: [
 ┊30┊33┊    StatusBar,
</pre>

[}]: #

We will also need to identify if the user is logged in or not once the app is launched; If so - the user will be promoted directly to the `ChatsPage`, and if not, he will have to go through the `LoginPage` first:

[{]: <helper> (diffStep 7.15)

#### [Step 7.15: Add user identification in app&#x27;s main component](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/b6b6e1e)

##### Changed src&#x2F;app&#x2F;app.component.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 3┊ 3┊import { StatusBar } from &#x27;@ionic-native/status-bar&#x27;;
 ┊ 4┊ 4┊import { SplashScreen } from &#x27;@ionic-native/splash-screen&#x27;;
 ┊ 5┊ 5┊import { ChatsPage } from &#x27;../pages/chats/chats&#x27;;
<b>+┊  ┊ 6┊import { Meteor } from &#x27;meteor/meteor&#x27;;</b>
<b>+┊  ┊ 7┊import { LoginPage } from &#x27;../pages/login/login&#x27;;</b>
 ┊ 6┊ 8┊
 ┊ 7┊ 9┊@Component({
 ┊ 8┊10┊  templateUrl: &#x27;app.html&#x27;
 ┊ 9┊11┊})
 ┊10┊12┊export class MyApp {
<b>+┊  ┊13┊  rootPage: any;</b>
 ┊12┊14┊
 ┊13┊15┊  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
<b>+┊  ┊16┊    this.rootPage &#x3D; Meteor.user() ? ChatsPage : LoginPage;</b>
<b>+┊  ┊17┊</b>
 ┊14┊18┊    platform.ready().then(() &#x3D;&gt; {
 ┊15┊19┊      // Okay, so the platform is ready and our plugins are available.
 ┊16┊20┊      // Here you can do any higher level native things you might need.
</pre>

[}]: #

Let's proceed and implement the verification page. We will start by creating its component, called `VerificationPage`. Logic is pretty much the same as in the `LoginComponent`:

[{]: <helper> (diffStep 7.16)

#### [Step 7.16: Added verification component](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/e22875e)

##### Added src&#x2F;pages&#x2F;verification&#x2F;verification.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { Component, OnInit } from &#x27;@angular/core&#x27;;</b>
<b>+┊  ┊ 2┊import { AlertController, NavController, NavParams } from &#x27;ionic-angular&#x27;;</b>
<b>+┊  ┊ 3┊import { PhoneService } from &#x27;../../services/phone&#x27;;</b>
<b>+┊  ┊ 4┊</b>
<b>+┊  ┊ 5┊@Component({</b>
<b>+┊  ┊ 6┊  selector: &#x27;verification&#x27;,</b>
<b>+┊  ┊ 7┊  templateUrl: &#x27;verification.html&#x27;</b>
<b>+┊  ┊ 8┊})</b>
<b>+┊  ┊ 9┊export class VerificationPage implements OnInit {</b>
<b>+┊  ┊10┊  private code: string &#x3D; &#x27;&#x27;;</b>
<b>+┊  ┊11┊  private phone: string;</b>
<b>+┊  ┊12┊</b>
<b>+┊  ┊13┊  constructor(</b>
<b>+┊  ┊14┊    private alertCtrl: AlertController,</b>
<b>+┊  ┊15┊    private navCtrl: NavController,</b>
<b>+┊  ┊16┊    private navParams: NavParams,</b>
<b>+┊  ┊17┊    private phoneService: PhoneService</b>
<b>+┊  ┊18┊  ) {}</b>
<b>+┊  ┊19┊</b>
<b>+┊  ┊20┊  ngOnInit() {</b>
<b>+┊  ┊21┊    this.phone &#x3D; this.navParams.get(&#x27;phone&#x27;);</b>
<b>+┊  ┊22┊  }</b>
<b>+┊  ┊23┊</b>
<b>+┊  ┊24┊  onInputKeypress({keyCode}: KeyboardEvent): void {</b>
<b>+┊  ┊25┊    if (keyCode &#x3D;&#x3D;&#x3D; 13) {</b>
<b>+┊  ┊26┊      this.verify();</b>
<b>+┊  ┊27┊    }</b>
<b>+┊  ┊28┊  }</b>
<b>+┊  ┊29┊</b>
<b>+┊  ┊30┊  verify(): void {</b>
<b>+┊  ┊31┊    this.phoneService.login(this.phone, this.code)</b>
<b>+┊  ┊32┊    .catch((e) &#x3D;&gt; {</b>
<b>+┊  ┊33┊      this.handleError(e);</b>
<b>+┊  ┊34┊    });</b>
<b>+┊  ┊35┊  }</b>
<b>+┊  ┊36┊</b>
<b>+┊  ┊37┊  handleError(e: Error): void {</b>
<b>+┊  ┊38┊    console.error(e);</b>
<b>+┊  ┊39┊</b>
<b>+┊  ┊40┊    const alert &#x3D; this.alertCtrl.create({</b>
<b>+┊  ┊41┊      title: &#x27;Oops!&#x27;,</b>
<b>+┊  ┊42┊      message: e.message,</b>
<b>+┊  ┊43┊      buttons: [&#x27;OK&#x27;]</b>
<b>+┊  ┊44┊    });</b>
<b>+┊  ┊45┊</b>
<b>+┊  ┊46┊    alert.present();</b>
<b>+┊  ┊47┊  }</b>
<b>+┊  ┊48┊}</b>
</pre>

[}]: #

[{]: <helper> (diffStep 7.17)

#### [Step 7.17: Added verification template](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/98bccfd)

##### Added src&#x2F;pages&#x2F;verification&#x2F;verification.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊&lt;ion-header&gt;</b>
<b>+┊  ┊ 2┊  &lt;ion-navbar color&#x3D;&quot;whatsapp&quot;&gt;</b>
<b>+┊  ┊ 3┊    &lt;ion-title&gt;Verification&lt;/ion-title&gt;</b>
<b>+┊  ┊ 4┊</b>
<b>+┊  ┊ 5┊    &lt;ion-buttons end&gt;</b>
<b>+┊  ┊ 6┊      &lt;button ion-button class&#x3D;&quot;verify-button&quot; (click)&#x3D;&quot;verify()&quot;&gt;Verify&lt;/button&gt;</b>
<b>+┊  ┊ 7┊    &lt;/ion-buttons&gt;</b>
<b>+┊  ┊ 8┊  &lt;/ion-navbar&gt;</b>
<b>+┊  ┊ 9┊&lt;/ion-header&gt;</b>
<b>+┊  ┊10┊</b>
<b>+┊  ┊11┊&lt;ion-content padding class&#x3D;&quot;verification-page-content&quot;&gt;</b>
<b>+┊  ┊12┊  &lt;div class&#x3D;&quot;instructions&quot;&gt;</b>
<b>+┊  ┊13┊    &lt;div&gt;</b>
<b>+┊  ┊14┊      An SMS message with the verification code has been sent to {{phone}}.</b>
<b>+┊  ┊15┊    &lt;/div&gt;</b>
<b>+┊  ┊16┊    &lt;br&gt;</b>
<b>+┊  ┊17┊    &lt;div&gt;</b>
<b>+┊  ┊18┊      To proceed, please enter the 4-digit verification code below.</b>
<b>+┊  ┊19┊    &lt;/div&gt;</b>
<b>+┊  ┊20┊  &lt;/div&gt;</b>
<b>+┊  ┊21┊</b>
<b>+┊  ┊22┊  &lt;ion-item&gt;</b>
<b>+┊  ┊23┊    &lt;ion-input [(ngModel)]&#x3D;&quot;code&quot; (keypress)&#x3D;&quot;onInputKeypress($event)&quot; type&#x3D;&quot;tel&quot; placeholder&#x3D;&quot;Your verification code&quot;&gt;&lt;/ion-input&gt;</b>
<b>+┊  ┊24┊  &lt;/ion-item&gt;</b>
<b>+┊  ┊25┊&lt;/ion-content&gt;</b>
</pre>

[}]: #

[{]: <helper> (diffStep 7.18)

#### [Step 7.18: Added stylesheet for verification component](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/18a7578)

##### Added src&#x2F;pages&#x2F;verification&#x2F;verification.scss
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊.verification-page-content {</b>
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

And add it to the `NgModule`:

[{]: <helper> (diffStep 7.19)

#### [Step 7.19: Import verification component](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/946dea2)

##### Changed src&#x2F;app&#x2F;app.module.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 7┊ 7┊import { ChatsPage } from &#x27;../pages/chats/chats&#x27;;
 ┊ 8┊ 8┊import { LoginPage } from &#x27;../pages/login/login&#x27;;
 ┊ 9┊ 9┊import { MessagesPage } from &#x27;../pages/messages/messages&#x27;;
<b>+┊  ┊10┊import { VerificationPage } from &#x27;../pages/verification/verification&#x27;;</b>
 ┊10┊11┊import { PhoneService } from &#x27;../services/phone&#x27;;
 ┊11┊12┊import { MyApp } from &#x27;./app.component&#x27;;
 ┊12┊13┊
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊15┊16┊    MyApp,
 ┊16┊17┊    ChatsPage,
 ┊17┊18┊    MessagesPage,
<b>+┊  ┊19┊    LoginPage,</b>
<b>+┊  ┊20┊    VerificationPage</b>
 ┊19┊21┊  ],
 ┊20┊22┊  imports: [
 ┊21┊23┊    BrowserModule,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊27┊29┊    MyApp,
 ┊28┊30┊    ChatsPage,
 ┊29┊31┊    MessagesPage,
<b>+┊  ┊32┊    LoginPage,</b>
<b>+┊  ┊33┊    VerificationPage</b>
 ┊31┊34┊  ],
 ┊32┊35┊  providers: [
 ┊33┊36┊    StatusBar,
</pre>

[}]: #

Now we can make sure that anytime we login, we will be promoted to the `VerificationPage` right after:

[{]: <helper> (diffStep "7.20")

#### [Step 7.20: Import and use verfication page from login](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/3a0431a)

##### Changed src&#x2F;pages&#x2F;login&#x2F;login.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊import { Component } from &#x27;@angular/core&#x27;;
 ┊2┊2┊import { Alert, AlertController, NavController } from &#x27;ionic-angular&#x27;;
 ┊3┊3┊import { PhoneService } from &#x27;../../services/phone&#x27;;
<b>+┊ ┊4┊import { VerificationPage } from &#x27;../verification/verification&#x27;;</b>
 ┊4┊5┊
 ┊5┊6┊@Component({
 ┊6┊7┊  selector: &#x27;login&#x27;,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊47┊48┊    alert.dismiss().then(() &#x3D;&gt; {
 ┊48┊49┊      return this.phoneService.verify(this.phone);
 ┊49┊50┊    })
<b>+┊  ┊51┊      .then(() &#x3D;&gt; {</b>
<b>+┊  ┊52┊        this.navCtrl.push(VerificationPage, {</b>
<b>+┊  ┊53┊          phone: this.phone</b>
<b>+┊  ┊54┊        });</b>
<b>+┊  ┊55┊      })</b>
 ┊50┊56┊    .catch((e) &#x3D;&gt; {
 ┊51┊57┊      this.handleError(e);
 ┊52┊58┊    });
</pre>

[}]: #

The last step in our authentication pattern is setting our profile. We will create a `Profile` interface so the compiler can recognize profile-data structures:

[{]: <helper> (diffStep 7.21)

#### [Step 7.21: Add profile interface](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/9013a4a)

##### Changed api&#x2F;server&#x2F;models.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊export const DEFAULT_PICTURE_URL &#x3D; &#x27;/assets/default-profile-pic.svg&#x27;;</b>
<b>+┊  ┊ 2┊</b>
<b>+┊  ┊ 3┊export interface Profile {</b>
<b>+┊  ┊ 4┊  name?: string;</b>
<b>+┊  ┊ 5┊  picture?: string;</b>
<b>+┊  ┊ 6┊}</b>
<b>+┊  ┊ 7┊</b>
 ┊ 1┊ 8┊export enum MessageType {
 ┊ 2┊ 9┊  TEXT &#x3D; &lt;any&gt;&#x27;text&#x27;
 ┊ 3┊10┊}
</pre>

[}]: #

As you can probably notice we also defined a constant for the default profile picture. We will need to make this resource available for use before proceeding. The referenced `svg` file can be copied directly from the `ionicons` NodeJS module using the following command:

    src/assets$ cp ../../node_modules/ionicons/dist/svg/ios-contact.svg default-profile-pic.svg

Now we can safely proceed to implementing the `ProfileComponent`:

[{]: <helper> (diffStep 7.23)

#### [Step 7.23: Add profile component](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/f970ee1)

##### Added src&#x2F;pages&#x2F;profile&#x2F;profile.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { Component, OnInit } from &#x27;@angular/core&#x27;;</b>
<b>+┊  ┊ 2┊import { Profile } from &#x27;api/models&#x27;;</b>
<b>+┊  ┊ 3┊import { AlertController, NavController } from &#x27;ionic-angular&#x27;;</b>
<b>+┊  ┊ 4┊import { MeteorObservable } from &#x27;meteor-rxjs&#x27;;</b>
<b>+┊  ┊ 5┊import { ChatsPage } from &#x27;../chats/chats&#x27;;</b>
<b>+┊  ┊ 6┊</b>
<b>+┊  ┊ 7┊@Component({</b>
<b>+┊  ┊ 8┊  selector: &#x27;profile&#x27;,</b>
<b>+┊  ┊ 9┊  templateUrl: &#x27;profile.html&#x27;</b>
<b>+┊  ┊10┊})</b>
<b>+┊  ┊11┊export class ProfilePage implements OnInit {</b>
<b>+┊  ┊12┊  picture: string;</b>
<b>+┊  ┊13┊  profile: Profile;</b>
<b>+┊  ┊14┊</b>
<b>+┊  ┊15┊  constructor(</b>
<b>+┊  ┊16┊    private alertCtrl: AlertController,</b>
<b>+┊  ┊17┊    private navCtrl: NavController</b>
<b>+┊  ┊18┊  ) {}</b>
<b>+┊  ┊19┊</b>
<b>+┊  ┊20┊  ngOnInit(): void {</b>
<b>+┊  ┊21┊    this.profile &#x3D; Meteor.user().profile || {</b>
<b>+┊  ┊22┊      name: &#x27;&#x27;</b>
<b>+┊  ┊23┊    };</b>
<b>+┊  ┊24┊  }</b>
<b>+┊  ┊25┊</b>
<b>+┊  ┊26┊  updateProfile(): void {</b>
<b>+┊  ┊27┊    MeteorObservable.call(&#x27;updateProfile&#x27;, this.profile).subscribe({</b>
<b>+┊  ┊28┊      next: () &#x3D;&gt; {</b>
<b>+┊  ┊29┊        this.navCtrl.push(ChatsPage);</b>
<b>+┊  ┊30┊      },</b>
<b>+┊  ┊31┊      error: (e: Error) &#x3D;&gt; {</b>
<b>+┊  ┊32┊        this.handleError(e);</b>
<b>+┊  ┊33┊      }</b>
<b>+┊  ┊34┊    });</b>
<b>+┊  ┊35┊  }</b>
<b>+┊  ┊36┊</b>
<b>+┊  ┊37┊  handleError(e: Error): void {</b>
<b>+┊  ┊38┊    console.error(e);</b>
<b>+┊  ┊39┊</b>
<b>+┊  ┊40┊    const alert &#x3D; this.alertCtrl.create({</b>
<b>+┊  ┊41┊      title: &#x27;Oops!&#x27;,</b>
<b>+┊  ┊42┊      message: e.message,</b>
<b>+┊  ┊43┊      buttons: [&#x27;OK&#x27;]</b>
<b>+┊  ┊44┊    });</b>
<b>+┊  ┊45┊</b>
<b>+┊  ┊46┊    alert.present();</b>
<b>+┊  ┊47┊  }</b>
<b>+┊  ┊48┊}</b>
</pre>

[}]: #

[{]: <helper> (diffStep 7.24)

#### [Step 7.24: Add profile template](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/5e14964)

##### Added src&#x2F;pages&#x2F;profile&#x2F;profile.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊&lt;ion-header&gt;</b>
<b>+┊  ┊ 2┊  &lt;ion-navbar color&#x3D;&quot;whatsapp&quot;&gt;</b>
<b>+┊  ┊ 3┊    &lt;ion-title&gt;Profile&lt;/ion-title&gt;</b>
<b>+┊  ┊ 4┊</b>
<b>+┊  ┊ 5┊    &lt;ion-buttons end&gt;</b>
<b>+┊  ┊ 6┊      &lt;button ion-button class&#x3D;&quot;done-button&quot; (click)&#x3D;&quot;updateProfile()&quot;&gt;Done&lt;/button&gt;</b>
<b>+┊  ┊ 7┊    &lt;/ion-buttons&gt;</b>
<b>+┊  ┊ 8┊  &lt;/ion-navbar&gt;</b>
<b>+┊  ┊ 9┊&lt;/ion-header&gt;</b>
<b>+┊  ┊10┊</b>
<b>+┊  ┊11┊&lt;ion-content class&#x3D;&quot;profile-page-content&quot;&gt;</b>
<b>+┊  ┊12┊  &lt;div class&#x3D;&quot;profile-picture&quot;&gt;</b>
<b>+┊  ┊13┊    &lt;img *ngIf&#x3D;&quot;picture&quot; [src]&#x3D;&quot;picture&quot;&gt;</b>
<b>+┊  ┊14┊  &lt;/div&gt;</b>
<b>+┊  ┊15┊</b>
<b>+┊  ┊16┊  &lt;ion-item class&#x3D;&quot;profile-name&quot;&gt;</b>
<b>+┊  ┊17┊    &lt;ion-label stacked&gt;Name&lt;/ion-label&gt;</b>
<b>+┊  ┊18┊    &lt;ion-input [(ngModel)]&#x3D;&quot;profile.name&quot; placeholder&#x3D;&quot;Your name&quot;&gt;&lt;/ion-input&gt;</b>
<b>+┊  ┊19┊  &lt;/ion-item&gt;</b>
<b>+┊  ┊20┊&lt;/ion-content&gt;</b>
</pre>

[}]: #

[{]: <helper> (diffStep 7.25)

#### [Step 7.25: Add profile component style](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/c4ec759)

##### Added src&#x2F;pages&#x2F;profile&#x2F;profile.scss
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊.profile-page-content {</b>
<b>+┊  ┊ 2┊  .profile-picture {</b>
<b>+┊  ┊ 3┊    max-width: 300px;</b>
<b>+┊  ┊ 4┊    display: block;</b>
<b>+┊  ┊ 5┊    margin: auto;</b>
<b>+┊  ┊ 6┊</b>
<b>+┊  ┊ 7┊    img {</b>
<b>+┊  ┊ 8┊      margin-bottom: -33px;</b>
<b>+┊  ┊ 9┊      width: 100%;</b>
<b>+┊  ┊10┊    }</b>
<b>+┊  ┊11┊</b>
<b>+┊  ┊12┊    ion-icon {</b>
<b>+┊  ┊13┊      float: right;</b>
<b>+┊  ┊14┊      font-size: 30px;</b>
<b>+┊  ┊15┊      opacity: 0.5;</b>
<b>+┊  ┊16┊      border-left: black solid 1px;</b>
<b>+┊  ┊17┊      padding-left: 5px;</b>
<b>+┊  ┊18┊    }</b>
<b>+┊  ┊19┊  }</b>
<b>+┊  ┊20┊}</b>
</pre>

[}]: #

Let's redirect users who passed the verification stage to the newly created `ProfileComponent` like so:

[{]: <helper> (diffStep 7.26)

#### [Step 7.26: Use profile component in verification page](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/91bf8dd)

##### Changed src&#x2F;pages&#x2F;verification&#x2F;verification.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊import { Component, OnInit } from &#x27;@angular/core&#x27;;
 ┊2┊2┊import { AlertController, NavController, NavParams } from &#x27;ionic-angular&#x27;;
 ┊3┊3┊import { PhoneService } from &#x27;../../services/phone&#x27;;
<b>+┊ ┊4┊import { ProfilePage } from &#x27;../profile/profile&#x27;;</b>
 ┊4┊5┊
 ┊5┊6┊@Component({
 ┊6┊7┊  selector: &#x27;verification&#x27;,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊28┊29┊  }
 ┊29┊30┊
 ┊30┊31┊  verify(): void {
<b>+┊  ┊32┊    this.phoneService.login(this.phone, this.code).then(() &#x3D;&gt; {</b>
<b>+┊  ┊33┊      this.navCtrl.setRoot(ProfilePage, {}, {</b>
<b>+┊  ┊34┊        animate: true</b>
<b>+┊  ┊35┊      });</b>
<b>+┊  ┊36┊    })</b>
 ┊32┊37┊    .catch((e) &#x3D;&gt; {
 ┊33┊38┊      this.handleError(e);
 ┊34┊39┊    });
</pre>

[}]: #

We will also need to import the `ProfileComponent` in the app's `NgModule` so it can be recognized:

[{]: <helper> (diffStep 7.27)

#### [Step 7.27: Import profile component](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/7a850ca)

##### Changed src&#x2F;app&#x2F;app.module.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 7┊ 7┊import { ChatsPage } from &#x27;../pages/chats/chats&#x27;;
 ┊ 8┊ 8┊import { LoginPage } from &#x27;../pages/login/login&#x27;;
 ┊ 9┊ 9┊import { MessagesPage } from &#x27;../pages/messages/messages&#x27;;
<b>+┊  ┊10┊import { ProfilePage } from &#x27;../pages/profile/profile&#x27;;</b>
 ┊10┊11┊import { VerificationPage } from &#x27;../pages/verification/verification&#x27;;
 ┊11┊12┊import { PhoneService } from &#x27;../services/phone&#x27;;
 ┊12┊13┊import { MyApp } from &#x27;./app.component&#x27;;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊17┊18┊    ChatsPage,
 ┊18┊19┊    MessagesPage,
 ┊19┊20┊    LoginPage,
<b>+┊  ┊21┊    VerificationPage,</b>
<b>+┊  ┊22┊    ProfilePage</b>
 ┊21┊23┊  ],
 ┊22┊24┊  imports: [
 ┊23┊25┊    BrowserModule,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊30┊32┊    ChatsPage,
 ┊31┊33┊    MessagesPage,
 ┊32┊34┊    LoginPage,
<b>+┊  ┊35┊    VerificationPage,</b>
<b>+┊  ┊36┊    ProfilePage</b>
 ┊34┊37┊  ],
 ┊35┊38┊  providers: [
 ┊36┊39┊    StatusBar,
</pre>

[}]: #

The core logic behind this component actually lies within the invocation of the `updateProfile`, a Meteor method implemented in our API which looks like so:

[{]: <helper> (diffStep 7.28)

#### [Step 7.28: Added updateProfile method](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/3567334)

##### Changed api&#x2F;server&#x2F;methods.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊1┊1┊import { Chats } from &#x27;./collections/chats&#x27;;
 ┊2┊2┊import { Messages } from &#x27;./collections/messages&#x27;;
<b>+┊ ┊3┊import { MessageType, Profile } from &#x27;./models&#x27;;</b>
 ┊4┊4┊import { check, Match } from &#x27;meteor/check&#x27;;
 ┊5┊5┊
 ┊6┊6┊const nonEmptyString &#x3D; Match.Where((str) &#x3D;&gt; {
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 9┊ 9┊});
 ┊10┊10┊
 ┊11┊11┊Meteor.methods({
<b>+┊  ┊12┊  updateProfile(profile: Profile): void {</b>
<b>+┊  ┊13┊    if (!this.userId) throw new Meteor.Error(&#x27;unauthorized&#x27;,</b>
<b>+┊  ┊14┊      &#x27;User must be logged-in to create a new chat&#x27;);</b>
<b>+┊  ┊15┊</b>
<b>+┊  ┊16┊    check(profile, {</b>
<b>+┊  ┊17┊      name: nonEmptyString</b>
<b>+┊  ┊18┊    });</b>
<b>+┊  ┊19┊</b>
<b>+┊  ┊20┊    Meteor.users.update(this.userId, {</b>
<b>+┊  ┊21┊      $set: {profile}</b>
<b>+┊  ┊22┊    });</b>
<b>+┊  ┊23┊  },</b>
 ┊12┊24┊  addMessage(type: MessageType, chatId: string, content: string) {
 ┊13┊25┊    check(type, Match.OneOf(String, [ MessageType.TEXT ]));
 ┊14┊26┊    check(chatId, nonEmptyString);
</pre>

[}]: #

## Adjusting the Messaging System

Now that our authentication flow is complete, we will need to edit the messages, so each user can be identified by each message sent. We will add a restriction in the `addMessage` method to see if a user is logged in, and we will bind its ID to the created message:

[{]: <helper> (diffStep 7.29)

#### [Step 7.29: Added restriction on new message method](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/79eac97)

##### Changed api&#x2F;server&#x2F;methods.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊22┊22┊    });
 ┊23┊23┊  },
 ┊24┊24┊  addMessage(type: MessageType, chatId: string, content: string) {
<b>+┊  ┊25┊    if (!this.userId) throw new Meteor.Error(&#x27;unauthorized&#x27;,</b>
<b>+┊  ┊26┊      &#x27;User must be logged-in to create a new chat&#x27;);</b>
<b>+┊  ┊27┊</b>
 ┊25┊28┊    check(type, Match.OneOf(String, [ MessageType.TEXT ]));
 ┊26┊29┊    check(chatId, nonEmptyString);
 ┊27┊30┊    check(content, nonEmptyString);
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊36┊39┊    return {
 ┊37┊40┊      messageId: Messages.collection.insert({
 ┊38┊41┊        chatId: chatId,
<b>+┊  ┊42┊        senderId: this.userId,</b>
 ┊39┊43┊        content: content,
 ┊40┊44┊        createdAt: new Date(),
 ┊41┊45┊        type: type
</pre>

[}]: #

This requires us to update the `Message` model as well so `TypeScript` will recognize the changes:

[{]: <helper> (diffStep "7.30")

#### [Step 7.30: Added senderId property to Message object](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/f12059c)

##### Changed api&#x2F;server&#x2F;models.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊19┊19┊export interface Message {
 ┊20┊20┊  _id?: string;
 ┊21┊21┊  chatId?: string;
<b>+┊  ┊22┊  senderId?: string;</b>
 ┊22┊23┊  content?: string;
 ┊23┊24┊  createdAt?: Date;
 ┊24┊25┊  type?: MessageType
</pre>

[}]: #

Now we can determine if a message is ours or not in the `MessagePage` thanks to the `senderId` field we've just added:

[{]: <helper> (diffStep 7.31)

#### [Step 7.31: Use actual ownership of the message](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/34415c1)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊18┊18┊  message: string &#x3D; &#x27;&#x27;;
 ┊19┊19┊  autoScroller: MutationObserver;
 ┊20┊20┊  scrollOffset &#x3D; 0;
<b>+┊  ┊21┊  senderId: string;</b>
 ┊21┊22┊
 ┊22┊23┊  constructor(
 ┊23┊24┊    navParams: NavParams,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊26┊27┊    this.selectedChat &#x3D; &lt;Chat&gt;navParams.get(&#x27;chat&#x27;);
 ┊27┊28┊    this.title &#x3D; this.selectedChat.title;
 ┊28┊29┊    this.picture &#x3D; this.selectedChat.picture;
<b>+┊  ┊30┊    this.senderId &#x3D; Meteor.userId();</b>
 ┊29┊31┊  }
 ┊30┊32┊
 ┊31┊33┊  private get messagesPageContent(): Element {
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊55┊57┊  }
 ┊56┊58┊
 ┊57┊59┊  findMessagesDayGroups() {
 ┊60┊60┊    return Messages.find({
 ┊61┊61┊      chatId: this.selectedChat._id
 ┊62┊62┊    }, {
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊67┊67┊
 ┊68┊68┊        // Compose missing data that we would like to show in the view
 ┊69┊69┊        messages.forEach((message) &#x3D;&gt; {
<b>+┊  ┊70┊          message.ownership &#x3D; this.senderId &#x3D;&#x3D; message.senderId ? &#x27;mine&#x27; : &#x27;other&#x27;;</b>
 ┊72┊71┊
 ┊73┊72┊          return message;
 ┊74┊73┊        });
</pre>

[}]: #

## Chat Options Menu

Now we're going to add the abilities to log-out and edit our profile as well, which are going to be presented to us using a popover. Let's show a [popover](http://ionicframework.com/docs/v2/components/#popovers) any time we press on the options icon in the top right corner of the chats view.

A popover, just like a page in our app, consists of a component, view, and style:

[{]: <helper> (diffStep 7.32)

#### [Step 7.32: Add chat options component](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/cf21015)

##### Added src&#x2F;pages&#x2F;chats&#x2F;chats-options.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊import { Component, Injectable } from &#x27;@angular/core&#x27;;</b>
<b>+┊  ┊ 2┊import { Alert, AlertController, NavController, ViewController } from &#x27;ionic-angular&#x27;;</b>
<b>+┊  ┊ 3┊import { PhoneService } from &#x27;../../services/phone&#x27;;</b>
<b>+┊  ┊ 4┊import { LoginPage } from &#x27;../login/login&#x27;;</b>
<b>+┊  ┊ 5┊import { ProfilePage } from &#x27;../profile/profile&#x27;;</b>
<b>+┊  ┊ 6┊</b>
<b>+┊  ┊ 7┊@Component({</b>
<b>+┊  ┊ 8┊  selector: &#x27;chats-options&#x27;,</b>
<b>+┊  ┊ 9┊  templateUrl: &#x27;chats-options.html&#x27;</b>
<b>+┊  ┊10┊})</b>
<b>+┊  ┊11┊@Injectable()</b>
<b>+┊  ┊12┊export class ChatsOptionsComponent {</b>
<b>+┊  ┊13┊  constructor(</b>
<b>+┊  ┊14┊    private alertCtrl: AlertController,</b>
<b>+┊  ┊15┊    private navCtrl: NavController,</b>
<b>+┊  ┊16┊    private phoneService: PhoneService,</b>
<b>+┊  ┊17┊    private viewCtrl: ViewController</b>
<b>+┊  ┊18┊  ) {}</b>
<b>+┊  ┊19┊</b>
<b>+┊  ┊20┊  editProfile(): void {</b>
<b>+┊  ┊21┊    this.viewCtrl.dismiss().then(() &#x3D;&gt; {</b>
<b>+┊  ┊22┊      this.navCtrl.push(ProfilePage);</b>
<b>+┊  ┊23┊    });</b>
<b>+┊  ┊24┊  }</b>
<b>+┊  ┊25┊</b>
<b>+┊  ┊26┊  logout(): void {</b>
<b>+┊  ┊27┊    const alert &#x3D; this.alertCtrl.create({</b>
<b>+┊  ┊28┊      title: &#x27;Logout&#x27;,</b>
<b>+┊  ┊29┊      message: &#x27;Are you sure you would like to proceed?&#x27;,</b>
<b>+┊  ┊30┊      buttons: [</b>
<b>+┊  ┊31┊        {</b>
<b>+┊  ┊32┊          text: &#x27;Cancel&#x27;,</b>
<b>+┊  ┊33┊          role: &#x27;cancel&#x27;</b>
<b>+┊  ┊34┊        },</b>
<b>+┊  ┊35┊        {</b>
<b>+┊  ┊36┊          text: &#x27;Yes&#x27;,</b>
<b>+┊  ┊37┊          handler: () &#x3D;&gt; {</b>
<b>+┊  ┊38┊            this.handleLogout(alert);</b>
<b>+┊  ┊39┊            return false;</b>
<b>+┊  ┊40┊          }</b>
<b>+┊  ┊41┊        }</b>
<b>+┊  ┊42┊      ]</b>
<b>+┊  ┊43┊    });</b>
<b>+┊  ┊44┊</b>
<b>+┊  ┊45┊    this.viewCtrl.dismiss().then(() &#x3D;&gt; {</b>
<b>+┊  ┊46┊      alert.present();</b>
<b>+┊  ┊47┊    });</b>
<b>+┊  ┊48┊  }</b>
<b>+┊  ┊49┊</b>
<b>+┊  ┊50┊  handleLogout(alert: Alert): void {</b>
<b>+┊  ┊51┊    alert.dismiss().then(() &#x3D;&gt; {</b>
<b>+┊  ┊52┊      return this.phoneService.logout();</b>
<b>+┊  ┊53┊    })</b>
<b>+┊  ┊54┊    .then(() &#x3D;&gt; {</b>
<b>+┊  ┊55┊      this.navCtrl.setRoot(LoginPage, {}, {</b>
<b>+┊  ┊56┊        animate: true</b>
<b>+┊  ┊57┊      });</b>
<b>+┊  ┊58┊    })</b>
<b>+┊  ┊59┊    .catch((e) &#x3D;&gt; {</b>
<b>+┊  ┊60┊      this.handleError(e);</b>
<b>+┊  ┊61┊    });</b>
<b>+┊  ┊62┊  }</b>
<b>+┊  ┊63┊</b>
<b>+┊  ┊64┊  handleError(e: Error): void {</b>
<b>+┊  ┊65┊    console.error(e);</b>
<b>+┊  ┊66┊</b>
<b>+┊  ┊67┊    const alert &#x3D; this.alertCtrl.create({</b>
<b>+┊  ┊68┊      title: &#x27;Oops!&#x27;,</b>
<b>+┊  ┊69┊      message: e.message,</b>
<b>+┊  ┊70┊      buttons: [&#x27;OK&#x27;]</b>
<b>+┊  ┊71┊    });</b>
<b>+┊  ┊72┊</b>
<b>+┊  ┊73┊    alert.present();</b>
<b>+┊  ┊74┊  }</b>
<b>+┊  ┊75┊}</b>
</pre>

[}]: #

[{]: <helper> (diffStep 7.33)

#### [Step 7.33: Added chats options template](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/b025022)

##### Added src&#x2F;pages&#x2F;chats&#x2F;chats-options.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊&lt;ion-content class&#x3D;&quot;chats-options-page-content&quot;&gt;</b>
<b>+┊  ┊ 2┊  &lt;ion-list class&#x3D;&quot;options&quot;&gt;</b>
<b>+┊  ┊ 3┊    &lt;button ion-item class&#x3D;&quot;option option-profile&quot; (click)&#x3D;&quot;editProfile()&quot;&gt;</b>
<b>+┊  ┊ 4┊      &lt;ion-icon name&#x3D;&quot;contact&quot; class&#x3D;&quot;option-icon&quot;&gt;&lt;/ion-icon&gt;</b>
<b>+┊  ┊ 5┊      &lt;div class&#x3D;&quot;option-name&quot;&gt;Profile&lt;/div&gt;</b>
<b>+┊  ┊ 6┊    &lt;/button&gt;</b>
<b>+┊  ┊ 7┊</b>
<b>+┊  ┊ 8┊    &lt;button ion-item class&#x3D;&quot;option option-logout&quot; (click)&#x3D;&quot;logout()&quot;&gt;</b>
<b>+┊  ┊ 9┊      &lt;ion-icon name&#x3D;&quot;log-out&quot; class&#x3D;&quot;option-icon&quot;&gt;&lt;/ion-icon&gt;</b>
<b>+┊  ┊10┊      &lt;div class&#x3D;&quot;option-name&quot;&gt;Logout&lt;/div&gt;</b>
<b>+┊  ┊11┊    &lt;/button&gt;</b>
<b>+┊  ┊12┊  &lt;/ion-list&gt;</b>
<b>+┊  ┊13┊&lt;/ion-content&gt;</b>
</pre>

[}]: #

[{]: <helper> (diffStep 7.34)

#### [Step 7.34: Added chat options stylesheets](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/f41ccd9)

##### Added src&#x2F;pages&#x2F;chats&#x2F;chats-options.scss
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊  ┊ 1┊.chats-options-page-content {</b>
<b>+┊  ┊ 2┊  .options {</b>
<b>+┊  ┊ 3┊    margin: 0;</b>
<b>+┊  ┊ 4┊  }</b>
<b>+┊  ┊ 5┊</b>
<b>+┊  ┊ 6┊  .option-name {</b>
<b>+┊  ┊ 7┊    float: left;</b>
<b>+┊  ┊ 8┊  }</b>
<b>+┊  ┊ 9┊</b>
<b>+┊  ┊10┊  .option-icon {</b>
<b>+┊  ┊11┊    float: right;</b>
<b>+┊  ┊12┊  }</b>
<b>+┊  ┊13┊}</b>
</pre>

[}]: #

It requires us to import it in the `NgModule` as well:

[{]: <helper> (diffStep 7.35)

#### [Step 7.35: Import chat options](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/7388a2e)

##### Changed src&#x2F;app&#x2F;app.module.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 5┊ 5┊import { StatusBar } from &#x27;@ionic-native/status-bar&#x27;;
 ┊ 6┊ 6┊import { MomentModule } from &#x27;angular2-moment&#x27;;
 ┊ 7┊ 7┊import { ChatsPage } from &#x27;../pages/chats/chats&#x27;;
<b>+┊  ┊ 8┊import { ChatsOptionsComponent } from &#x27;../pages/chats/chats-options&#x27;;</b>
 ┊ 8┊ 9┊import { LoginPage } from &#x27;../pages/login/login&#x27;;
 ┊ 9┊10┊import { MessagesPage } from &#x27;../pages/messages/messages&#x27;;
 ┊10┊11┊import { ProfilePage } from &#x27;../pages/profile/profile&#x27;;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊19┊20┊    MessagesPage,
 ┊20┊21┊    LoginPage,
 ┊21┊22┊    VerificationPage,
<b>+┊  ┊23┊    ProfilePage,</b>
<b>+┊  ┊24┊    ChatsOptionsComponent</b>
 ┊23┊25┊  ],
 ┊24┊26┊  imports: [
 ┊25┊27┊    BrowserModule,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊33┊35┊    MessagesPage,
 ┊34┊36┊    LoginPage,
 ┊35┊37┊    VerificationPage,
<b>+┊  ┊38┊    ProfilePage,</b>
<b>+┊  ┊39┊    ChatsOptionsComponent</b>
 ┊37┊40┊  ],
 ┊38┊41┊  providers: [
 ┊39┊42┊    StatusBar,
</pre>

[}]: #

Now we will implement the method in the `ChatsPage` which will initialize the `ChatsOptionsComponent` using a popover controller:

[{]: <helper> (diffStep 7.36)

#### [Step 7.36: Added showOptions method](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/9a22f4d)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;chats.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 1┊ 1┊import { Component, OnInit } from &#x27;@angular/core&#x27;;
 ┊ 2┊ 2┊import { Chats, Messages } from &#x27;api/collections&#x27;;
 ┊ 3┊ 3┊import { Chat } from &#x27;api/models&#x27;;
<b>+┊  ┊ 4┊import { NavController, PopoverController } from &#x27;ionic-angular&#x27;;</b>
 ┊ 5┊ 5┊import { Observable } from &#x27;rxjs&#x27;;
 ┊ 6┊ 6┊import { MessagesPage } from &#x27;../messages/messages&#x27;;
<b>+┊  ┊ 7┊import { ChatsOptionsComponent } from &#x27;./chats-options&#x27;;</b>
 ┊ 7┊ 8┊
 ┊ 8┊ 9┊@Component({
 ┊ 9┊10┊  templateUrl: &#x27;chats.html&#x27;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊11┊12┊export class ChatsPage implements OnInit {
 ┊12┊13┊  chats;
 ┊13┊14┊
<b>+┊  ┊15┊  constructor(</b>
<b>+┊  ┊16┊    private navCtrl: NavController,</b>
<b>+┊  ┊17┊    private popoverCtrl: PopoverController) {</b>
 ┊15┊18┊  }
 ┊16┊19┊
 ┊17┊20┊  ngOnInit() {
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊40┊43┊    Chats.remove({_id: chat._id}).subscribe(() &#x3D;&gt; {
 ┊41┊44┊    });
 ┊42┊45┊  }
<b>+┊  ┊46┊</b>
<b>+┊  ┊47┊  showOptions(): void {</b>
<b>+┊  ┊48┊    const popover &#x3D; this.popoverCtrl.create(ChatsOptionsComponent, {}, {</b>
<b>+┊  ┊49┊      cssClass: &#x27;options-popover chats-options-popover&#x27;</b>
<b>+┊  ┊50┊    });</b>
<b>+┊  ┊51┊</b>
<b>+┊  ┊52┊    popover.present();</b>
<b>+┊  ┊53┊  }</b>
 ┊43┊54┊}
</pre>

[}]: #

The method is invoked thanks to the following binding in the chats view:

[{]: <helper> (diffStep 7.37)

#### [Step 7.37: Bind click event to showOptions method](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/ed7cf68)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;chats.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 7┊ 7┊      &lt;button ion-button icon-only class&#x3D;&quot;add-chat-button&quot;&gt;
 ┊ 8┊ 8┊        &lt;ion-icon name&#x3D;&quot;person-add&quot;&gt;&lt;/ion-icon&gt;
 ┊ 9┊ 9┊      &lt;/button&gt;
<b>+┊  ┊10┊      &lt;button ion-button icon-only class&#x3D;&quot;options-button&quot; (click)&#x3D;&quot;showOptions()&quot;&gt;</b>
 ┊11┊11┊        &lt;ion-icon name&#x3D;&quot;more&quot;&gt;&lt;/ion-icon&gt;
 ┊12┊12┊      &lt;/button&gt;
 ┊13┊13┊    &lt;/ion-buttons&gt;
</pre>

[}]: #

As for now, once you click on the options icon in the chats view, the popover should appear in the middle of the screen. To fix it, we gonna add the extend our app's main stylesheet, since it can be potentially used as a component not just in the `ChatsPage`, but also in other pages as well:

[{]: <helper> (diffStep 7.38)

#### [Step 7.38: Added chat options popover stylesheet](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/91831c3)

##### Changed src&#x2F;app&#x2F;app.scss
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊14┊14┊// To declare rules for a specific mode, create a child rule
 ┊15┊15┊// for the .md, .ios, or .wp mode classes. The mode class is
 ┊16┊16┊// automatically applied to the &lt;body&gt; element in the app.
<b>+┊  ┊17┊</b>
<b>+┊  ┊18┊// Options Popover Component</b>
<b>+┊  ┊19┊// --------------------------------------------------</b>
<b>+┊  ┊20┊</b>
<b>+┊  ┊21┊$options-popover-width: 200px;</b>
<b>+┊  ┊22┊$options-popover-margin: 5px;</b>
<b>+┊  ┊23┊</b>
<b>+┊  ┊24┊.options-popover .popover-content {</b>
<b>+┊  ┊25┊  width: $options-popover-width;</b>
<b>+┊  ┊26┊  transform-origin: right top 0px !important;</b>
<b>+┊  ┊27┊  left: calc(100% - #{$options-popover-width} - #{$options-popover-margin}) !important;</b>
<b>+┊  ┊28┊  top: $options-popover-margin !important;</b>
<b>+┊  ┊29┊}</b>
</pre>

[}]: #

[{]: <helper> (navStep nextRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/chats-mutations" prevRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/messages-page")

⟸ <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/messages-page">PREVIOUS STEP</a> <b>║</b> <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/chats-mutations">NEXT STEP</a> ⟹

[}]: #

