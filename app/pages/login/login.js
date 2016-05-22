import {Page, NavController} from 'ionic-angular';
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
    // TODO: handle case where phone is invalid
    this.user.phone = this.phone;
    this.nav.push(VerificationPage);
  }
}
