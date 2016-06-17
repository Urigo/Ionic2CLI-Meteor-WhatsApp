import {Component} from '@angular/core';
import {MeteorComponent} from 'angular2-meteor';
import {ViewController} from 'ionic-angular';
import {Meteor} from 'meteor/meteor';


@Component({
  templateUrl: 'build/pages/new-chat/new-chat.html'
})
export class NewChatPage extends MeteorComponent {
  static parameters = [[ViewController]]

  constructor(view) {
    super();

    this.view = view;

    this.subscribe('potentialRecipients', () => {
      this.users = Meteor.users.find();
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