import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { Chat, MessageType } from '../../models';

@Component({
  templateUrl: 'chats.html'
})
export class ChatsPage {
  chats: Observable<Chat[]>;

  constructor() {
    this.chats = this.findChats();
  }

  private findChats(): Observable<Chat[]> {
    return Observable.of([
      {
        _id: '0',
        title: 'Ethan Gonzalez',
        picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg',
        lastMessage: {
          content: 'You on your way?',
          createdAt: moment().subtract(1, 'hours').toDate(),
          type: MessageType.TEXT
        }
      },
      {
        _id: '1',
        title: 'Bryan Wallace',
        picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
        lastMessage: {
          content: 'Hey, it\'s me',
          createdAt: moment().subtract(2, 'hours').toDate(),
          type: MessageType.TEXT
        }
      },
      {
        _id: '2',
        title: 'Avery Stewart',
        picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
        lastMessage: {
          content: 'I should buy a boat',
          createdAt: moment().subtract(1, 'days').toDate(),
          type: MessageType.TEXT
        }
      },
      {
        _id: '3',
        title: 'Katie Peterson',
        picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg',
        lastMessage: {
          content: 'Look at my mukluks!',
          createdAt: moment().subtract(4, 'days').toDate(),
          type: MessageType.TEXT
        }
      },
      {
        _id: '4',
        title: 'Ray Edwards',
        picture: 'https://randomuser.me/api/portraits/thumb/men/2.jpg',
        lastMessage: {
          content: 'This is wicked good ice cream.',
          createdAt: moment().subtract(2, 'weeks').toDate(),
          type: MessageType.TEXT
        }
      }
    ]);
  }

  removeChat(chat: Chat): void {
    this.chats = this.chats.map((chatsArray: Chat[]) => {
      const chatIndex = chatsArray.indexOf(chat);
      if (chatIndex !== -1) {
        chatsArray.splice(chatIndex, 1);
      }

      return chatsArray;
    });
  }
}
