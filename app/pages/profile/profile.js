import {Component} from '@angular/core';
import {NavController, Alert} from 'ionic-angular';
import {MeteorComponent} from 'angular2-meteor';
import {Meteor} from 'meteor/meteor';
import {TabsPage} from '../tabs/tabs';


@Component({
  templateUrl: 'build/pages/profile/profile.html'
})
export class ProfilePage extends MeteorComponent {
  static parameters = [[NavController]]

  constructor(nav) {
    super();

    this.nav = nav;

    this.profile = Meteor.user().profile || {
      name: '',
      picture: '/profile-pics/ios-contact.svg'
    };
  }

  done() {
    this.call('updateProfile', this.profile, ([e]) => {
      if (e) return this.handleError(e);
      this.nav.push(TabsPage);
    }, true);
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
