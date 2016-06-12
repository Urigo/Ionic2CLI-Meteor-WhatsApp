import {Component} from '@angular/core';
import {NavController, Alert} from 'ionic-angular';
import {VerificationPage} from '../verification/verification';


@Component({
  templateUrl: 'build/pages/login/login.html'
})
export class LoginPage {
  static parameters = [[NavController]]

  constructor(nav) {
    this.nav = nav;
  }

  onInputKeypress({keyCode}) {
    if (keyCode == 13) {
      this.login();
    }
  }

  login() {
    try {
      this.verifyPhone();
    }
    catch (e) {
      return this.handleError(e);
    }

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
            this.nav.push(VerificationPage, {
              phone: this.phone
            });
          }
        }
      ]
    });

    this.nav.present(alert);
  }

  verifyPhone() {
    if (!/^\+\d{10,12}$/.test(this.phone)) {
      throw Error('Phone number is invalid');
    }
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
