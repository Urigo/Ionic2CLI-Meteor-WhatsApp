import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { initMethods } from './methods';
import { initPublications } from './publications';
import { Pictures, Users } from './collections';

Meteor.startup(() => {
  initMethods();
  initPublications();

  if (Meteor.settings) {
    Object.assign(Accounts._options, Meteor.settings['accounts-phone']);
    SMS.twilio = Meteor.settings['twilio'];
  }

  if (Users.collection.find().count()) return;

  let pictureId;

  pictureId = Pictures.collection.insert({
    url: 'https://randomuser.me/api/portraits/thumb/men/1.jpg'
  });

  Accounts.createUserWithPhone({
    phone: '+972540000001',
    profile: {
      name: 'Ethan Gonzalez',
      pictureId: pictureId
    }
  });

  pictureId = Pictures.collection.insert({
    url: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg'
  });

  Accounts.createUserWithPhone({
    phone: '+972540000002',
    profile: {
      name: 'Bryan Wallace',
      pictureId: pictureId
    }
  });

  pictureId = Pictures.collection.insert({
    url: 'https://randomuser.me/api/portraits/thumb/women/1.jpg'
  });

  Accounts.createUserWithPhone({
    phone: '+972540000003',
    profile: {
      name: 'Avery Stewart',
      pictureId: pictureId
    }
  });

  pictureId = Pictures.collection.insert({
    url: 'https://randomuser.me/api/portraits/thumb/women/2.jpg'
  });

  Accounts.createUserWithPhone({
    phone: '+972540000004',
    profile: {
      name: 'Katie Peterson',
      pictureId: pictureId
    }
  });

  pictureId = Pictures.collection.insert({
    url: 'https://randomuser.me/api/portraits/thumb/men/2.jpg'
  });

  Accounts.createUserWithPhone({
    phone: '+972540000005',
    profile: {
      name: 'Ray Edwards',
      pictureId: pictureId
    }
  });
});
