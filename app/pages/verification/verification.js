import {Page, NavController} from 'ionic-angular';
import {TabsPage} from '../tabs/tabs';
import {UserData} from '../../providers/user-data';


@Page({
  templateUrl: 'build/pages/verification/verification.html'
})
export class VerificationPage {
  static get parameters() {
    return [[NavController], [UserData]];
  }

  constructor(nav, user) {
    this.nav = nav;
    this.user = user;
  }

  onInputKeypress({ keyCode }) {
    if (keyCode == 13) {
      this.verify();
    }
  }

  verify() {
    this.nav.push(TabsPage);
  }
}
