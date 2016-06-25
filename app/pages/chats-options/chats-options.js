import {Component, NgZone} from '@angular/core';
import {NavController, ViewController, Alert} from 'ionic-angular';
import {Meteor} from 'meteor/meteor';
import {ProfilePage} from '../profile/profile';
import {LoginPage} from '../login/login';


@Component({
  templateUrl: 'build/pages/chats-options/chats-options.html'
})
export class ChatsOptionsPage {
  static parameters = [[NavController], [ViewController], [NgZone]]

  constructor(nav, view, zone) {
    this.nav = nav;
    this.view = view;
    this.zone = zone;
  }

  editProfile() {
    this.dismiss().then(() => {
      this.nav.push(ProfilePage);
    });
  }

  logout() {
    const alert = Alert.create({
      title: 'Logout',
      message: 'Are you sure you would like to proceed?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: this::this.handleLogout
        }
      ]
    });

    this.dismiss().then(() => {
      this.nav.present(alert);
    });
  }

  dismiss() {
    return this.view.dismiss({}, {}, {
      animate: false
    });
  }

  handleLogout() {
    Meteor.logout((e) => {
      this.zone.run(() => {
        if (e) return this.handleError(e);

        this.nav.rootNav.setRoot(LoginPage, {}, {
          animate: true
        });
      });
    });
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
