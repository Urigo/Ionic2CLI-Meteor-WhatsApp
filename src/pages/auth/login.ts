import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { VerificationComponent } from "../verification/verification";

@Component({
  selector: 'login',
  templateUrl: "login.html"
})
export class LoginComponent {
  phone = '';

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController
  ) {}

  onInputKeypress({keyCode}: KeyboardEvent): void {
    if (keyCode == 13) {
      this.login();
    }
  }

  login(): void {
    const alert = this.alertCtrl.create({
      title: 'Confirm',
      message: `Would you like to proceed with the phone number ${this.phone}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            this.handleLogin(alert);
            return false;
          }
        }
      ]
    });

    alert.present();
  }

  private handleLogin(alert): void {
    Accounts.requestPhoneVerification(this.phone, (e: Error) => {
      alert.dismiss().then(() => {
        if (e) return this.handleError(e);

        this.navCtrl.push(VerificationComponent, {
          phone: this.phone
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
