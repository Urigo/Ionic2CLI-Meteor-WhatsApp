import 'reflect-metadata';
import 'meteor-client';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { MeteorObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { AppModule } from './app.module';

Meteor.startup(() => {
  const sub = MeteorObservable.autorun().subscribe(() => {
    if (Meteor.loggingIn()) return;

    setTimeout(() => {
      sub.unsubscribe();
    });

    platformBrowserDynamic().bootstrapModule(AppModule);
  });
});
