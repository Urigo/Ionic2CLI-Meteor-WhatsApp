import { Component } from '@angular/core';
import { NavController, ViewController, AlertController } from 'ionic-angular';
import { ProfileComponent } from '../profile/profile';
import { LoginComponent } from '../auth/login';

@Component({
  selector: 'chats-options',
  templateUrl: 'chat-options.html'
})
export class ChatsOptionsComponent {
  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public alertCtrl: AlertController
  ) {}

  editProfile(): void {
    this.viewCtrl.dismiss().then(() => {
      this.navCtrl.push(ProfileComponent);
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

        this.navCtrl.setRoot(LoginComponent, {}, {
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
