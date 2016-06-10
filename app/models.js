export class Model {
  constructor() {
    const ctor = this.constructor;
    ctor.idCounter = ctor.idCounter || 0;
    this._id = ctor.idCounter++;
  }
}

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

export class ChatModel extends Model {
  constructor({ memberIds }) {
    super();
    this.messages = new MessagesCollection();
    this.memberIds = memberIds;
  }

  addMessage(addresseeId, contents) {
    return this.messages.add({
      chatId: this._id,
      addresseeId: addresseeId,
      contents: contents
    });
  }
}

export class MessageModel extends Model {
  constructor({ chatId, addresseeId, contents }) {
    super();
    this.timestamp = new Date();
    this.chatId = chatId;
    this.addresseeId = addresseeId;
    this.contents = contents;
  }
}

import { ChatsCollection, MessagesCollection } from './collections';