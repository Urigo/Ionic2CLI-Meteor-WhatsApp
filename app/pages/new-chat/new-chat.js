import {Page, ViewController} from 'ionic-angular';
import {UsersData} from '../../data-providers/users-data';
import {ChatsData} from '../../data-providers/chats-data';


@Page({
  templateUrl: 'build/pages/new-chat/new-chat.html'
})
export class NewChatPage {
  static parameters = [[ViewController], [UsersData], [ChatsData]]

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