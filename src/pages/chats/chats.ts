import { Component, OnInit } from '@angular/core';
import { Chats, Messages } from 'api/collections';
import { Chat } from 'api/models';
import { Observable } from 'rxjs';

@Component({
  templateUrl: 'chats.html'
})
export class ChatsPage implements OnInit {
  chats;

  constructor() {
  }

  ngOnInit() {
    this.chats = Chats
      .find({})
      .mergeMap((chats: Chat[]) =>
        Observable.combineLatest(
          ...chats.map((chat: Chat) =>
            Messages
              .find({chatId: chat._id})
              .startWith(null)
              .map(messages => {
                if (messages) chat.lastMessage = messages[0];
                return chat;
              })
          )
        )
      ).zone();
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
