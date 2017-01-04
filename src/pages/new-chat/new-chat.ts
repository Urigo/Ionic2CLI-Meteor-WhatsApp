import { Component, OnInit } from '@angular/core';
import { NavController, ViewController, AlertController } from 'ionic-angular';
import { Contacts, Contact } from 'ionic-native';
import { MeteorObservable, ObservableCursor } from 'meteor-rxjs';
import { Observable, Subscription } from 'rxjs';
import { _ } from 'meteor/underscore';
import { Chats, Users } from 'api/collections/whatsapp-collections';
import { User } from 'api/models/whatsapp-models';

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
    private alertCtrl: AlertController
  ) {
    this.senderId = Meteor.userId();
  }

  ngOnInit() {
    this.findContacts().then((contacts) => {
      // Pluck all contacts' phone numbers into a flat array
      contacts = contacts && _.chain(contacts)
        .pluck('phoneNumbers')
        .flatten()
        .pluck('value')
        .uniq()
        .value();

      // Subscribe to all the users who are in the provided contacts list
      this.subscribeUsers(contacts);
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
    if (!navigator.hasOwnProperty('contacts')) return Promise.resolve();

    // Look for all the available phone numbers in contacts
    return Contacts.find(['phoneNumbers'], {
      hasPhoneNumber: true,
      multiple: true
    });
  }

  subscribeUsers(contacts?: any[]): Subscription {
    // Fetch all users in contacts list. If no contacts list was provided, will
    // fetch all available users in database. This behavior is **not** recommended
    // in a production application since it will probably overload both client
    // and server
    return MeteorObservable.subscribe('users', contacts).subscribe(() => {
      MeteorObservable.autorun().subscribe(() => {
        this.users = this.findUsers().zone();
      });
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
      // Get all userIDs with whom we're chatting with
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
