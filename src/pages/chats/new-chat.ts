import { Component, OnInit } from '@angular/core';
import { NavController, ViewController, AlertController, Platform } from 'ionic-angular';
import { Contacts, Contact, ContactFieldType } from 'ionic-native';
import { MeteorObservable, ObservableCursor } from 'meteor-rxjs';
import { Observable, Subscription } from 'rxjs';
import { _ } from 'meteor/underscore';
import { Chats, Users } from 'api/collections/whatsapp';
import { User } from 'api/models/whatsapp';

@Component({
  selector: 'new-chat',
  templateUrl: 'new-chat.html'
})
export class NewChatComponent implements OnInit {
  searchPattern = '';
  senderId: string;
  users: Observable<User[]>;

  constructor(
    private navCtrl: NavController,
    private viewCtrl: ViewController,
    private alertCtrl: AlertController,
    private platform: Platform
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

  findContacts(): Promise<Contact[]> {
    // If we're running this in the browser, don't look for any contacts
    if (!this.platform.is('mobile')) return Promise.resolve();

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

  findUsers(): ObservableCursor<User> {
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
