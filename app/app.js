import 'meteor-client-side';
import 'accounts-base-client-side';
import 'accounts-phone';
import 'api/methods';

import {Component} from '@angular/core';
import {Platform, ionicBootstrap} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {METEOR_PROVIDERS} from 'angular2-meteor';
import {Meteor} from 'meteor/meteor';
import {Tracker} from 'meteor/tracker';
import {LoginPage} from './pages/login/login';
import {TabsPage} from './pages/tabs/tabs';

import checkPack from 'meteor/check';
import ejsonPack from 'meteor/ejson';

Object.assign(window,
  checkPack,
  ejsonPack
);


@Component({
  template: '<ion-nav [root]="rootPage"></ion-nav>'
})
export class Whatsapp {
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

  ionicBootstrap(Whatsapp, [METEOR_PROVIDERS]);
});
