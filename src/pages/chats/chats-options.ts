import { Component } from '@angular/core';
import { AlertController, NavController, ViewController } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { ProfilePage } from '../profile/profile';

@Component({
  selector: 'chats-options',
  templateUrl: 'chats-options.html'
})
export class ChatsOptionsComponent {
  constructor(
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public viewCtrl: ViewController
  ) {}

  editProfile(): void {
    this.viewCtrl.dismiss().then(() => {
      this.navCtrl.push(ProfilePage);
    });
  }

  logout(): void {
    const alert = this.alertCtrl.create({
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
      alert.present();
    });
  }

  private handleLogout(alert): void {
    Meteor.logout((e: Error) => {
      alert.dismiss().then(() => {
        if (e) return this.handleError(e);

        this.navCtrl.setRoot(LoginPage, {}, {
          animate: true
        });
      });
    });
  }

  private handleError(e: Error): void {
    console.error(e);

    const alert = this.alertCtrl.create({
      title: 'Oops!',
      message: e.message,
      buttons: ['OK']
    });

    alert.present();
  }
}
