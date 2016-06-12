import 'meteor-client-side';

import {Component} from '@angular/core';
import {ionicBootstrap, Platform, Alert} from 'ionic-angular';
import {METEOR_PROVIDERS} from 'angular2-meteor';
import {StatusBar} from 'ionic-native';
import {LoginPage} from './pages/login/login';
import {UsersData} from './data-providers/users-data';
import {ChatsData} from './data-providers/chats-data';
import {MessagesData} from './data-providers/messages-data';


@Component({
  template: '<ion-nav [root]="rootPage"></ion-nav>'
})
export class ChatApp {
  static parameters = [[Platform]]

  constructor(platform) {
    this.rootPage = LoginPage;

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
    });
  }
}

ionicBootstrap(ChatApp, [METEOR_PROVIDERS, UsersData, ChatsData, MessagesData], {
  // http://ionicframework.com/docs/v2/api/config/Config/
});
