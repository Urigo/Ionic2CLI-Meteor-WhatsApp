import { Component } from '@angular/core';
import { AlertController, ViewController } from 'ionic-angular';
import { PictureUploader } from '../../services/picture-uploader';

@Component({
  selector: 'messages-attachments',
  templateUrl: 'messages-attachments.html'
})
export class MessagesAttachmentsComponent {
  constructor(
    private alertCtrl: AlertController,
    private pictureUploader: PictureUploader,
    private viewCtrl: ViewController
  ) {}

  sendPicture(): void {
    this.pictureUploader.select().then((file: File) => {
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
