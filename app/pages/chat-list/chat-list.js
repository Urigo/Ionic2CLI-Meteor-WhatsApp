import {Component} from '@angular/core';
import Moment from 'moment';
import {CalendarPipe} from 'angular2-moment';
import {NavController, Modal} from 'ionic-angular';
import {ChatDetailPage} from '../chat-detail/chat-detail';
import {NewChatPage} from '../new-chat/new-chat';
import {UsersData} from '../../data-providers/users-data';
import {ChatsData} from '../../data-providers/chats-data';


@Component({
  templateUrl: 'build/pages/chat-list/chat-list.html',
  pipes: [CalendarPipe]
})
export class ChatListPage {
  static parameters = [[NavController], [UsersData], [ChatsData]]

  constructor(nav, users, chats) {
    let user;
    let chat;
    let message;
    let userIndex = 0;

    this.nav = nav;
    this.currentUser = users.current;
    this.chats = chats;

    user = users.models[userIndex++];
    chat = this.currentUser.addChat(user._id);
    message = chat.addMessage(user._id, 'You on your way?');
    message.timestamp = Moment().subtract(1, 'hours').toDate();

    user = users.models[userIndex++];
    chat = this.currentUser.addChat(user._id);
    message = chat.addMessage(user._id, 'Hey, it\'s me');
    message.timestamp = Moment().subtract(2, 'hours').toDate();

    user = users.models[userIndex++];
    chat = this.currentUser.addChat(user._id);
    message = chat.addMessage(user._id, 'I should buy a boat');
    message.timestamp = Moment().subtract(1, 'days').toDate();

    user = users.models[userIndex++];
    chat = this.currentUser.addChat(user._id);
    message = chat.addMessage(user._id, 'Look at my mukluks!');
    message.timestamp = Moment().subtract(4, 'days').toDate();

    user = users.models[userIndex++];
    chat = this.currentUser.addChat(user._id);
    message = chat.addMessage(user._id, 'This is wicked good ice cream.');
    message.timestamp = Moment().subtract(2, 'weeks').toDate();
  }

  goToChatDetail(chat) {
    this.chats.current = chat;
    this.nav.push(ChatDetailPage);
  }

  addChat() {
    const modal = Modal.create(NewChatPage);
    this.nav.present(modal);
  }

  removeChat(chat) {
    this.chats.remove(chat._id);
  }

  showOptions() {

  }
}
