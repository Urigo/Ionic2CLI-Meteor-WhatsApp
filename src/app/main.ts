import 'reflect-metadata';
import 'meteor-client-side';
import 'accounts-base-client-side';
import 'accounts-phone';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';

platformBrowserDynamic().bootstrapModule(AppModule);
