import {Component} from '@angular/core';
import {NavController, ViewController, Alert} from 'ionic-angular';
import {Meteor} from 'meteor/meteor';
import {ProfilePage} from '../profile/profile';
import {LoginPage} from '../login/login';


@Component({
  templateUrl: 'build/pages/chats-options/chats-options.html'
})
export class ChatsOptionsPage {
  static parameters = [[NavController], [ViewController]]

  constructor(navCtrl, viewCtrl) {
    this.navCtrl = navCtrl;
    this.viewCtrl = viewCtrl;
  }

  editProfile() {
    this.viewCtrl.dismiss().then(() => {
      this.navCtrl.push(ProfilePage);
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
          handler: () => {
            this.handleLogout(alert);
            return false;
          }
        }
      ]
    });

    this.viewCtrl.dismiss().then(() => {
      this.navCtrl.present(alert);
    });
  }

  handleLogout(alert) {
    Meteor.logout((e) => {
      alert.dismiss().then(() => {
        if (e) return this.handleError(e);

        this.navCtrl.rootNav.setRoot(LoginPage, {}, {
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

    this.navCtrl.present(alert);
  }
}
