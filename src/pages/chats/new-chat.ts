import { Component, OnInit } from '@angular/core';
import { Chats, Pictures, Users } from 'api/collections';
import { User } from 'api/models';
import { AlertController, NavController, Platform, ViewController } from 'ionic-angular';
import { Contacts, Contact, ContactFieldType } from 'ionic-native';
import { MeteorObservable } from 'meteor-rxjs';
import { _ } from 'meteor/underscore';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'new-chat',
  templateUrl: 'new-chat.html'
})
export class NewChatComponent implements OnInit {
  searchPattern = '';
  senderId: string;
  users: Observable<User[]>;

  constructor(
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private platform: Platform,
    private viewCtrl: ViewController
  ) {
    this.senderId = Meteor.userId();
  }

  ngOnInit() {
    this.findContacts().then((contacts) => {
      if (contacts) {
        // Pluck all contacts' phone numbers into a flat array
        var phoneNumbers: number[] = _.chain(contacts)
          .pluck('phoneNumbers')
          .flatten()
          .pluck('value')
          .uniq()
          .value();
      }

      // Subscribe to all the users who are in the provided contacts list
      this.subscribeUsers(phoneNumbers);
    })
    .catch((e) => {
      this.handleError(e);
    });
  }

  addChat(user): void {
    MeteorObservable.call('addChat', user._id).subscribe({
      next: () => {
        this.viewCtrl.dismiss();
      },
      error: (e: Error) => {
        this.viewCtrl.dismiss().then(() => {
          this.handleError(e);
        });
      }
    });
  }

  findContacts(): Promise<Contact[] | void> {
    // If we're running this in the browser
    if (!this.platform.is('mobile')) return Promise.resolve();
    // If contacts plug-in is unavailable
    if (!navigator.hasOwnProperty('contacts')) return Promise.resolve();

    const fields: ContactFieldType[] = ['phoneNumbers'];

    // Look for all the available phone numbers in contacts
    return Contacts.find(fields, {
      hasPhoneNumber: true,
      multiple: true,
      desiredFields: fields
    });
  }

  subscribeUsers(phoneNumbers?: number[]): Subscription {
    // Fetch all users matching phone numbers. If no phone numbers were provided, will
    // fetch all available users in database. This behavior is **not** recommended
    // in a production application since it will probably overload both client
    // and server
    const subscription = MeteorObservable.subscribe('users', phoneNumbers);
    const autorun = MeteorObservable.autorun();

    return Observable.merge(subscription, autorun).subscribe(() => {
      this.users = this.findUsers().zone();
    });
  }

  findUsers(): Observable<User[]> {
    // Find all belonging chats
    return Chats.find({
      memberIds: this.senderId
    }, {
      fields: {
        memberIds: 1
      }
    })
    // The initial value of the upcoming mapping function
    .startWith([])
    .mergeMap((chats) => {
      // Get all userIDs who we're chatting with
      const recieverIds = _.chain(chats)
        .pluck('memberIds')
        .flatten()
        .concat(this.senderId)
        .value();

      // Find all users which are not in belonging chats
      return Users.find({
        _id: { $nin: recieverIds }
      })
    })
    .map((users) => {
      users.forEach((user) => {
        user.profile.picture = Pictures.getPictureUrl(user.profile.pictureId);
      });

      return users;
    });
  }

  handleError(e: Error): void {
    console.error(e);

    const alert = this.alertCtrl.create({
      title: 'Oops!',
      message: e.message,
      buttons: ['OK']
    });

    alert.present();
  }
}
