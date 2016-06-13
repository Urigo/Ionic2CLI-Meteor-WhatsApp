import {Component} from '@angular/core';
import {ViewController} from 'ionic-angular';
import {UsersService} from '../../services/users-service';
import {ChatsService} from '../../services/chats-service';


@Component({
  templateUrl: 'build/pages/new-chat/new-chat.html'
})
export class NewChatPage {
  static parameters = [[ViewController], [UsersService], [ChatsService]]

  constructor(view, users, chats) {
    this.view = view;
    this.users = users;
    this.chats = chats;
  }

  addChat(user) {
    this.chats.add(user._id);
    this.dismiss();
  }

  dismiss() {
    this.view.dismiss();
  }
}