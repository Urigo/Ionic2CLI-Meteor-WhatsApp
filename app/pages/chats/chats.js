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

  constructor(navCtrl) {
    super();

    this.navCtrl = navCtrl;

    this.senderId = Meteor.userId();
    this.chatsSub = this.subscribe('chats');
  }

  ngOnInit() {
    this.autorun(() => {
      if (!this.chatsSub.ready()) return;
      this.chats = this.findChats();
    }, true);
  }

  findChats() {
    const chats = Chats.find({}, {
      transform: this::this.transformChat
    });

    chats.observe({
      changed: (newChat, oldChat) => this.disposeChat(oldChat),
      removed: (chat) => this.disposeChat(chat)
    });

    return chats;
  }

  transformChat(chat) {
    if (!this.senderId) return chat;

    chat.title = '';
    chat.picture = '';
    chat.lastMessage = {};

    setTimeout(() => {
      chat.recieverComp = this.autorun(() => {
        const recieverId = chat.memberIds.find(memberId => memberId != this.senderId);
        const reciever = Meteor.users.findOne(recieverId);
        if (!reciever) return;

        chat.title = reciever.profile.name;
        chat.picture = reciever.profile.picture;
      }, true);
    });

    setTimeout(() => {
      chat.lastMessageComp = this.autorun(() => {
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

  disposeChat(chat) {
    setTimeout(() => {
      if (chat.recieverComp) chat.recieverComp.stop();
      if (chat.lastMessageComp) chat.lastMessageComp.stop();
    });
  }

  addChat() {
    const modal = Modal.create(NewChatPage);
    this.navCtrl.present(modal);
  }

  removeChat(chat) {
    this.call('removeChat', chat._id);
  }

  showMessages(chat) {
    this.navCtrl.push(MessagesPage, {chat});
  }

  showOptions() {
    const popover = Popover.create(ChatsOptionsPage, {}, {
      cssClass: 'options-popover'
    });

    this.navCtrl.present(popover);
  }
}
