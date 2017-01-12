import { Component } from '@angular/core';
import { AlertController, NavController, NavParams, ViewController } from 'ionic-angular';

@Component({
  selector: 'messages-attachments',
  templateUrl: 'messages-attachments.html'
})
export class MessagesAttachmentsComponent {
  constructor(
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public params: NavParams,
    public viewCtrl: ViewController
  ) {}

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
