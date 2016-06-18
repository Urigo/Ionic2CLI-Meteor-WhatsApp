import {Component} from '@angular/core';
import {MeteorComponent} from 'angular2-meteor';
import {ViewController} from 'ionic-angular';
import {Meteor} from 'meteor/meteor';
import {Chats} from 'api/collections';


@Component({
  templateUrl: 'build/pages/new-chat/new-chat.html'
})
export class NewChatPage extends MeteorComponent {
  static parameters = [[ViewController]]

  constructor(view) {
    super();

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
    this.call('addChat', user._id);
    this.dismiss();
  }

  dismiss() {
    this.view.dismiss();
  }
}