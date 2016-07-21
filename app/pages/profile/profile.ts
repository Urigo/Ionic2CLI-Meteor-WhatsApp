import {Component} from '@angular/core';
import {NavController, Alert} from 'ionic-angular';
import {MeteorComponent} from 'angular2-meteor';
import {Meteor} from 'meteor/meteor';
import {Profile} from 'api/models';
import {TabsPage} from '../tabs/tabs';


@Component({
  templateUrl: 'build/pages/profile/profile.html'
})
export class ProfilePage extends MeteorComponent {
  profile: Profile;

  constructor(private navCtrl: NavController) {
    super();

    this.profile = Meteor.user().profile || {
      name: '',
      picture: '/ionicons/svg/ios-contact.svg'
    };
  }

  done(): void {
    this.call('updateProfile', this.profile, (e: Error) => {
      if (e) return this.handleError(e);
      this.navCtrl.push(TabsPage);
    });
  }

  private handleError(e: Error): void {
    console.error(e);

    const alert = Alert.create({
      title: 'Oops!',
      message: e.message,
      buttons: ['OK']
    });

    this.navCtrl.present(alert);
  }
}
