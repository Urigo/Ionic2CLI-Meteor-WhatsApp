import {Injectable} from '@angular/core';
import {CollectionService} from './collection-service';
import {UsersService} from './users-service';
import {ChatsService} from './chats-service';


export class MessagesService extends CollectionService {
  static parameters = [[UsersService], [ChatsService]]

  constructor(users, chats) {
    super();
    this.users = users;
    this.chats = chats;
  }

  add(content) {
    const message = this.activeChat.addMessage(this.activeUser._id, content);
    return this.get(message._id);
  }

  get(messageId) {
    const message = super.get(messageId);
    const addressee = this.users.get(message.addresseeId);
    const recipientId = this.activeChat.memberIds.find(memberId => memberId != addressee._id);
    const recipient = this.users.get(recipientId);

    message.chat = this.activeChat;
    message.addressee = addressee;
    message.recipient = recipient;
    message.ownership = this.activeUser._id == message.addressee._id ? 'mine' : 'others';

    return message;
  }

  get activeUser() {
    return this.users.active;
  }

  get activeChat() {
    return this.chats.active;
  }

  get collection() {
    return this.activeChat.messages;
  }
}
