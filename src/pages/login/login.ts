import { Component, AfterContentInit } from '@angular/core';
import { Alert, AlertController, NavController } from 'ionic-angular';
import { PhoneService } from '../../services/phone';
import { VerificationPage } from '../verification/verification';

@Component({
  selector: 'login',
  templateUrl: 'login.html'
})
export class LoginPage implements AfterContentInit {
  private phone = '';

  constructor(
    private alertCtrl: AlertController,
    private phoneService: PhoneService,
    private navCtrl: NavController
  ) {}

  ngAfterContentInit() {
    this.phoneService.getNumber()
      .then((phone) => this.phone = phone)
      .catch((e) => console.error(e.message));
  }

  onInputKeypress({keyCode}: KeyboardEvent): void {
    if (keyCode === 13) {
      this.login();
    }
  }

  login(phone: string = this.phone): void {
    const alert = this.alertCtrl.create({
      title: 'Confirm',
      message: `Would you like to proceed with the phone number ${phone}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            this.handleLogin(alert);
            return false;
          }
        }
      ]
    });

    alert.present();
  }

  handleLogin(alert: Alert): void {
    alert.dismiss().then(() => {
      return this.phoneService.verify(this.phone);
    })
      .then(() => {
        this.navCtrl.push(VerificationPage, {
          phone: this.phone
        });
      })
    .catch((e) => {
      this.handleError(e);
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
