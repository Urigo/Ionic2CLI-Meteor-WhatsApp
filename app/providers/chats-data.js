import Moment from 'moment';
import {Injectable} from '@angular/core';


@Injectable()
export class ChatsData {
  constructor() {
    let chat;
    this._chats = [];

    chat = new Chat({
      title: 'Ethan Gonzalez',
      picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg',
    });

    chat.messages.push({
      contents: 'You on your way?',
      timestamp: Moment().subtract(1, 'hours').toDate()
    });

    this._chats.push(chat);

    chat = new Chat({
      title: 'Bryan Wallace',
      picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
    });

    chat.messages.push({
      contents: 'Hey, it\'s me',
      timestamp: Moment().subtract(2, 'hours').toDate()
    });

    this._chats.push(chat);

    chat = new Chat({
      title: 'Avery Stewart',
      picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
    });

    chat.messages.push({
      contents: 'I should buy a boat',
      timestamp: Moment().subtract(1, 'days').toDate()
    });

    this._chats.push(chat);

    chat = new Chat({
      title: 'Katie Peterson',
      picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg',
    });

    chat.messages.push({
      contents: 'Look at my mukluks!',
      timestamp: Moment().subtract(4, 'days').toDate()
    });

    this._chats.push(chat);

    chat = new Chat({
      title: 'Ray Edwards',
      picture: 'https://randomuser.me/api/portraits/thumb/men/2.jpg',
    });

    chat.messages.push({
      contents: 'This is wicked good ice cream.',
      timestamp: Moment().subtract(2, 'weeks').toDate()
    });

    this._chats.push(chat);
  }

  get(id) {
    return this._chats.find(chat => chat._id === id);
  }

  add(data) {
    const chat = new Chat(data);
    this._chats.push(chat);
    return chat;
  }

  remove(id) {
    const chat = this.get(id);
    if (chat == null) return;

    const index = this._chats.indexOf(chat);
    this._chats.splice(index, 1);

    return chat;
  }
}

class Chat {
  static _recentId = 0

  constructor(data) {
    Object.assign(this, data);
    this._id = Chat._recentId++;
    this.messages = [];
  }

  get recentMessage() {
    return this.messages[this.messages.length - 1];
  }
}