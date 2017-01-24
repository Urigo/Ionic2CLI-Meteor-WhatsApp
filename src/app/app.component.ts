import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';
import { ChatsPage } from '../pages/chats/chats';
import { Meteor } from 'meteor/meteor';
import { LoginPage } from '../pages/login/login';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any;

  constructor(platform: Platform) {
    this.rootPage = Meteor.user() ? ChatsPage : LoginPage;

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      if (platform.is('cordova')) {
        StatusBar.styleDefault();
        Splashscreen.hide();
      }
    });
  }
}
