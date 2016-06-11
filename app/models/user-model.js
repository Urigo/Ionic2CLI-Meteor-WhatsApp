import {Model} from './model';
import {ChatsCollection} from '../collections/chats-collection';


export class UserModel extends Model {
  constructor({ name, phone, picture }) {
    super();
    this.chats = new ChatsCollection();
    this.name = name;
    this.phone = phone;
    this.picture = picture;
  }

  addChat(recipientId) {
    return this.chats.add({
      memberIds: [this._id, recipientId]
    });
  }
}