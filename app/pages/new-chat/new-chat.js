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
    this.addresseeId = Meteor.userId();

    this.subscribe('users', () => {
      this.autorun(() => {
        this.users = this.findUsers();
      }, true);
    });
  }

  findUsers() {
    let recipientIds = Chats.find({
      memberIds: this.addresseeId
    }, {
      fields: {
        memberIds: 1
      }
    });

    recipientIds = recipientIds
      .map(({memberIds}) => memberIds)
      .reduce((result, memberIds) => result.concat(memberIds), [])
      .concat(this.addresseeId);

    return Meteor.users.find({
      _id: {$nin: recipientIds}
    });
  }

  addChat(user) {
    this.call('addChat', user._id, ([e]) => {
      if (e) return this.handleError(e);
      this.dismiss();
    }, true);
  }

  dismiss() {
    this.view.dismiss();
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