import {Component} from '@angular/core';
import {NavController, NavParams, Alert} from 'ionic-angular';
import {Accounts} from 'meteor/accounts-base';
import {ProfilePage} from '../profile/profile';


@Component({
  templateUrl: 'build/pages/verification/verification.html'
})
export class VerificationPage {
  static parameters = [[NavController], [NavParams]]

  constructor(nav, params) {
    this.nav = nav;
    this.phone = params.get('phone');
  }

  onInputKeypress({keyCode}) {
    if (keyCode == 13) {
      this.verify();
    }
  }

  verify() {
    Accounts.verifyPhone(this.phone, this.code, (e) => {
      if (e) return this.handleError(e);

      const profile = {
        name: '',
        picture: '/ionicons/dist/svg/ios-contact.svg'
      };

      Meteor.users.update(Meteor.userId(), {
        $set({profile})
      });

      this.nav.setRoot(ProfilePage, {}, {
        animate: true
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
