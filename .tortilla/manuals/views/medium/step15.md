# Step 15: Addressbook integration

In this step we are going to implement native address book integration, to automatically show only the users whose numbers are present in our address book.

`Ionic 2` is provided by default with a `Cordova` plug-in called `cordova-plugin-contacts`, which allows us to retrieve the contacts from the address book.

Let's start by installing the `Contacts` `Cordova` plug-in:

    $ ionic cordova plugin add cordova-plugin-contacts --save
    $ npm install --save @ionic-native/contacts

Then let's add it to `app.module.ts`:

[{]: <helper> (diffStep 15.2)

#### [Step 15.2: Add Contacts to app.module.ts](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/cd96f5b)

##### Changed src&#x2F;app&#x2F;app.module.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 9┊ 9┊import { SmsReceiver } from &quot;../ionic/sms-receiver&quot;;
 ┊10┊10┊import { Camera } from &#x27;@ionic-native/camera&#x27;;
 ┊11┊11┊import { Crop } from &#x27;@ionic-native/crop&#x27;;
<b>+┊  ┊12┊import { Contacts } from &quot;@ionic-native/contacts&quot;;</b>
 ┊12┊13┊import { AgmCoreModule } from &#x27;@agm/core&#x27;;
 ┊13┊14┊import { MomentModule } from &#x27;angular2-moment&#x27;;
 ┊14┊15┊import { ChatsPage } from &#x27;../pages/chats/chats&#x27;;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊75┊76┊    Sim,
 ┊76┊77┊    SmsReceiver,
 ┊77┊78┊    Camera,
<b>+┊  ┊79┊    Crop,</b>
<b>+┊  ┊80┊    Contacts</b>
 ┊79┊81┊  ]
 ┊80┊82┊})
 ┊81┊83┊export class AppModule {}
</pre>

[}]: #

Since we're going to use `Sets` in our code, we will have to set the `Typescript` target to `es6` or enable `downlevelIteration`:

[{]: <helper> (diffStep 15.3)

#### [Step 15.3: We need to set downlevelIteration or target es6 in order to use Sets](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/434a257)

##### Changed tsconfig.json
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 5┊ 5┊    &quot;declaration&quot;: false,
 ┊ 6┊ 6┊    &quot;emitDecoratorMetadata&quot;: true,
 ┊ 7┊ 7┊    &quot;experimentalDecorators&quot;: true,
<b>+┊  ┊ 8┊    &quot;downlevelIteration&quot;: true,</b>
 ┊ 8┊ 9┊    &quot;lib&quot;: [
 ┊ 9┊10┊      &quot;dom&quot;,
 ┊10┊11┊      &quot;es2015&quot;,
</pre>

[}]: #

Now we can create the appropriate handler in the `PhoneService`, we will use it inside the `NewChatPage`:

[{]: <helper> (diffStep 15.4)

#### [Step 15.4: Implement getContactsFromAddressbook in the phone service](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/d9c6686)

##### Changed src&#x2F;services&#x2F;phone.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊3┊3┊import { Meteor } from &#x27;meteor/meteor&#x27;;
 ┊4┊4┊import { Platform } from &#x27;ionic-angular&#x27;;
 ┊5┊5┊import { Sim } from &#x27;@ionic-native/sim&#x27;;
<b>+┊ ┊6┊import { Contact, ContactFieldType, Contacts, IContactField, IContactFindOptions } from &quot;@ionic-native/contacts&quot;;</b>
 ┊6┊7┊import { SmsReceiver } from &quot;../ionic/sms-receiver&quot;;
 ┊7┊8┊import * as Bluebird from &quot;bluebird&quot;;
 ┊8┊9┊import { TWILIO_SMS_NUMBERS } from &quot;api/models&quot;;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊12┊13┊export class PhoneService {
 ┊13┊14┊  constructor(private platform: Platform,
 ┊14┊15┊              private sim: Sim,
<b>+┊  ┊16┊              private smsReceiver: SmsReceiver,</b>
<b>+┊  ┊17┊              private contacts: Contacts) {</b>
 ┊16┊18┊    Bluebird.promisifyAll(this.smsReceiver);
 ┊17┊19┊  }
 ┊18┊20┊
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 64┊ 66┊    }
 ┊ 65┊ 67┊  }
 ┊ 66┊ 68┊
<b>+┊   ┊ 69┊  getContactsFromAddressbook(): Promise&lt;string[]&gt; {</b>
<b>+┊   ┊ 70┊    const getContacts &#x3D; (): Promise&lt;Contact[]&gt; &#x3D;&gt; {</b>
<b>+┊   ┊ 71┊      if (!this.platform.is(&#x27;cordova&#x27;)) {</b>
<b>+┊   ┊ 72┊        return Promise.reject(new Error(&#x27;Cannot get contacts: not cordova.&#x27;));</b>
<b>+┊   ┊ 73┊      }</b>
<b>+┊   ┊ 74┊</b>
<b>+┊   ┊ 75┊      const fields: ContactFieldType[] &#x3D; [&quot;phoneNumbers&quot;];</b>
<b>+┊   ┊ 76┊      const options: IContactFindOptions &#x3D; {</b>
<b>+┊   ┊ 77┊        filter: &quot;&quot;,</b>
<b>+┊   ┊ 78┊        multiple: true,</b>
<b>+┊   ┊ 79┊        desiredFields: [&quot;phoneNumbers&quot;],</b>
<b>+┊   ┊ 80┊        hasPhoneNumber: true</b>
<b>+┊   ┊ 81┊      };</b>
<b>+┊   ┊ 82┊      return this.contacts.find(fields, options);</b>
<b>+┊   ┊ 83┊    };</b>
<b>+┊   ┊ 84┊</b>
<b>+┊   ┊ 85┊    const cleanPhoneNumber &#x3D; (phoneNumber: string): string &#x3D;&gt; {</b>
<b>+┊   ┊ 86┊      const phoneNumberNoSpaces: string &#x3D; phoneNumber.replace(/ /g, &#x27;&#x27;);</b>
<b>+┊   ┊ 87┊</b>
<b>+┊   ┊ 88┊      if (phoneNumberNoSpaces.charAt(0) &#x3D;&#x3D;&#x3D; &#x27;+&#x27;) {</b>
<b>+┊   ┊ 89┊        return phoneNumberNoSpaces;</b>
<b>+┊   ┊ 90┊      } else if (phoneNumberNoSpaces.substring(0, 2) &#x3D;&#x3D;&#x3D; &quot;00&quot;) {</b>
<b>+┊   ┊ 91┊        return &#x27;+&#x27; + phoneNumberNoSpaces.slice(2);</b>
<b>+┊   ┊ 92┊      } else {</b>
<b>+┊   ┊ 93┊        // Use user&#x27;s international prefix when absent</b>
<b>+┊   ┊ 94┊        // FIXME: update meteor-accounts-phone typings</b>
<b>+┊   ┊ 95┊        const prefix: string &#x3D; (&lt;any&gt;Meteor.user()).phone.number.substring(0, 3);</b>
<b>+┊   ┊ 96┊</b>
<b>+┊   ┊ 97┊        return prefix + phoneNumberNoSpaces;</b>
<b>+┊   ┊ 98┊      }</b>
<b>+┊   ┊ 99┊    };</b>
<b>+┊   ┊100┊</b>
<b>+┊   ┊101┊    return new Promise((resolve, reject) &#x3D;&gt; {</b>
<b>+┊   ┊102┊      getContacts()</b>
<b>+┊   ┊103┊        .then((contacts: Contact[]) &#x3D;&gt; {</b>
<b>+┊   ┊104┊          const arrayOfArrays: string[][] &#x3D; contacts</b>
<b>+┊   ┊105┊            .map((contact: Contact) &#x3D;&gt; {</b>
<b>+┊   ┊106┊              return contact.phoneNumbers</b>
<b>+┊   ┊107┊                .filter((phoneNumber: IContactField) &#x3D;&gt; {</b>
<b>+┊   ┊108┊                  return phoneNumber.type &#x3D;&#x3D;&#x3D; &quot;mobile&quot;;</b>
<b>+┊   ┊109┊                }).map((phoneNumber: IContactField) &#x3D;&gt; {</b>
<b>+┊   ┊110┊                  return cleanPhoneNumber(phoneNumber.value);</b>
<b>+┊   ┊111┊                }).filter((phoneNumber: string) &#x3D;&gt; {</b>
<b>+┊   ┊112┊                  return phoneNumber.slice(1).match(/^[0-9]+$/) &amp;&amp; phoneNumber.length &gt;&#x3D; 8;</b>
<b>+┊   ┊113┊                });</b>
<b>+┊   ┊114┊            });</b>
<b>+┊   ┊115┊          const flattenedArray: string[] &#x3D; [].concat(...arrayOfArrays);</b>
<b>+┊   ┊116┊          const uniqueArray: string[] &#x3D; [...new Set(flattenedArray)];</b>
<b>+┊   ┊117┊          resolve(uniqueArray);</b>
<b>+┊   ┊118┊        })</b>
<b>+┊   ┊119┊        .catch((e: Error) &#x3D;&gt; {</b>
<b>+┊   ┊120┊          reject(e);</b>
<b>+┊   ┊121┊        });</b>
<b>+┊   ┊122┊    });</b>
<b>+┊   ┊123┊  }</b>
<b>+┊   ┊124┊</b>
 ┊ 67┊125┊  verify(phoneNumber: string): Promise&lt;void&gt; {
 ┊ 68┊126┊    return new Promise&lt;void&gt;((resolve, reject) &#x3D;&gt; {
 ┊ 69┊127┊      Accounts.requestPhoneVerification(phoneNumber, (e: Error) &#x3D;&gt; {
</pre>

[}]: #

[{]: <helper> (diffStep 15.5)

#### [Step 15.5: Use getContactsFromAddressbook in new-chat.ts](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/5b3b396)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;new-chat.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 5┊ 5┊import { MeteorObservable } from &#x27;meteor-rxjs&#x27;;
 ┊ 6┊ 6┊import { _ } from &#x27;meteor/underscore&#x27;;
 ┊ 7┊ 7┊import { Observable, Subscription, BehaviorSubject } from &#x27;rxjs&#x27;;
<b>+┊  ┊ 8┊import { PhoneService } from &quot;../../services/phone&quot;;</b>
 ┊ 8┊ 9┊
 ┊ 9┊10┊@Component({
 ┊10┊11┊  selector: &#x27;new-chat&#x27;,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊15┊16┊  senderId: string;
 ┊16┊17┊  users: Observable&lt;User[]&gt;;
 ┊17┊18┊  usersSubscription: Subscription;
<b>+┊  ┊19┊  contacts: string[] &#x3D; [];</b>
<b>+┊  ┊20┊  contactsPromise: Promise&lt;void&gt;;</b>
 ┊18┊21┊
 ┊19┊22┊  constructor(
 ┊20┊23┊    private alertCtrl: AlertController,
 ┊21┊24┊    private viewCtrl: ViewController,
<b>+┊  ┊25┊    private platform: Platform,</b>
<b>+┊  ┊26┊    private phoneService: PhoneService</b>
 ┊23┊27┊  ) {
 ┊24┊28┊    this.senderId &#x3D; Meteor.userId();
 ┊25┊29┊    this.searchPattern &#x3D; new BehaviorSubject(undefined);
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊27┊31┊
 ┊28┊32┊  ngOnInit() {
 ┊29┊33┊    this.observeSearchBar();
<b>+┊  ┊34┊    this.contactsPromise &#x3D; this.phoneService.getContactsFromAddressbook()</b>
<b>+┊  ┊35┊      .then((phoneNumbers: string[]) &#x3D;&gt; {</b>
<b>+┊  ┊36┊        this.contacts &#x3D; phoneNumbers;</b>
<b>+┊  ┊37┊      })</b>
<b>+┊  ┊38┊      .catch((e: Error) &#x3D;&gt; {</b>
<b>+┊  ┊39┊        console.error(e.message);</b>
<b>+┊  ┊40┊      });</b>
 ┊30┊41┊  }
 ┊31┊42┊
 ┊32┊43┊  updateSubscription(newValue) {
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊42┊53┊          this.usersSubscription.unsubscribe();
 ┊43┊54┊        }
 ┊44┊55┊
<b>+┊  ┊56┊        this.contactsPromise.then(() &#x3D;&gt; {</b>
<b>+┊  ┊57┊          this.usersSubscription &#x3D; this.subscribeUsers();</b>
<b>+┊  ┊58┊        });</b>
 ┊46┊59┊      });
 ┊47┊60┊  }
 ┊48┊61┊
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊61┊74┊
 ┊62┊75┊  subscribeUsers(): Subscription {
 ┊63┊76┊    // Fetch all users matching search pattern
<b>+┊  ┊77┊    const subscription &#x3D; MeteorObservable.subscribe(&#x27;users&#x27;, this.searchPattern.getValue(), this.contacts);</b>
 ┊65┊78┊    const autorun &#x3D; MeteorObservable.autorun();
 ┊66┊79┊
 ┊67┊80┊    return Observable.merge(subscription, autorun).subscribe(() &#x3D;&gt; {
</pre>

[}]: #

We will have to update the `users` publication to filter our results:

[{]: <helper> (diffStep 15.6)

#### [Step 15.6: Update users publication to handle addressbook contacts](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/f451653)

##### Changed api&#x2F;server&#x2F;publications.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 5┊ 5┊import { Pictures } from &#x27;./collections/pictures&#x27;;
 ┊ 6┊ 6┊
 ┊ 7┊ 7┊Meteor.publishComposite(&#x27;users&#x27;, function(
<b>+┊  ┊ 8┊  pattern: string,</b>
<b>+┊  ┊ 9┊  contacts: string[]</b>
 ┊ 9┊10┊): PublishCompositeConfig&lt;User&gt; {
 ┊10┊11┊  if (!this.userId) {
 ┊11┊12┊    return;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊15┊16┊
 ┊16┊17┊  if (pattern) {
 ┊17┊18┊    selector &#x3D; {
<b>+┊  ┊19┊      &#x27;profile.name&#x27;: { $regex: pattern, $options: &#x27;i&#x27; },</b>
<b>+┊  ┊20┊      &#x27;phone.number&#x27;: {$in: contacts}</b>
 ┊19┊21┊    };
<b>+┊  ┊22┊  } else {</b>
<b>+┊  ┊23┊    selector &#x3D; {&#x27;phone.number&#x27;: {$in: contacts}}</b>
 ┊20┊24┊  }
 ┊21┊25┊
 ┊22┊26┊  return {
</pre>

[}]: #

Since they are now useless, we can finally remove our fake users from the db initialization:

[{]: <helper> (diffStep 15.7)

#### [Step 15.7: Removing db initialization in main.ts](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/0b81ae1)

##### Changed api&#x2F;server&#x2F;main.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 1┊ 1┊import { Meteor } from &#x27;meteor/meteor&#x27;;
 ┊ 3┊ 2┊import { Accounts } from &#x27;meteor/accounts-base&#x27;;
 ┊ 5┊ 3┊
 ┊ 6┊ 4┊Meteor.startup(() &#x3D;&gt; {
 ┊ 7┊ 5┊  if (Meteor.settings) {
 ┊ 8┊ 6┊    Object.assign(Accounts._options, Meteor.settings[&#x27;accounts-phone&#x27;]);
 ┊ 9┊ 7┊    SMS.twilio &#x3D; Meteor.settings[&#x27;twilio&#x27;];
 ┊10┊ 8┊  }
 ┊80┊ 9┊});
</pre>

[}]: #

Obviously we will have to reset the database to see any effect:

    $ npm run api:reset

To test if everything works properly I suggest to create a test user on your PC using a phone number which is already present in your phone's address book.

[{]: <helper> (navStep nextRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/push-notifications" prevRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/native-mobile")

⟸ <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/native-mobile">PREVIOUS STEP</a> <b>║</b> <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/push-notifications">NEXT STEP</a> ⟹

[}]: #

