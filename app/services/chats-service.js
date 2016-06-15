import {Injectable} from '@angular/core';
import {CollectionService} from './collection-service';
import {UsersService} from './users-service';


@Injectable()
export class ChatsService extends CollectionService {
  static parameters = [[UsersService]]

  constructor(users) {
    super();
    this.users = users;
  }

  add(recipientId) {
    const chat = this.activeUser.addChat(recipientId);
    return this.get(chat._id);
  }

  get(chatId) {
    const chat = super.get(chatId);
    const recipientId = chat.memberIds.find(memberId => memberId != this.activeUser._id);
    const recipient = this.users.get(recipientId);

    chat.addressee = this.activeUser;
    chat.recipient = recipient;
    chat.title = recipient.name;
    chat.picture = recipient.picture;

    return chat;
  }

  getByRecipient(recipientId) {
    return this.models.find(chat => chat.recipient._id == recipientId);
  }

  chattingWith(recipientId) {
    return this.activeUser._id == recipientId || !!this.getByRecipient(recipientId);
  }

  get activeUser() {
    return this.users.active;
  }

  get collection() {
    return this.activeUser.chats;
  }
}
