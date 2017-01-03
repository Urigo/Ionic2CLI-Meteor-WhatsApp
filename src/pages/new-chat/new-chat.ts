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
      contacts = contacts && _.chain(contacts)
        .pluck('phoneNumbers')
        .flatten()
        .pluck('value')
        .uniq()
        .value();

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
    if (!navigator.hasOwnProperty('contacts')) return Promise.resolve();

    return Contacts.find(['phoneNumbers'], {
      hasPhoneNumber: true,
      multiple: true
    });
  }

  subscribeUsers(contacts?: any[]): Subscription {
    return MeteorObservable.subscribe('users', contacts).subscribe(() => {
      MeteorObservable.autorun().subscribe(() => {
        this.users = this.findUsers().zone();
      });
    });
  }

  findUsers(): ObservableCursor<User> {
    return Chats.find({
      memberIds: this.senderId
    }, {
      fields: {
        memberIds: 1
      }
    })
    .startWith([])
    .mergeMap((chats) => {
      const recieverIds = chats
        .map(({ memberIds }) => memberIds)
        .reduce((result, memberIds) => result.concat(memberIds), [])
        .concat(this.senderId);

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
