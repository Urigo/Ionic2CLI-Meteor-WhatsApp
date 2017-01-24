import { Component } from '@angular/core';
import { AlertController, Platform, ModalController, ViewController } from 'ionic-angular';

@Component({
  selector: 'messages-attachments',
  templateUrl: 'messages-attachments.html'
})
export class MessagesAttachmentsComponent {
  constructor(
    private alertCtrl: AlertController,
    private platform: Platform,
    private viewCtrl: ViewController,
    private modelCtrl: ModalController
  ) {}
}
