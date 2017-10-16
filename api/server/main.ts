import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
declare const ServiceConfiguration: any;

Meteor.startup(() => {
  if (Meteor.settings) {
    Object.assign(Accounts._options, Meteor.settings['accounts-phone']);
    SMS.twilio = Meteor.settings['twilio'];
  }

  // Configuring oAuth services
  const services = Meteor.settings.private.oAuth;

  if (services) {
    for (let service in services) {
      ServiceConfiguration.configurations.upsert({service: service}, {
        $set: services[service]
      });
    }
  }
});
