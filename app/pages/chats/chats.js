import Moment from 'moment';
import {Component} from '@angular/core';
import {CalendarPipe} from 'angular2-moment';
import {NavController, Modal, Popover} from 'ionic-angular';
import {MessagesPage} from '../messages/messages';
import {NewChatPage} from '../new-chat/new-chat';
import {ChatsOptionsPage} from '../chats-options/chats-options';
import {UsersService} from '../../services/users-service';
import {ChatsService} from '../../services/chats-service';


@Component({
  templateUrl: 'build/pages/chats/chats.html',
  pipes: [CalendarPipe]
})
export class ChatsPage {
  static parameters = [[NavController], [UsersService], [ChatsService]]

  constructor(nav, users, chats) {
    this.nav = nav;
    this.activeUser = users.active;
    this.chats = chats;

    if (!this.chats.length) {
      let user;
      let chat;
      let message;
      let userIndex = 0;

      user = users.models[userIndex++];
      chat = this.activeUser.addChat(user._id);
      message = chat.addMessage(user._id, 'You on your way?');
      message.timestamp = Moment().subtract(1, 'hours').toDate();

      user = users.models[userIndex++];
      chat = this.activeUser.addChat(user._id);
      message = chat.addMessage(user._id, 'Hey, it\'s me');
      message.timestamp = Moment().subtract(2, 'hours').toDate();

      user = users.models[userIndex++];
      chat = this.activeUser.addChat(user._id);
      message = chat.addMessage(user._id, 'I should buy a boat');
      message.timestamp = Moment().subtract(1, 'days').toDate();

      user = users.models[userIndex++];
      chat = this.activeUser.addChat(user._id);
      message = chat.addMessage(user._id, 'Look at my mukluks!');
      message.timestamp = Moment().subtract(4, 'days').toDate();

      user = users.models[userIndex++];
      chat = this.activeUser.addChat(user._id);
      message = chat.addMessage(user._id, 'This is wicked good ice cream.');
      message.timestamp = Moment().subtract(2, 'weeks').toDate();
    }

    if (chats.active) {
      this.nav.push(MessagesPage);
    }
  }

  addChat() {
    const modal = Modal.create(NewChatPage);
    this.nav.present(modal);
  }

  removeChat(chat) {
    this.chats.remove(chat._id);
  }

  showMessages(chat) {
    this.chats.setActive(chat._id).store();
    this.nav.push(MessagesPage);
  }

  showOptions() {
    const popover = Popover.create(ChatsOptionsPage, {}, {
      cssClass: 'options-popover'
    });

    this.nav.present(popover);
  }
}
