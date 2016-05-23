import {Page, NavController, Alert} from 'ionic-angular';
import {VerificationPage} from '../verification/verification';
import {UserData} from '../../providers/user-data';


@Page({
  templateUrl: 'build/pages/login/login.html'
})
export class LoginPage {
  static get parameters() {
    return [[NavController], [UserData]];
  }

  constructor(nav, user) {
    this.nav = nav;
    this.user = user;
  }

  onInputKeypress({ keyCode }) {
    if (keyCode == 13) {
      this.login();
    }
  }

  login() {
    try {
      this.user.phone = this.phone;
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
            this.nav.push(VerificationPage);
          }
        }
      ]
    });

    this.nav.present(alert);
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
