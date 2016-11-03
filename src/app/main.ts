import 'reflect-metadata';
import 'meteor-client-side';
import 'accounts-base-client-side';
import 'accounts-phone';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app.module';
import { MeteorObservable } from 'meteor-rxjs';

Meteor.startup(() => {
  const sub = MeteorObservable.autorun().subscribe(() => {
    if (Meteor.loggingIn()) return;

    setTimeout(() => {
      sub.unsubscribe();
    });

    platformBrowserDynamic().bootstrapModule(AppModule);
  });
});
