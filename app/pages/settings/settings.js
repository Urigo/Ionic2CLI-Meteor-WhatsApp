import {Component} from '@angular/core';
import {NavController, Alert} from 'ionic-angular';
import {ProfilePage} from '../profile/profile';
import {LoginPage} from '../login/login';
import {UsersData} from '../../data-providers/users-data';


@Component({
  templateUrl: 'build/pages/settings/settings.html'
})
export class SettingsPage {
  static parameters = [[NavController], [UsersData]]

  constructor(nav, users) {
    this.nav = nav;
    this.users = users;
  }

  editProfile() {
    this.nav.push(ProfilePage);
  }

  logout() {
    const alert = Alert.create({
      title: 'Logout',
      message: `Are you sure you would like to proceed?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            delete this.users.current;

            this.nav.rootNav.setRoot(LoginPage, null, {
              animate: true
            });
          }
        }
      ]
    });

    this.nav.present(alert);
  }
}
