import { Component, OnInit } from '@angular/core';
import { Chats, Messages } from 'api/collections';
import { Chat } from 'api/models';
import { NavController, PopoverController } from 'ionic-angular';
import { Observable } from 'rxjs';
import { MessagesPage } from '../messages/messages';
import { ChatsOptionsComponent } from './chats-options';

@Component({
  templateUrl: 'chats.html'
})
export class ChatsPage implements OnInit {
  chats;

  constructor(
    private navCtrl: NavController,
    private popoverCtrl: PopoverController) {
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

  showMessages(chat): void {
    this.navCtrl.push(MessagesPage, {chat});
  }

  removeChat(chat: Chat): void {
    Chats.remove({_id: chat._id}).subscribe(() => {
    });
  }

  showOptions(): void {
    const popover = this.popoverCtrl.create(ChatsOptionsComponent, {}, {
      cssClass: 'options-popover chats-options-popover'
    });

    popover.present();
  }
}
