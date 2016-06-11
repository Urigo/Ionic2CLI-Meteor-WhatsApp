import {Page, NavController, Alert} from 'ionic-angular';
import {TabsPage} from '../tabs/tabs';
import {UsersData} from '../../data-providers/users-data';


@Page({
  templateUrl: 'build/pages/profile/profile.html'
})
export class ProfilePage {
  static parameters = [[NavController], [UsersData]]

  constructor(nav, users) {
    this.nav = nav;
    this.currentUser = users.current;
    this.username = this.currentUser.name;
    this.profilePic = this.currentUser.picture;
  }

  goToTabsPage() {
    try {
      this.verifyUsername();
      this.verifyProfilePic();
    }
    catch (e) {
      return this.handleError(e);
    }

    this.currentUser.name = this.username;
    this.currentUser.picture = this.profilePic;
    this.nav.push(TabsPage);
  }

  verifyUsername() {
    if (typeof this.username != 'string' || !this.username.length) {
      throw Error('User name is invalid');
    }
  }

  verifyProfilePic() {
    if (typeof this.profilePic != 'string' || !this.profilePic.length) {
      throw Error('Profile picture is invalid');
    }
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
