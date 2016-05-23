import {Page, NavController, Alert} from 'ionic-angular';
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
    try {
      this.user.verify(this.code);
    }
    catch (e) {
      return this.handleError(e);
    }

    this.nav.push(TabsPage);
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
