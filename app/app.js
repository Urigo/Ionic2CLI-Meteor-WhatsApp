import 'meteor-client-side';

import {App, Platform} from 'ionic-angular';
import {METEOR_PROVIDERS} from 'angular2-meteor';
import {StatusBar} from 'ionic-native';
import {TabsPage} from './pages/tabs/tabs';


@App({
  template: '<ion-nav [root]="rootPage"></ion-nav>',
  providers: [METEOR_PROVIDERS],
  config: {} // http://ionicframework.com/docs/v2/api/config/Config/
})
export class MyApp {
  static get parameters() {
    return [[Platform]];
  }

  constructor(platform) {
    this.rootPage = TabsPage;

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
    });
  }
}
