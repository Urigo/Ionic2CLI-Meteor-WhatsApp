import { Component } from '@angular/core';
import { ModalController, ViewController } from 'ionic-angular';

@Component({
  selector: 'messages-attachments',
  templateUrl: 'messages-attachments.html'
})
export class MessagesAttachmentsComponent {
  constructor(
    private viewCtrl: ViewController,
    private modelCtrl: ModalController
  ) {}
}
