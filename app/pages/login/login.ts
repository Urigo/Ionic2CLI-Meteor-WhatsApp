import {Component} from '@angular/core';
import {NavController, Alert} from 'ionic-angular';
import {Accounts} from 'meteor/accounts-base';
import {VerificationPage} from '../verification/verification';


@Component({
  templateUrl: 'build/pages/login/login.html'
})
export class LoginPage {
  phone = '';

  constructor(private navCtrl: NavController) {}

  onInputKeypress({keyCode}: KeyboardEvent): void {
    if (keyCode == 13) {
      this.login();
    }
  }

  login(): void {
    const alert = Alert.create({
      title: 'Confirm',
      message: `Would you like to proceed with the phone number ${this.phone}?`,
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

    this.navCtrl.present(alert);
  }

  private handleLogin(alert): void {
    Accounts.requestPhoneVerification(this.phone, (e: Error) => {
      alert.dismiss().then(() => {
        if (e) return this.handleError(e);

        this.navCtrl.push(VerificationPage, {
          phone: this.phone
        });
      });
    });
  }

  private handleError(e: Error): void {
    console.error(e);

    const alert = Alert.create({
      title: 'Oops!',
      message: e.message,
      buttons: ['OK']
    });

    this.navCtrl.present(alert);
  }
}
