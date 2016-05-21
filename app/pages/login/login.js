import {Page, NavController} from 'ionic-angular';
import {TabsPage} from '../tabs/tabs';


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
    this.nav.push(TabsPage);
  }
}
