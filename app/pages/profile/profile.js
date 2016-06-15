import {Component} from '@angular/core';
import {NavController, Alert} from 'ionic-angular';
import {TabsPage} from '../tabs/tabs';
import {UsersService} from '../../services/users-service';


@Component({
  templateUrl: 'build/pages/profile/profile.html'
})
export class ProfilePage {
  static parameters = [[NavController], [UsersService]]

  constructor(nav, users) {
    this.nav = nav;
    this.activeUser = users.active;
    this.username = this.activeUser.name;
    this.profilePic = this.activeUser.picture;
  }

  goToTabsPage() {
    try {
      this.verifyUsername();
      this.verifyProfilePic();
    }
    catch (e) {
      return this.handleError(e);
    }

    this.activeUser.name = this.username;
    this.activeUser.picture = this.profilePic;
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
