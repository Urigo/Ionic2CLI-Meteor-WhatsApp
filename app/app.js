import 'meteor-client-side';
import 'accounts-base-client-side';
import 'accounts-phone';
import 'api/collections';
import 'api/methods';

import {Component} from '@angular/core';
import {ionicBootstrap, Platform} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {METEOR_PROVIDERS} from 'angular2-meteor';
import {Meteor} from 'meteor/meteor';
import {Tracker} from 'meteor/tracker';
import {LoginPage} from './pages/login/login';
import {TabsPage} from './pages/tabs/tabs';


@Component({
  template: '<ion-nav [root]="rootPage"></ion-nav>'
})
export class MessengerApp {
  static parameters = [[Platform]]

  constructor(platform) {
    this.rootPage = Meteor.user() ? TabsPage : LoginPage;

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
    });
  }
}

Tracker.autorun((computation) => {
  if (Meteor.loggingIn()) return;
  computation.stop();

  ionicBootstrap(MessengerApp, [METEOR_PROVIDERS]);
});
