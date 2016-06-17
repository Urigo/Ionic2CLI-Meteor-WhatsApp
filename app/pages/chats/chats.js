import Moment from 'moment';
import {Component} from '@angular/core';
import {MeteorComponent} from 'angular2-meteor';
import {CalendarPipe} from 'angular2-moment';
import {NavController, Modal, Popover} from 'ionic-angular';
import {Chats} from 'server/collections';
import {MessagesPage} from '../messages/messages';
import {NewChatPage} from '../new-chat/new-chat';
import {ChatsOptionsPage} from '../chats-options/chats-options';


@Component({
  templateUrl: 'build/pages/chats/chats.html',
  pipes: [CalendarPipe]
})
export class ChatsPage extends MeteorComponent {
  static parameters = [[NavController]]

  constructor(nav) {
    super();

    this.nav = nav;

    this.subscribe('chats', () => {
      this.chats = Chats.find();
      this.activateChat();
    });
  }

  activateChat() {
    const activeChatId = localStorage.getItem('activeChat');
    if (!activeChatId) return;

    const chat = Chats.findOne(activeChatId);
    if (!chat) return localStorage.removeItem('activeChat');

    this.showMessages(chat);
  }

  addChat() {
    const modal = Modal.create(NewChatPage);
    this.nav.present(modal);
  }

  removeChat(chat) {
    this.call('removeChat', chat._id);
  }

  showMessages(chat) {
    localStorage.setItem('activeChat', chat._id);
    this.nav.push(MessagesPage, {chat});
  }

  showOptions() {
    const popover = Popover.create(ChatsOptionsPage, {}, {
      cssClass: 'options-popover'
    });

    this.nav.present(popover);
  }
}
