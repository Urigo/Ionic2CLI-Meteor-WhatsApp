import { Component } from '@angular/core';
import { AlertController, ViewController, ModalController } from 'ionic-angular';
import { PictureService } from '../../services/picture';
import { NewLocationMessageComponent } from '../location-message/location-message';

@Component({
  selector: 'messages-attachments',
  templateUrl: 'messages-attachments.html'
})
export class MessagesAttachmentsComponent {
  constructor(
    private alertCtrl: AlertController,
    private pictureService: PictureService,
    private viewCtrl: ViewController,
    private modelCtrl: ModalController
  ) {}

  sendPicture(): void {
    this.pictureService.select().then((file: File) => {
      this.viewCtrl.dismiss({
        selectedPicture: file
      });
    });
  }

  sendLocation(): void {
    const locationModal = this.modelCtrl.create(NewLocationMessageComponent);
    locationModal.onDidDismiss((location) => {
      console.log(location);
    });

    locationModal.present();
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
