import {Component, NgZone} from '@angular/core';
import {NavController, Alert} from 'ionic-angular';
import {Accounts} from 'meteor/accounts-base';
import {VerificationPage} from '../verification/verification';


@Component({
  templateUrl: 'build/pages/login/login.html'
})
export class LoginPage {
  static parameters = [[NavController], [NgZone]]

  constructor(nav, zone) {
    this.nav = nav;
    this.zone = zone;
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
          handler: this::this.handleLogin
        }
      ]
    });

    this.nav.present(alert);
  }

  handleLogin() {
    Accounts.requestPhoneVerification(this.phone, (e) => {
      this.zone.run(() => {
        if (e) return this.handleError(e);

        this.nav.push(VerificationPage, {
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

    this.nav.present(alert);
  }
}
