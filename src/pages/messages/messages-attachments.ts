import { Component } from '@angular/core';
import { ModalController, ViewController } from 'ionic-angular';
import { NewLocationMessageComponent } from './location-message';
import { MessageType } from 'api/models';

@Component({
  selector: 'messages-attachments',
  templateUrl: 'messages-attachments.html'
})
export class MessagesAttachmentsComponent {
  constructor(
    private viewCtrl: ViewController,
    private modelCtrl: ModalController
  ) {}

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
}
