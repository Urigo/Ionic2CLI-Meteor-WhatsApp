import { Component } from '@angular/core';
import { AlertController, NavController, NavParams, ViewController } from 'ionic-angular';
import { MeteorObservable } from 'meteor-rxjs';
import { ChatsPage } from '../chats/chats';

@Component({
  selector: 'messages-options',
  templateUrl: 'messages-options.html'
})
export class MessagesOptionsComponent {
  constructor(
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public params: NavParams,
    public viewCtrl: ViewController
  ) {}

  remove(): void {
    const alert = this.alertCtrl.create({
      title: 'Remove',
      message: 'Are you sure you would like to proceed?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            this.handleRemove(alert);
            return false;
          }
        }
      ]
    });

    this.viewCtrl.dismiss().then(() => {
      alert.present();
    });
  }

  private handleRemove(alert): void {
    MeteorObservable.call('removeChat', this.params.get('chat')._id).subscribe({
      next: () => {
        alert.dismiss().then(() => {
          this.navCtrl.setRoot(ChatsPage, {}, {
            animate: true
          });
        });
      },
      error: (e: Error) => {
        alert.dismiss().then(() => {
          if (e) {
            return this.handleError(e);
          }

          this.navCtrl.setRoot(ChatsPage, {}, {
            animate: true
          });
        });
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
