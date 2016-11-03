import { Component, OnInit } from '@angular/core';
import { Observable } from "rxjs";
import { Chat } from "api/models/whatsapp-models";
import { Chats, Messages } from "api/collections/whatsapp-collections";

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
    this.chats = this.chats.map<Chat[]>(chatsArray => {
      const chatIndex = chatsArray.indexOf(chat);
      chatsArray.splice(chatIndex, 1);
      return chatsArray;
    });
  }
}
