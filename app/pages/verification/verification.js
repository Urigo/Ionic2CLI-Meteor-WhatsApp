import {Component} from '@angular/core';
import {NavController, NavParams, Alert} from 'ionic-angular';
import {ProfilePage} from '../profile/profile';
import {UsersService} from '../../services/users-service';


@Component({
  templateUrl: 'build/pages/verification/verification.html'
})
export class VerificationPage {
  static parameters = [[NavController], [NavParams], [UsersService]]

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

    const user = this.users.add({
      phone: this.phone,
      picture: '/ionicons/dist/svg/ios-contact.svg'
    });

    this.users.setActive(user._id).store();

    this.nav.setRoot(ProfilePage, {}, {
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
