import {Component} from '@angular/core';
import {NavController, Alert} from 'ionic-angular';
import {Accounts} from 'meteor/accounts-base';
import {VerificationPage} from '../verification/verification';


@Component({
  templateUrl: 'build/pages/login/login.html'
})
export class LoginPage {
  static parameters = [[NavController]]

  constructor(navCtrl) {
    this.navCtrl = navCtrl;

    this.phone = '';
  }

  onInputKeypress({keyCode}) {
    if (keyCode == 13) {
      this.login();
    }
  }

  login() {
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

  handleLogin(alert) {
    Accounts.requestPhoneVerification(this.phone, (e) => {
      alert.dismiss().then(() => {
        if (e) return this.handleError(e);

        this.navCtrl.push(VerificationPage, {
          phone: this.phone
        });
      });
    });
  }

  handleError(e) {
    console.error(e);

    const alert = Alert.create({
      title: 'Oops!',
      message: e.message,
      buttons: ['OK']
    });

    this.navCtrl.present(alert);
  }
}
