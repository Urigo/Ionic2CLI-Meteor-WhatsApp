import { Component, OnInit } from '@angular/core';
import { Chats, Messages, Pictures, Users } from 'api/collections';
import { Chat, Message } from 'api/models';
import { AlertController, ModalController, NavController, PopoverController } from 'ionic-angular';
import { MeteorObservable } from 'meteor-rxjs';
import { Observable, Subscriber } from 'rxjs';
import { MessagesPage } from '../messages/messages';
import { ChatsOptionsComponent } from './chats-options';
import { NewChatComponent } from './new-chat';

@Component({
  templateUrl: 'chats.html'
})
export class ChatsPage implements OnInit {
  chats: Observable<Chat[]>;
  senderId: string;

  constructor(
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private popoverCtrl: PopoverController
  ) {
    this.senderId = Meteor.userId();
  }

  ngOnInit() {
    MeteorObservable.subscribe('chats').subscribe(() => {
      MeteorObservable.autorun().subscribe(() => {
        this.chats = this.findChats();
      });
    });
  }

  findChats(): Observable<Chat[]> {
    // Find chats and transform them
    return Chats.find().map(chats => {
      chats.forEach(chat => {
        chat.title = '';
        chat.picture = '';

        const receiverId = chat.memberIds.find(memberId => memberId != this.senderId);
        const receiver = Users.findOne(receiverId);

        if (receiver) {
          chat.title = receiver.profile.name;
          chat.picture = Pictures.getPictureUrl(receiver.profile.pictureId);
        }

        // This will make the last message reactive
        this.findLastChatMessage(chat._id).subscribe((message) => {
          chat.lastMessage = message
        });
      });

      return chats;
    });
  }

  findLastChatMessage(chatId: string): Observable<Message> {
    return Observable.create((observer: Subscriber<Message>) => {
      const chatExists = () => !!Chats.findOne(chatId);

      // Re-compute until chat is removed
      MeteorObservable.autorun().takeWhile(chatExists).subscribe(() => {
        Messages.find({ chatId }, {
          sort: { createdAt: -1 }
        }).subscribe({
          next: (messages) => {
            // Invoke subscription with the last message found
            if (!messages.length) return;
            const lastMessage = messages[0];
            observer.next(lastMessage);
          },

          error: (e) => {
            observer.error(e);
          },

          complete: () => {
            observer.complete();
          }
        });
      });
    });
  }

  addChat(): void {
    const modal = this.modalCtrl.create(NewChatComponent);
    modal.present();
  }

  showOptions(): void {
    const popover = this.popoverCtrl.create(ChatsOptionsComponent, {}, {
      cssClass: 'options-popover chats-options-popover'
    });

    popover.present();
  }

  showMessages(chat): void {
    this.navCtrl.push(MessagesPage, { chat });
  }

  removeChat(chat: Chat): void {
    MeteorObservable.call('removeChat', chat._id).subscribe({
      error: (e: Error) => {
        if (e) this.handleError(e);
      }
    });
  }

  handleError(e: Error): void {
    console.error(e);

    const alert = this.alertCtrl.create({
      title: 'Oops!',
      message: e.message,
      buttons: ['OK']
    });

    alert.present();
  }
}
