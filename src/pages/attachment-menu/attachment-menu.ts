import { Component } from '@angular/core';
import { NavController, ViewController, AlertController } from 'ionic-angular';
import {NewLocationMessageComponent} from '../location-message/location-message';

@Component({
  selector: 'attachment-menu',
  templateUrl: 'attachment-menu.html'
})
export class AttachmentMenuComponent {
  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public alertCtrl: AlertController
  ) {}

  openLocationMenu() {
    this.viewCtrl.dismiss().then(() => {
      this.navCtrl.push(NewLocationMessageComponent);
    });
  }
}
