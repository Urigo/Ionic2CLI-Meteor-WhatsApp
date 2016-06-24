import 'meteor-client-side';
import 'accounts-base-client-side';
import 'accounts-phone';
import 'api/collections';
import 'api/methods';

import {Component} from '@angular/core';
import {ionicBootstrap, Platform, Alert} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {METEOR_PROVIDERS, MeteorComponent} from 'angular2-meteor';
import {Meteor} from 'meteor/meteor';
import {TabsPage} from './pages/tabs/tabs'
import {LoginPage} from './pages/login/login';


@Component({
  template: '<ion-nav [root]="rootPage"></ion-nav>'
})
export class MessengerApp extends MeteorComponent {
  static parameters = [[Platform]]

  constructor(platform, users) {
    super();

    this.autorun(([computation]) => {
      if (Meteor.loggingIn()) return;

      computation.stop();
      this.rootPage = Meteor.user() ? TabsPage : LoginPage;
    }, true);


    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
    });
  }
}

ionicBootstrap(MessengerApp, [METEOR_PROVIDERS], {
  // http://ionicframework.com/docs/v2/api/config/Config/
});
