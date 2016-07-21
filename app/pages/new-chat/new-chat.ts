import {Component} from '@angular/core';
import {MeteorComponent} from 'angular2-meteor';
import {NavController, ViewController, Alert} from 'ionic-angular';
import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {Chats} from 'api/collections';


@Component({
  templateUrl: 'build/pages/new-chat/new-chat.html'
})
export class NewChatPage extends MeteorComponent {
  users: Mongo.Cursor<Meteor.User>;
  private senderId: string;

  constructor(private navCtrl: NavController, private viewCtrl: ViewController) {
    super();

    this.senderId = Meteor.userId();

    this.subscribe('users', () => {
      this.autorun(() => {
        this.users = this.findUsers();
      });
    });
  }

  addChat(user): void {
    this.call('addChat', user._id, (e: Error) => {
      this.viewCtrl.dismiss().then(() => {
        if (e) return this.handleError(e);
      });
    });
  }

  private findUsers(): Mongo.Cursor<Meteor.User> {
    const chats = Chats.find({
      memberIds: this.senderId
    }, {
      fields: {
        memberIds: 1
      }
    });

    const recieverIds = chats
      .map(({memberIds}) => memberIds)
      .reduce((result, memberIds) => result.concat(memberIds), [])
      .concat(this.senderId);

    return Meteor.users.find({
      _id: {$nin: recieverIds}
    });
  }

  private handleError(e: Error): void {
    console.error(e);

    const alert = Alert.create({
      title: 'Oops!',
      message: e.message,
      buttons: ['OK']
    });

    this.navCtrl.present(alert);
  }
}