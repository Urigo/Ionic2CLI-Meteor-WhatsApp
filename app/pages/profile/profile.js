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
    this.profile = Meteor.user().profile;
  }

  done() {
    try {
      this.checkName();
      this.checkPicture();
    }
    catch (e) {
      return this.handleError(e);
    }

    this.call('updateProfile', this.profile);
    this.nav.push(TabsPage);
  }

  checkName() {
    if (!this.profile.name.length) {
      throw Error('Profile name is invalid');
    }
  }

  checkPicture() {
    if (!this.profile.picture.length) {
      throw Error('Profile picture is invalid');
    }
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
