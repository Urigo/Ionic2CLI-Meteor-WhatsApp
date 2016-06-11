import {Page, NavController, NavParams, Alert} from 'ionic-angular';
import {ProfilePage} from '../profile/profile';
import {UsersData} from '../../data-providers/users-data';


@Page({
  templateUrl: 'build/pages/verification/verification.html'
})
export class VerificationPage {
  static parameters = [[NavController], [NavParams], [UsersData]]

  constructor(nav, params, users) {
    this.nav = nav;
    this.users = users;
    this.phone = params.get('phone');
  }

  onInputKeypress({keyCode}) {
    if (keyCode == 13) {
      this.verify();
    }
  }

  verify() {
    try {
      this.verifyCode();
    }
    catch (e) {
      return this.handleError(e);
    }

    this.users.current = this.users.add({
      phone: this.phone,
      picture: '/ionicons/dist/svg/ios-contact.svg'
    });

    this.nav.setRoot(ProfilePage, null, {
      animate: true
    });
  }

  verifyCode() {
    if (!/^\d{4}$/.test(this.code)) {
      throw Error('Verification code did not match');
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
