import { Component, OnInit } from '@angular/core';
import { Chats, Messages, Users, Pictures } from 'api/collections';
import { Chat, Message } from 'api/models';
import { NavController, PopoverController, ModalController, AlertController, Platform } from 'ionic-angular';
import { MeteorObservable } from 'meteor-rxjs';
import { Observable, Subscriber } from 'rxjs';
import { MessagesPage } from '../messages/messages';
import { ChatsOptionsComponent } from './chats-options';
import { NewChatComponent } from './new-chat';
import { FCM } from "@ionic-native/fcm";

@Component({
  templateUrl: 'chats.html'
})
export class ChatsPage implements OnInit {
  chats;
  senderId: string;

  constructor(
    private navCtrl: NavController,
    private popoverCtrl: PopoverController,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private platform: Platform,
    private fcm: FCM) {
    this.senderId = Meteor.userId();
  }

  addChat(): void {
    const modal = this.modalCtrl.create(NewChatComponent);
    modal.present();
  }

  ngOnInit() {
    MeteorObservable.subscribe('chats').subscribe(() => {
      MeteorObservable.autorun().subscribe(() => {
        this.chats = this.findChats();
      });
    });

    // Notifications
    if (this.platform.is('cordova')) {
      //this.fcm.subscribeToTopic('news');

      this.fcm.getToken().then(token => {
        console.log("Registering FCM token on backend");
        MeteorObservable.call('saveFcmToken', token).subscribe({
          next: () => console.log("FCM Token saved"),
          error: err => console.error('Impossible to save FCM token: ', err)
        });
      });

      this.fcm.onNotification().subscribe(data => {
        if (data.wasTapped) {
          console.log("Received FCM notification in background");
        } else {
          console.log("Received FCM notification in foreground");
        }
      });

      this.fcm.onTokenRefresh().subscribe(token => {
        console.log("Updating FCM token on backend");
        MeteorObservable.call('saveFcmToken', token).subscribe({
          next: () => console.log("FCM Token updated"),
          error: err => console.error('Impossible to update FCM token: ' + err)
        });
      });
    }
  }

  findChats(): Observable<Chat[]> {
    // Find chats and transform them
    return Chats.find().map(chats => {
      chats.forEach(chat => {
        chat.title = '';
        chat.picture = '';

        const receiverId = chat.memberIds.find(memberId => memberId !== this.senderId);
        const receiver = Users.findOne(receiverId);

        if (receiver) {
          chat.title = receiver.profile.name;

          let platform = this.platform.is('android') ? "android" :
            this.platform.is('ios') ? "ios" : "";
          platform = this.platform.is('cordova') ? platform : "";

          chat.picture = Pictures.getPictureUrl(receiver.profile.pictureId, platform);
        }

        // This will make the last message reactive
        this.findLastChatMessage(chat._id).subscribe((message) => {
          chat.lastMessage = message;
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
            if (!messages.length) {
              return;
            }

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

  showMessages(chat): void {
    this.navCtrl.push(MessagesPage, {chat});
  }

  removeChat(chat: Chat): void {
    MeteorObservable.call('removeChat', chat._id).subscribe({
      error: (e: Error) => {
        if (e) {
          this.handleError(e);
        }
      }
    });
  }

  handleError(e: Error): void {
    console.error(e);

    const alert = this.alertCtrl.create({
      buttons: ['OK'],
      message: e.message,
      title: 'Oops!'
    });

    alert.present();
  }

  showOptions(): void {
    const popover = this.popoverCtrl.create(ChatsOptionsComponent, {}, {
      cssClass: 'options-popover chats-options-popover'
    });

    popover.present();
  }
}
