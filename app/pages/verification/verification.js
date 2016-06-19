import {Component, NgZone} from '@angular/core';
import {NavController, NavParams, Alert} from 'ionic-angular';
import {MeteorComponent} from 'angular2-meteor';
import {Accounts} from 'meteor/accounts-base';
import {ProfilePage} from '../profile/profile';


@Component({
  templateUrl: 'build/pages/verification/verification.html'
})
export class VerificationPage extends MeteorComponent {
  static parameters = [[NavController], [NavParams], [NgZone]]

  constructor(nav, params, zone) {
    super();

    this.nav = nav;
    this.zone = zone;
    this.phone = params.get('phone');
  }

  onInputKeypress({keyCode}) {
    if (keyCode == 13) {
      this.verify();
    }
  }

  verify() {
    Accounts.verifyPhone(this.phone, this.code, (e) => {
      this.zone.run(() => {
        if (e) return this.handleError(e);

        this.nav.setRoot(ProfilePage, {}, {
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
