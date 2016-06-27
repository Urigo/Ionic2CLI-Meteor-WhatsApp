import {Component} from '@angular/core';
import {MeteorComponent} from 'angular2-meteor';
import {NavController, ViewController, Alert} from 'ionic-angular';
import {Meteor} from 'meteor/meteor';
import {Chats} from 'api/collections';


@Component({
  templateUrl: 'build/pages/new-chat/new-chat.html'
})
export class NewChatPage extends MeteorComponent {
  static parameters = [[NavController], [ViewController]]

  constructor(nav, view) {
    super();

    this.nav = nav;
    this.view = view;
    this.senderId = Meteor.userId();

    this.subscribe('users', () => {
      this.autorun(() => {
        this.users = this.findUsers();
      }, true);
    });
  }

  findUsers() {
    let recieverIds = Chats.find({
      memberIds: this.senderId
    }, {
      fields: {
        memberIds: 1
      }
    });

    recieverIds = recieverIds
      .map(({memberIds}) => memberIds)
      .reduce((result, memberIds) => result.concat(memberIds), [])
      .concat(this.senderId);

    return Meteor.users.find({
      _id: {$nin: recieverIds}
    });
  }

  addChat(user) {
    this.call('addChat', user._id, ([e]) => {
      if (e) return this.handleError(e);
      this.dismiss();
    }, true);
  }

  dismiss() {
    return this.view.dismiss();
  }

  handleError(e) {
    console.error(e);

    const alert = Alert.create({
      title: 'Oops!',
      message: e.message,
      buttons: ['OK']
    });

    this.nav.present(alert);
  }
}