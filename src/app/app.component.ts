import {LoginPage} from '../pages/login/login';
import {TabsPage} from '../pages/tabs/tabs';
import {Component} from '@angular/core';
import {Platform} from 'ionic-angular';
import {Splashscreen, StatusBar} from 'ionic-native';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any;

  constructor(platform: Platform) {
    this.rootPage = Meteor.user() ? TabsPage : LoginPage;

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      if (window.hasOwnProperty('cordova')) {
        StatusBar.styleDefault();
        Splashscreen.hide();
      }
    });
  }
}
