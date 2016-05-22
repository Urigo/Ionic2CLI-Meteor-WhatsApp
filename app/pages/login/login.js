import {Page, NavController} from 'ionic-angular';
import {VerificationPage} from '../verification/verification';


@Page({
  templateUrl: 'build/pages/login/login.html'
})
export class LoginPage {
  static get parameters() {
    return [[NavController]];
  }

  constructor(nav) {
    this.nav = nav;
    this.phone = '';
  }

  onInputKeypress({ keyCode }) {
    if (keyCode == 13) {
      this.login();
    }
  }

  login() {
    this.nav.push(VerificationPage);
  }
}
