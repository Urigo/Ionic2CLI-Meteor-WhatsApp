import 'reflect-metadata';
import 'meteor-client-side';
import 'accounts-base-client-side';
import 'accounts-phone';

import { platformBrowser } from '@angular/platform-browser';
import { enableProdMode } from '@angular/core';
import { AppModuleNgFactory } from './app.module.ngfactory';
import { MeteorObservable } from 'meteor-rxjs';

declare let Meteor;

Meteor.startup(() => {
  const sub = MeteorObservable.autorun().subscribe(() => {
    if (Meteor.loggingIn()) return;

    setTimeout(() => {
      sub.unsubscribe();
    });

    enableProdMode();
    platformBrowser().bootstrapModuleFactory(AppModuleNgFactory);
  });
});

