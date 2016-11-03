import { Component, OnInit, NgZone } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { Accounts } from 'meteor/accounts-base';
import { ProfileComponent } from "../profile/profile";

@Component({
  selector: 'verification',
  templateUrl: 'verification.html'
})
export class VerificationComponent implements OnInit {
  code: string = '';
  phone: string;

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public zone: NgZone,
    public navParams: NavParams
  ) {}

  ngOnInit() {
    this.phone = this.navParams.get('phone');
  }

  onInputKeypress({keyCode}: KeyboardEvent): void {
    if (keyCode == 13) {
      this.verify();
    }
  }

  verify(): void {
    Accounts.verifyPhone(this.phone, this.code, (e: Error) => {
      this.zone.run(() => {
        if (e) return this.handleError(e);

        this.navCtrl.setRoot(ProfileComponent, {}, {
          animate: true
        });
      });
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
