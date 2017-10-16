import { Component } from "@angular/core";
import { Alert, AlertController, NavController } from "ionic-angular";
import { PhoneService } from "../../services/phone";
import { ProfilePage } from "../profile/profile";
import { MeteorObservable } from "meteor-rxjs";
import { FbProfile } from "api/services/facebook";
import { Profile } from "api/models";

@Component({
  selector: 'facebook',
  templateUrl: 'facebook.html'
})
export class FacebookPage {

  constructor(private alertCtrl: AlertController,
              private phoneService: PhoneService,
              private navCtrl: NavController) {
  }

  cancel(): void {
    const alert: Alert = this.alertCtrl.create({
      title: 'Confirm',
      message: `Would you like to proceed without linking your account with Facebook?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            this.dontLink(alert);
            return false;
          }
        }
      ]
    });

    alert.present();
  }

  linkFacebook(): void {
    this.phoneService.linkFacebook()
      .then(() => {
        MeteorObservable.call('getFbProfile').subscribe({
          next: (fbProfile: FbProfile) => {
            const pathname = (new URL(fbProfile.pictureUrl)).pathname;
            const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
            const description = {name: filename};
            let profile: Profile = {name: fbProfile.name, pictureId: ""};
            MeteorObservable.call('ufsImportURL', fbProfile.pictureUrl, description, 'pictures')
              .map((value) => profile.pictureId = (<any>value)._id)
              .switchMapTo(MeteorObservable.call('updateProfile', profile))
              .subscribe({
                next: () => {
                  this.navCtrl.setRoot(ProfilePage, {}, {
                    animate: true
                  });
                },
                error: (e: Error) => {
                  this.handleError(e);
                }
              });
          },
          error: (e: Error) => {
            this.handleError(e);
          }
        });
      })
      .catch((e) => {
        this.handleError(e);
      });
  }

  dontLink(alert: Alert): void {
    alert.dismiss()
      .then(() => {
        this.navCtrl.setRoot(ProfilePage, {}, {
          animate: true
        });
      })
      .catch((e) => {
        this.handleError(e);
      });
  }

  handleError(e: Error): void {
    console.error(e);

    const alert = this.alertCtrl.create({
      title: 'Oops!',
      message: e.message,
      buttons: ['OK']
    });

    alert.present();
  }
}
