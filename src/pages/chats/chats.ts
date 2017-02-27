import { Component, OnInit } from '@angular/core';
import { Observable } from "rxjs";
import { Chat } from "api/models/whatsapp-models";
import { Chats, Messages, Users } from "api/collections/whatsapp-collections";
import { NavController, PopoverController, ModalController, AlertController } from "ionic-angular";
import { MessagesPage } from "../messages/messages";
import { ChatsOptionsComponent } from "../chat-options/chat-options";
import { NewChatComponent } from "../new-chat/new-chat";
import { MeteorObservable } from 'meteor-rxjs';

@Component({
  templateUrl: 'chats.html'
})
export class ChatsPage implements OnInit {
  chats;
  senderId: string;

  constructor(
    public navCtrl: NavController,
    public popoverCtrl: PopoverController,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.senderId = Meteor.userId();

    MeteorObservable.subscribe('chats').subscribe(() => {
      MeteorObservable.autorun().subscribe(() => {
        if (this.chats) {
          this.chats.unsubscribe();
          this.chats = undefined;
        }

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
          ).map(chats => {
            chats.forEach(chat => {
              chat.title = '';
              chat.picture = '';

              const receiver = Users.findOne(chat.memberIds.find(memberId => memberId !== this.senderId));
              if (!receiver) return;

              chat.title = receiver.profile.name;
              chat.picture = receiver.profile.picture;
            });

            return chats;
          }).zone();
      });
    });
  }

  addChat(): void {
    const modal = this.modalCtrl.create(NewChatComponent);
    modal.present();
  }

  showOptions(): void {
    const popover = this.popoverCtrl.create(ChatsOptionsComponent, {}, {
      cssClass: 'options-popover'
    });

    popover.present();
  }

  showMessages(chat): void {
    this.navCtrl.push(MessagesPage, {chat});
  }

  removeChat(chat: Chat): void {
    MeteorObservable.call('removeChat', chat._id).subscribe({
      complete: () => {
        this.chats = this.chats.zone();
      },
      error: (e: Error) => {
        if (e) this.handleError(e);
      }
    });
  }

  private handleError(e: Error): void {
    console.error(e);

    const alert = this.alertCtrl.create({
      title: 'Oops!',
      message: e.message,
      buttons: ['OK']
    });

    alert.present();
  }
}
