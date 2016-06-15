import 'meteor-client-side';

import {Component} from '@angular/core';
import {ionicBootstrap, Platform, Alert} from 'ionic-angular';
import {METEOR_PROVIDERS} from 'angular2-meteor';
import {StatusBar} from 'ionic-native';
import {ChatsPage} from './pages/chats/chats'
import {LoginPage} from './pages/login/login';
import {UsersService} from './services/users-service';
import {ChatsService} from './services/chats-service';
import {MessagesService} from './services/messages-service';


@Component({
  template: '<ion-nav [root]="rootPage"></ion-nav>'
})
export class ChatApp {
  static parameters = [[Platform], [UsersService]]

  constructor(platform, users) {
    this.rootPage = users.active ? ChatsPage : LoginPage;

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
    });
  }
}

ionicBootstrap(ChatApp, [METEOR_PROVIDERS, UsersService, ChatsService, MessagesService], {
  // http://ionicframework.com/docs/v2/api/config/Config/
});
