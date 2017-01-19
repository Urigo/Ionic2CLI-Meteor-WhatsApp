import { Component, OnInit } from '@angular/core';
import { Chats, Messages, Pictures, Users } from 'api/collections';
import { Chat } from 'api/models';
import { AlertController, ModalController, NavController, PopoverController } from 'ionic-angular';
import { MeteorObservable } from 'meteor-rxjs';
import { Observable } from 'rxjs';
import { MessagesPage } from '../messages/messages';
import { ChatsOptionsComponent } from './chats-options';
import { NewChatComponent } from './new-chat';

@Component({
  templateUrl: 'chats.html'
})
export class ChatsPage implements OnInit {
  chats;
  senderId: string;

  constructor(
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public popoverCtrl: PopoverController
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

              const receiverId = chat.memberIds.find(memberId => memberId !== this.senderId);
              const receiver = Users.findOne(receiverId);
              if (!receiver) return;

              chat.title = receiver.profile.name;
              chat.picture = Pictures.getPictureUrl(receiver.profile.pictureId);
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
      cssClass: 'options-popover chats-options-popover'
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
