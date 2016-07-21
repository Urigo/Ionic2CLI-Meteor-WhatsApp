import {Component} from '@angular/core';
import {NavController, Modal, Popover} from 'ionic-angular';
import {MeteorComponent} from 'angular2-meteor';
import {CalendarPipe} from 'angular2-moment';
import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {Chat, Message} from 'api/models';
import {Chats, Messages} from 'api/collections';
import {MessagesPage} from '../messages/messages';
import {ChatsOptionsPage} from '../chats-options/chats-options';
import {NewChatPage} from '../new-chat/new-chat';


@Component({
  templateUrl: 'build/pages/chats/chats.html',
  pipes: [CalendarPipe]
})
export class ChatsPage extends MeteorComponent {
  chats: Mongo.Cursor<Chat>;
  private senderId: string;

  constructor(private navCtrl: NavController) {
    super();

    this.senderId = Meteor.userId();

    this.subscribe('chats', () => {
      this.autorun(() => {
        this.chats = this.findChats();
      });
    });
  }

  addChat(): void {
    const modal = Modal.create(NewChatPage);
    this.navCtrl.present(modal);
  }

  removeChat(chat: Chat): void {
    this.call('removeChat', chat._id);
  }

  showMessages(chat: Chat): void {
    this.navCtrl.push(MessagesPage, {chat});
  }

  showOptions(): void {
    const popover = Popover.create(ChatsOptionsPage, {}, {
      cssClass: 'options-popover'
    });

    this.navCtrl.present(popover);
  }

  private findChats(): Mongo.Cursor<Chat> {
    const chats = Chats.find({}, {
      transform: this.transformChat.bind(this)
    });

    chats.observe({
      changed: (newChat, oldChat) => this.disposeChat(oldChat),
      removed: (chat) => this.disposeChat(chat)
    });

    return chats;
  }

  private disposeChat(chat: Chat): void {
    if (chat.receiverComp) chat.receiverComp.stop();
    if (chat.lastMessageComp) chat.lastMessageComp.stop();
  }

  private transformChat(chat: Chat): Chat {
    if (!this.senderId) return chat;

    chat.title = '';
    chat.picture = '';

    chat.receiverComp = this.autorun(() => {
      const receiverId = chat.memberIds.find(memberId => memberId != this.senderId);
      const receiver = <Meteor.User>Meteor.users.findOne(receiverId);
      if (!receiver) return;

      chat.title = receiver.profile.name;
      chat.picture = receiver.profile.picture;
    });

    chat.lastMessageComp = this.autorun(() => {
      chat.lastMessage = this.findLastMessage(chat);
    });

    return chat;
  }

  private findLastMessage(chat: Chat): Message {
    return Messages.findOne({
      chatId: chat._id
    }, {
      sort: {createdAt: -1}
    });
  }
}
