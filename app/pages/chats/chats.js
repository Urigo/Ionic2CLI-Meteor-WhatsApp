import Moment from 'moment';
import {Component} from '@angular/core';
import {MeteorComponent} from 'angular2-meteor';
import {CalendarPipe} from 'angular2-moment';
import {NavController, Modal, Popover} from 'ionic-angular';
import {Meteor} from 'meteor/meteor';
import {Chats, Messages} from 'api/collections';
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
    this.addresseeId = Meteor.userId();

    this.subscribe('chats', () => {
      this.autorun(() => {
        this.chats = this.findChats();
      }, true);
    });
  }

  findChats() {
    const chats = Chats.find({}, {
      transform: this::this.transformChat
    });

    chats.observe({
      removed: this::this.onChatRemoved
    });

    return chats;
  }

  transformChat(chat) {
    if (!Meteor.user()) return chat;

    chat.title = '';
    chat.picture = '';
    chat.lastMessage = '';

    setTimeout(() => {
      chat.recipientComputation = this.autorun(() => {
        const recipientId = chat.memberIds.find(memberId => memberId != this.addresseeId);
        const recipient = Meteor.users.findOne(recipientId);
        if (!recipient) return;

        chat.title = recipient.profile.name;
        chat.picture = recipient.profile.picture;
      }, true);
    });

    setTimeout(() => {
      chat.lastMessageComputation = this.autorun(() => {
        chat.lastMessage = this.findLastMessage(chat);
      }, true);
    });

    return chat;
  }

  findLastMessage(chat) {
    return Messages.findOne({
      chatId: chat._id
    }, {
      sort: {createdAt: -1}
    });
  }

  onChatRemoved(chat) {
    setTimeout(() => {
      chat.recipientComputation.stop();
      chat.lastMessageComputation.stop();
    });
  }

  addChat() {
    const modal = Modal.create(NewChatPage);
    this.nav.present(modal);
  }

  removeChat(chat) {
    this.call('removeChat', chat._id);
  }

  showMessages(chat) {
    this.nav.push(MessagesPage, {chat});
  }

  showOptions() {
    const popover = Popover.create(ChatsOptionsPage, {}, {
      cssClass: 'options-popover'
    });

    this.nav.present(popover);
  }
}
