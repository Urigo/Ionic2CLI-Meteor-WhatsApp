# Step 15: Addressbook integration

In this step we are going to implement native address book integration, to automatically show only the users whose numbers are present in our address book.

`Ionic 2` is provided by default with a `Cordova` plug-in called `cordova-plugin-contacts`, which allows us to retrieve the contacts from the address book.

Let's start by installing the `Contacts` `Cordova` plug-in:

    $ ionic cordova plugin add cordova-plugin-contacts --save
    $ npm install --save @ionic-native/contacts

Then let's add it to `app.module.ts`:

[{]: <helper> (diffStep "15.2")

#### [Step 15.2: Add Contacts to app.module.ts](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/cd5bc153)

##### Changed src&#x2F;app&#x2F;app.module.ts
```diff
@@ -9,6 +9,7 @@
 ┊ 9┊ 9┊import { SmsReceiver } from "../ionic/sms-receiver";
 ┊10┊10┊import { Camera } from '@ionic-native/camera';
 ┊11┊11┊import { Crop } from '@ionic-native/crop';
+┊  ┊12┊import { Contacts } from "@ionic-native/contacts";
 ┊12┊13┊import { AgmCoreModule } from '@agm/core';
 ┊13┊14┊import { MomentModule } from 'angular2-moment';
 ┊14┊15┊import { ChatsPage } from '../pages/chats/chats';
```
```diff
@@ -75,7 +76,8 @@
 ┊75┊76┊    Sim,
 ┊76┊77┊    SmsReceiver,
 ┊77┊78┊    Camera,
-┊78┊  ┊    Crop
+┊  ┊79┊    Crop,
+┊  ┊80┊    Contacts
 ┊79┊81┊  ]
 ┊80┊82┊})
 ┊81┊83┊export class AppModule {}
```

[}]: #

Since we're going to use `Sets` in our code, we will have to set the `Typescript` target to `es6` or enable `downlevelIteration`:

[{]: <helper> (diffStep "15.3")

#### [Step 15.3: We need to set downlevelIteration or target es6 in order to use Sets](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/a953d706)

##### Changed tsconfig.json
```diff
@@ -5,6 +5,7 @@
 ┊ 5┊ 5┊    "declaration": false,
 ┊ 6┊ 6┊    "emitDecoratorMetadata": true,
 ┊ 7┊ 7┊    "experimentalDecorators": true,
+┊  ┊ 8┊    "downlevelIteration": true,
 ┊ 8┊ 9┊    "lib": [
 ┊ 9┊10┊      "dom",
 ┊10┊11┊      "es2015",
```

[}]: #

Now we can create the appropriate handler in the `PhoneService`, we will use it inside the `NewChatPage`:

[{]: <helper> (diffStep "15.4")

#### [Step 15.4: Implement getContactsFromAddressbook in the phone service](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/eae8c9a5)

##### Changed src&#x2F;services&#x2F;phone.ts
```diff
@@ -3,6 +3,7 @@
 ┊3┊3┊import { Meteor } from 'meteor/meteor';
 ┊4┊4┊import { Platform } from 'ionic-angular';
 ┊5┊5┊import { Sim } from '@ionic-native/sim';
+┊ ┊6┊import { Contact, ContactFieldType, Contacts, IContactField, IContactFindOptions } from "@ionic-native/contacts";
 ┊6┊7┊import { SmsReceiver } from "../ionic/sms-receiver";
 ┊7┊8┊import * as Bluebird from "bluebird";
 ┊8┊9┊import { TWILIO_SMS_NUMBERS } from "api/models";
```
```diff
@@ -12,7 +13,8 @@
 ┊12┊13┊export class PhoneService {
 ┊13┊14┊  constructor(private platform: Platform,
 ┊14┊15┊              private sim: Sim,
-┊15┊  ┊              private smsReceiver: SmsReceiver) {
+┊  ┊16┊              private smsReceiver: SmsReceiver,
+┊  ┊17┊              private contacts: Contacts) {
 ┊16┊18┊    Bluebird.promisifyAll(this.smsReceiver);
 ┊17┊19┊  }
 ┊18┊20┊
```
```diff
@@ -64,6 +66,62 @@
 ┊ 64┊ 66┊    }
 ┊ 65┊ 67┊  }
 ┊ 66┊ 68┊
+┊   ┊ 69┊  getContactsFromAddressbook(): Promise<string[]> {
+┊   ┊ 70┊    const getContacts = (): Promise<Contact[]> => {
+┊   ┊ 71┊      if (!this.platform.is('cordova')) {
+┊   ┊ 72┊        return Promise.reject(new Error('Cannot get contacts: not cordova.'));
+┊   ┊ 73┊      }
+┊   ┊ 74┊
+┊   ┊ 75┊      const fields: ContactFieldType[] = ["phoneNumbers"];
+┊   ┊ 76┊      const options: IContactFindOptions = {
+┊   ┊ 77┊        filter: "",
+┊   ┊ 78┊        multiple: true,
+┊   ┊ 79┊        desiredFields: ["phoneNumbers"],
+┊   ┊ 80┊        hasPhoneNumber: true
+┊   ┊ 81┊      };
+┊   ┊ 82┊      return this.contacts.find(fields, options);
+┊   ┊ 83┊    };
+┊   ┊ 84┊
+┊   ┊ 85┊    const cleanPhoneNumber = (phoneNumber: string): string => {
+┊   ┊ 86┊      const phoneNumberNoSpaces: string = phoneNumber.replace(/ /g, '');
+┊   ┊ 87┊
+┊   ┊ 88┊      if (phoneNumberNoSpaces.charAt(0) === '+') {
+┊   ┊ 89┊        return phoneNumberNoSpaces;
+┊   ┊ 90┊      } else if (phoneNumberNoSpaces.substring(0, 2) === "00") {
+┊   ┊ 91┊        return '+' + phoneNumberNoSpaces.slice(2);
+┊   ┊ 92┊      } else {
+┊   ┊ 93┊        // Use user's international prefix when absent
+┊   ┊ 94┊        // FIXME: update meteor-accounts-phone typings
+┊   ┊ 95┊        const prefix: string = (<any>Meteor.user()).phone.number.substring(0, 3);
+┊   ┊ 96┊
+┊   ┊ 97┊        return prefix + phoneNumberNoSpaces;
+┊   ┊ 98┊      }
+┊   ┊ 99┊    };
+┊   ┊100┊
+┊   ┊101┊    return new Promise((resolve, reject) => {
+┊   ┊102┊      getContacts()
+┊   ┊103┊        .then((contacts: Contact[]) => {
+┊   ┊104┊          const arrayOfArrays: string[][] = contacts
+┊   ┊105┊            .map((contact: Contact) => {
+┊   ┊106┊              return contact.phoneNumbers
+┊   ┊107┊                .filter((phoneNumber: IContactField) => {
+┊   ┊108┊                  return phoneNumber.type === "mobile";
+┊   ┊109┊                }).map((phoneNumber: IContactField) => {
+┊   ┊110┊                  return cleanPhoneNumber(phoneNumber.value);
+┊   ┊111┊                }).filter((phoneNumber: string) => {
+┊   ┊112┊                  return phoneNumber.slice(1).match(/^[0-9]+$/) && phoneNumber.length >= 8;
+┊   ┊113┊                });
+┊   ┊114┊            });
+┊   ┊115┊          const flattenedArray: string[] = [].concat(...arrayOfArrays);
+┊   ┊116┊          const uniqueArray: string[] = [...new Set(flattenedArray)];
+┊   ┊117┊          resolve(uniqueArray);
+┊   ┊118┊        })
+┊   ┊119┊        .catch((e: Error) => {
+┊   ┊120┊          reject(e);
+┊   ┊121┊        });
+┊   ┊122┊    });
+┊   ┊123┊  }
+┊   ┊124┊
 ┊ 67┊125┊  verify(phoneNumber: string): Promise<void> {
 ┊ 68┊126┊    return new Promise<void>((resolve, reject) => {
 ┊ 69┊127┊      Accounts.requestPhoneVerification(phoneNumber, (e: Error) => {
```

[}]: #

[{]: <helper> (diffStep "15.5")

#### [Step 15.5: Use getContactsFromAddressbook in new-chat.ts](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/46857408)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;new-chat.ts
```diff
@@ -5,6 +5,7 @@
 ┊ 5┊ 5┊import { MeteorObservable } from 'meteor-rxjs';
 ┊ 6┊ 6┊import * as _ from 'lodash';
 ┊ 7┊ 7┊import { Observable, Subscription, BehaviorSubject } from 'rxjs';
+┊  ┊ 8┊import { PhoneService } from "../../services/phone";
 ┊ 8┊ 9┊
 ┊ 9┊10┊@Component({
 ┊10┊11┊  selector: 'new-chat',
```
```diff
@@ -15,11 +16,14 @@
 ┊15┊16┊  senderId: string;
 ┊16┊17┊  users: Observable<User[]>;
 ┊17┊18┊  usersSubscription: Subscription;
+┊  ┊19┊  contacts: string[] = [];
+┊  ┊20┊  contactsPromise: Promise<void>;
 ┊18┊21┊
 ┊19┊22┊  constructor(
 ┊20┊23┊    private alertCtrl: AlertController,
 ┊21┊24┊    private viewCtrl: ViewController,
-┊22┊  ┊    private platform: Platform
+┊  ┊25┊    private platform: Platform,
+┊  ┊26┊    private phoneService: PhoneService
 ┊23┊27┊  ) {
 ┊24┊28┊    this.senderId = Meteor.userId();
 ┊25┊29┊    this.searchPattern = new BehaviorSubject(undefined);
```
```diff
@@ -27,6 +31,13 @@
 ┊27┊31┊
 ┊28┊32┊  ngOnInit() {
 ┊29┊33┊    this.observeSearchBar();
+┊  ┊34┊    this.contactsPromise = this.phoneService.getContactsFromAddressbook()
+┊  ┊35┊      .then((phoneNumbers: string[]) => {
+┊  ┊36┊        this.contacts = phoneNumbers;
+┊  ┊37┊      })
+┊  ┊38┊      .catch((e: Error) => {
+┊  ┊39┊        console.error(e.message);
+┊  ┊40┊      });
 ┊30┊41┊  }
 ┊31┊42┊
 ┊32┊43┊  updateSubscription(newValue) {
```
```diff
@@ -42,7 +53,9 @@
 ┊42┊53┊          this.usersSubscription.unsubscribe();
 ┊43┊54┊        }
 ┊44┊55┊
-┊45┊  ┊        this.usersSubscription = this.subscribeUsers();
+┊  ┊56┊        this.contactsPromise.then(() => {
+┊  ┊57┊          this.usersSubscription = this.subscribeUsers();
+┊  ┊58┊        });
 ┊46┊59┊      });
 ┊47┊60┊  }
 ┊48┊61┊
```
```diff
@@ -61,7 +74,7 @@
 ┊61┊74┊
 ┊62┊75┊  subscribeUsers(): Subscription {
 ┊63┊76┊    // Fetch all users matching search pattern
-┊64┊  ┊    const subscription = MeteorObservable.subscribe('users', this.searchPattern.getValue());
+┊  ┊77┊    const subscription = MeteorObservable.subscribe('users', this.searchPattern.getValue(), this.contacts);
 ┊65┊78┊    const autorun = MeteorObservable.autorun();
 ┊66┊79┊
 ┊67┊80┊    return Observable.merge(subscription, autorun).subscribe(() => {
```

[}]: #

We will have to update the `users` publication to filter our results:

[{]: <helper> (diffStep "15.6")

#### [Step 15.6: Update users publication to handle addressbook contacts](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/3c6d0222)

##### Changed api&#x2F;server&#x2F;publications.ts
```diff
@@ -5,7 +5,8 @@
 ┊ 5┊ 5┊import { Pictures } from './collections/pictures';
 ┊ 6┊ 6┊
 ┊ 7┊ 7┊Meteor.publishComposite('users', function(
-┊ 8┊  ┊  pattern: string
+┊  ┊ 8┊  pattern: string,
+┊  ┊ 9┊  contacts: string[]
 ┊ 9┊10┊): PublishCompositeConfig<User> {
 ┊10┊11┊  if (!this.userId) {
 ┊11┊12┊    return;
```
```diff
@@ -15,8 +16,11 @@
 ┊15┊16┊
 ┊16┊17┊  if (pattern) {
 ┊17┊18┊    selector = {
-┊18┊  ┊      'profile.name': { $regex: pattern, $options: 'i' }
+┊  ┊19┊      'profile.name': { $regex: pattern, $options: 'i' },
+┊  ┊20┊      'phone.number': {$in: contacts}
 ┊19┊21┊    };
+┊  ┊22┊  } else {
+┊  ┊23┊    selector = {'phone.number': {$in: contacts}}
 ┊20┊24┊  }
 ┊21┊25┊
 ┊22┊26┊  return {
```

[}]: #

Since they are now useless, we can finally remove our fake users from the db initialization:

[{]: <helper> (diffStep "15.7")

#### [Step 15.7: Removing db initialization in main.ts](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/794c94cd)

##### Changed api&#x2F;server&#x2F;main.ts
```diff
@@ -1,86 +1,9 @@
 ┊ 1┊ 1┊import { Meteor } from 'meteor/meteor';
-┊ 2┊  ┊import { Picture } from './models';
 ┊ 3┊ 2┊import { Accounts } from 'meteor/accounts-base';
-┊ 4┊  ┊import { Users } from './collections/users';
 ┊ 5┊ 3┊
 ┊ 6┊ 4┊Meteor.startup(() => {
 ┊ 7┊ 5┊  if (Meteor.settings) {
 ┊ 8┊ 6┊    Object.assign(Accounts._options, Meteor.settings['accounts-phone']);
 ┊ 9┊ 7┊    SMS.twilio = Meteor.settings['twilio'];
 ┊10┊ 8┊  }
-┊11┊  ┊
-┊12┊  ┊  if (Users.collection.find().count() > 0) {
-┊13┊  ┊    return;
-┊14┊  ┊  }
-┊15┊  ┊
-┊16┊  ┊  let picture = importPictureFromUrl({
-┊17┊  ┊    name: 'man1.jpg',
-┊18┊  ┊    url: 'https://randomuser.me/api/portraits/men/1.jpg'
-┊19┊  ┊  });
-┊20┊  ┊
-┊21┊  ┊  Accounts.createUserWithPhone({
-┊22┊  ┊    phone: '+972540000001',
-┊23┊  ┊    profile: {
-┊24┊  ┊      name: 'Ethan Gonzalez',
-┊25┊  ┊      pictureId: picture._id
-┊26┊  ┊    }
-┊27┊  ┊  });
-┊28┊  ┊
-┊29┊  ┊  picture = importPictureFromUrl({
-┊30┊  ┊    name: 'lego1.jpg',
-┊31┊  ┊    url: 'https://randomuser.me/api/portraits/lego/1.jpg'
-┊32┊  ┊  });
-┊33┊  ┊
-┊34┊  ┊  Accounts.createUserWithPhone({
-┊35┊  ┊    phone: '+972540000002',
-┊36┊  ┊    profile: {
-┊37┊  ┊      name: 'Bryan Wallace',
-┊38┊  ┊      pictureId: picture._id
-┊39┊  ┊    }
-┊40┊  ┊  });
-┊41┊  ┊
-┊42┊  ┊  picture = importPictureFromUrl({
-┊43┊  ┊    name: 'woman1.jpg',
-┊44┊  ┊    url: 'https://randomuser.me/api/portraits/women/1.jpg'
-┊45┊  ┊  });
-┊46┊  ┊
-┊47┊  ┊  Accounts.createUserWithPhone({
-┊48┊  ┊    phone: '+972540000003',
-┊49┊  ┊    profile: {
-┊50┊  ┊      name: 'Avery Stewart',
-┊51┊  ┊      pictureId: picture._id
-┊52┊  ┊    }
-┊53┊  ┊  });
-┊54┊  ┊
-┊55┊  ┊  picture = importPictureFromUrl({
-┊56┊  ┊    name: 'woman2.jpg',
-┊57┊  ┊    url: 'https://randomuser.me/api/portraits/women/2.jpg'
-┊58┊  ┊  });
-┊59┊  ┊
-┊60┊  ┊  Accounts.createUserWithPhone({
-┊61┊  ┊    phone: '+972540000004',
-┊62┊  ┊    profile: {
-┊63┊  ┊      name: 'Katie Peterson',
-┊64┊  ┊      pictureId: picture._id
-┊65┊  ┊    }
-┊66┊  ┊  });
-┊67┊  ┊
-┊68┊  ┊  picture = importPictureFromUrl({
-┊69┊  ┊    name: 'man2.jpg',
-┊70┊  ┊    url: 'https://randomuser.me/api/portraits/men/2.jpg'
-┊71┊  ┊  });
-┊72┊  ┊
-┊73┊  ┊  Accounts.createUserWithPhone({
-┊74┊  ┊    phone: '+972540000005',
-┊75┊  ┊    profile: {
-┊76┊  ┊      name: 'Ray Edwards',
-┊77┊  ┊      pictureId: picture._id
-┊78┊  ┊    }
-┊79┊  ┊  });
 ┊80┊ 9┊});
-┊81┊  ┊
-┊82┊  ┊function importPictureFromUrl(options: { name: string, url: string }): Picture {
-┊83┊  ┊  const description = { name: options.name };
-┊84┊  ┊
-┊85┊  ┊  return Meteor.call('ufsImportURL', options.url, description, 'pictures');
-┊86┊  ┊}
```

[}]: #

Obviously we will have to reset the database to see any effect:

    $ npm run api:reset

To test if everything works properly I suggest to create a test user on your PC using a phone number which is already present in your phone's address book.

Let's re-add our fake users and whitelist them in the `users` publication for the moment:

[{]: <helper> (diffStep "15.8")

#### [Step 15.8: Re-add fake users and whitelist them in the publication](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/c2dceafe)

##### Changed api&#x2F;server&#x2F;main.ts
```diff
@@ -1,9 +1,86 @@
 ┊ 1┊ 1┊import { Meteor } from 'meteor/meteor';
+┊  ┊ 2┊import { Picture } from './models';
 ┊ 2┊ 3┊import { Accounts } from 'meteor/accounts-base';
+┊  ┊ 4┊import { Users } from './collections/users';
 ┊ 3┊ 5┊
 ┊ 4┊ 6┊Meteor.startup(() => {
 ┊ 5┊ 7┊  if (Meteor.settings) {
 ┊ 6┊ 8┊    Object.assign(Accounts._options, Meteor.settings['accounts-phone']);
 ┊ 7┊ 9┊    SMS.twilio = Meteor.settings['twilio'];
 ┊ 8┊10┊  }
+┊  ┊11┊
+┊  ┊12┊  if (Users.collection.find().count() > 0) {
+┊  ┊13┊    return;
+┊  ┊14┊  }
+┊  ┊15┊
+┊  ┊16┊  let picture = importPictureFromUrl({
+┊  ┊17┊    name: 'man1.jpg',
+┊  ┊18┊    url: 'https://randomuser.me/api/portraits/men/1.jpg'
+┊  ┊19┊  });
+┊  ┊20┊
+┊  ┊21┊  Accounts.createUserWithPhone({
+┊  ┊22┊    phone: '+972540000001',
+┊  ┊23┊    profile: {
+┊  ┊24┊      name: 'Ethan Gonzalez',
+┊  ┊25┊      pictureId: picture._id
+┊  ┊26┊    }
+┊  ┊27┊  });
+┊  ┊28┊
+┊  ┊29┊  picture = importPictureFromUrl({
+┊  ┊30┊    name: 'lego1.jpg',
+┊  ┊31┊    url: 'https://randomuser.me/api/portraits/lego/1.jpg'
+┊  ┊32┊  });
+┊  ┊33┊
+┊  ┊34┊  Accounts.createUserWithPhone({
+┊  ┊35┊    phone: '+972540000002',
+┊  ┊36┊    profile: {
+┊  ┊37┊      name: 'Bryan Wallace',
+┊  ┊38┊      pictureId: picture._id
+┊  ┊39┊    }
+┊  ┊40┊  });
+┊  ┊41┊
+┊  ┊42┊  picture = importPictureFromUrl({
+┊  ┊43┊    name: 'woman1.jpg',
+┊  ┊44┊    url: 'https://randomuser.me/api/portraits/women/1.jpg'
+┊  ┊45┊  });
+┊  ┊46┊
+┊  ┊47┊  Accounts.createUserWithPhone({
+┊  ┊48┊    phone: '+972540000003',
+┊  ┊49┊    profile: {
+┊  ┊50┊      name: 'Avery Stewart',
+┊  ┊51┊      pictureId: picture._id
+┊  ┊52┊    }
+┊  ┊53┊  });
+┊  ┊54┊
+┊  ┊55┊  picture = importPictureFromUrl({
+┊  ┊56┊    name: 'woman2.jpg',
+┊  ┊57┊    url: 'https://randomuser.me/api/portraits/women/2.jpg'
+┊  ┊58┊  });
+┊  ┊59┊
+┊  ┊60┊  Accounts.createUserWithPhone({
+┊  ┊61┊    phone: '+972540000004',
+┊  ┊62┊    profile: {
+┊  ┊63┊      name: 'Katie Peterson',
+┊  ┊64┊      pictureId: picture._id
+┊  ┊65┊    }
+┊  ┊66┊  });
+┊  ┊67┊
+┊  ┊68┊  picture = importPictureFromUrl({
+┊  ┊69┊    name: 'man2.jpg',
+┊  ┊70┊    url: 'https://randomuser.me/api/portraits/men/2.jpg'
+┊  ┊71┊  });
+┊  ┊72┊
+┊  ┊73┊  Accounts.createUserWithPhone({
+┊  ┊74┊    phone: '+972540000005',
+┊  ┊75┊    profile: {
+┊  ┊76┊      name: 'Ray Edwards',
+┊  ┊77┊      pictureId: picture._id
+┊  ┊78┊    }
+┊  ┊79┊  });
 ┊ 9┊80┊});
+┊  ┊81┊
+┊  ┊82┊function importPictureFromUrl(options: { name: string, url: string }): Picture {
+┊  ┊83┊  const description = { name: options.name };
+┊  ┊84┊
+┊  ┊85┊  return Meteor.call('ufsImportURL', options.url, description, 'pictures');
+┊  ┊86┊}
```

##### Changed api&#x2F;server&#x2F;publications.ts
```diff
@@ -17,10 +17,18 @@
 ┊17┊17┊  if (pattern) {
 ┊18┊18┊    selector = {
 ┊19┊19┊      'profile.name': { $regex: pattern, $options: 'i' },
-┊20┊  ┊      'phone.number': {$in: contacts}
+┊  ┊20┊      $or: [
+┊  ┊21┊        {'phone.number': {$in: contacts}},
+┊  ┊22┊        {'profile.name': {$in: ['Ethan Gonzalez', 'Bryan Wallace', 'Avery Stewart', 'Katie Peterson', 'Ray Edwards']}}
+┊  ┊23┊      ]
 ┊21┊24┊    };
 ┊22┊25┊  } else {
-┊23┊  ┊    selector = {'phone.number': {$in: contacts}}
+┊  ┊26┊    selector = {
+┊  ┊27┊      $or: [
+┊  ┊28┊        {'phone.number': {$in: contacts}},
+┊  ┊29┊        {'profile.name': {$in: ['Ethan Gonzalez', 'Bryan Wallace', 'Avery Stewart', 'Katie Peterson', 'Ray Edwards']}}
+┊  ┊30┊      ]
+┊  ┊31┊    }
 ┊24┊32┊  }
 ┊25┊33┊
 ┊26┊34┊  return {
```

[}]: #

[{]: <helper> (navStep nextRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/push-notifications" prevRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/native-mobile")

| [< Previous Step](https://angular-meteor.com/tutorials/whatsapp2/ionic/native-mobile) | [Next Step >](https://angular-meteor.com/tutorials/whatsapp2/ionic/push-notifications) |
|:--------------------------------|--------------------------------:|

[}]: #

