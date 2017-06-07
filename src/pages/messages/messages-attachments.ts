import { Component } from '@angular/core';
import { AlertController, ModalController, Platform, ViewController } from 'ionic-angular';
import { NewLocationMessageComponent } from './location-message';
import { MessageType } from 'api/models';
import { PictureService } from '../../services/picture';

@Component({
  selector: 'messages-attachments',
  templateUrl: 'messages-attachments.html'
})
export class MessagesAttachmentsComponent {
  constructor(
    private viewCtrl: ViewController,
    private modelCtrl: ModalController,
    private pictureService: PictureService,
    private platform: Platform,
    private alertCtrl: AlertController
  ) {}

  sendPicture(camera: boolean): void {
    if (camera && !this.platform.is('cordova')) {
      return console.warn('Device must run cordova in order to take pictures');
    }

    this.pictureService.getPicture(camera, false)
      .then((blob: File) => {
        this.viewCtrl.dismiss({
          messageType: MessageType.PICTURE,
          selectedPicture: blob
        });
      })
      .catch((e) => {
        this.handleError(e);
      });
  }

  sendLocation(): void {
    const locationModal = this.modelCtrl.create(NewLocationMessageComponent);
    locationModal.onDidDismiss((location) => {
      if (!location) {
        this.viewCtrl.dismiss();

        return;
      }

      this.viewCtrl.dismiss({
        messageType: MessageType.LOCATION,
        selectedLocation: location
      });
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
