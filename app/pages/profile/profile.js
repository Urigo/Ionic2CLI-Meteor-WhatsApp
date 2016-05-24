import {Page, NavController, Alert} from 'ionic-angular';
import {UserData} from '../../providers/user-data';
import {TabsPage} from '../tabs/tabs';


@Page({
  templateUrl: 'build/pages/profile/profile.html'
})
export class ProfilePage {
  static get parameters() {
    return [[NavController], [UserData]];
  }

  constructor(nav, user) {
    this.nav = nav;
    this.user = user;
    this.name = user.name;
    this.profilePic = user.picture;
  }

  goToTabsPage() {
    try {
      this.user.name = this.username;
      this.user.picture = this.profilePic;
    }
    catch (e) {
      return this.handleError(e);
    }

    this.nav.push(TabsPage);
  }

  handleError(e) {
    console.error(e);

    const alert = Alert.create({
      title: 'Profiling failed',
      message: e.message,
      buttons: ['OK']
    });

    this.nav.present(alert);
  }
}
