import {Injectable} from '@angular/core';
import {Provider} from './provider';
import {UsersProvider} from './users-provider';
import {ChatsProvider} from './chats-provider';


export class MessagesProvider extends Provider {
  static parameters = [[UsersProvider], [ChatsProvider]]

  constructor(users, chats) {
    super();
    this.users = users;
    this.chats = chats;
  }

  add(contents) {
    const message = this.currentChat.addMessage(this.currentUser._id, contents);
    return this.get(message._id);
  }

  get(messageId) {
    const message = super.get(messageId);
    const addressee = this.users.get(message.addresseeId);
    const recipientId = this.currentChat.memberIds.find(memberId => memberId != addressee._id);
    const recipient = this.users.get(recipientId);

    message.chat = this.currentChat;
    message.addressee = addressee;
    message.recipient = recipient;
    message.ownership = this.currentUser._id == message.addressee._id ? 'mine' : 'others';

    return message;
  }

  get currentUser() {
    return this.users.current;
  }

  get currentChat() {
    return this.chats.current;
  }

  get collection() {
    return this.currentChat.messages;
  }
}
