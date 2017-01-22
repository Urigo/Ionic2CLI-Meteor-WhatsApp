import { Component } from '@angular/core';
import { AlertController, Platform, ViewController } from 'ionic-angular';
import { Camera } from 'ionic-native';
import { PictureService } from '../../services/picture';

@Component({
  selector: 'messages-attachments',
  templateUrl: 'messages-attachments.html'
})
export class MessagesAttachmentsComponent {
  constructor(
    private alertCtrl: AlertController,
    private pictureService: PictureService,
    private platform: Platform,
    private viewCtrl: ViewController
  ) {}

  takePicture(): void {
    if (!this.platform.is('cordova')) {
      return console.warn('Device must run cordova in order to take pictures');
    }

    Camera.getPicture().then((dataURI) => {
      const blob = this.pictureService.convertDataURIToBlob(dataURI);

      this.viewCtrl.dismiss({
        selectedPicture: blob
      });
    });
  }

  sendPicture(): void {
    this.pictureService.select().then((file: File) => {
      this.viewCtrl.dismiss({
        selectedPicture: file
      });
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
