import {Component} from '@angular/core';
import {NavController, ViewController, Alert} from 'ionic-angular';
import {ProfilePage} from '../profile/profile';
import {LoginPage} from '../login/login';
import {UsersService} from '../../services/users-service';


@Component({
  templateUrl: 'build/pages/chats-options/chats-options.html'
})
export class ChatsOptionsPage {
  static parameters = [[NavController], [ViewController], [UsersService]]

  constructor(nav, view, users) {
    this.nav = nav;
    this.view = view;
    this.users = users;
  }

  editProfile() {
    this.nav.push(ProfilePage).then(this::this.dismiss);
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
            this.users.unsetActive().dispose();

            this.nav.rootNav.setRoot(LoginPage, null, {
              animate: true
            });
          }
        }
      ]
    });

    this.nav.present(alert).then(this::this.dismiss);
  }

  dismiss() {
    this.view.dismiss();
  }
}
