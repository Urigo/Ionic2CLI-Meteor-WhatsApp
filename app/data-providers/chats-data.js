import {Injectable} from '@angular/core';
import {DataProvider} from './data-provider';
import {UsersData} from './users-data';


@Injectable()
export class ChatsData extends DataProvider {
  static parameters = [[UsersData]]

  constructor(users) {
    super();
    this.users = users;
  }

  add(recipientId) {
    const chat = this.currentUser.addChat(recipientId);
    return this.get(chat._id);
  }

  get(chatId) {
    const chat = super.get(chatId);
    const recipientId = chat.memberIds.find(memberId => memberId != this.currentUser._id);
    const recipient = this.users.get(recipientId);

    chat.addressee = this.currentUser;
    chat.recipient = recipient;
    chat.title = recipient.name;
    chat.picture = recipient.picture;

    return chat;
  }

  getByRecipient(recipientId) {
    return this.models.find(chat => chat.recipient._id == recipientId);
  }

  chattingWith(recipientId) {
    return this.currentUser._id == recipientId || !!this.getByRecipient(recipientId);
  }

  get currentUser() {
    return this.users.current;
  }

  get collection() {
    return this.currentUser.chats;
  }
}
