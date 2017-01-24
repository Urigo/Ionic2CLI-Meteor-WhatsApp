import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Users } from './collections/users';

Meteor.startup(() => {
  if (Meteor.settings) {
    Object.assign(Accounts._options, Meteor.settings['accounts-phone']);
    SMS.twilio = Meteor.settings['twilio'];
  }

  if (Users.collection.find().count() > 0) {
    return;
  }

  Accounts.createUserWithPhone({
    phone: '+972540000001',
    profile: {
      name: 'Ethan Gonzalez',
      picture: 'https://randomuser.me/api/portraits/men/1.jpg'
    }
  });

  Accounts.createUserWithPhone({
    phone: '+972540000002',
    profile: {
      name: 'Bryan Wallace',
      picture: 'https://randomuser.me/api/portraits/lego/1.jpg'
    }
  });

  Accounts.createUserWithPhone({
    phone: '+972540000003',
    profile: {
      name: 'Avery Stewart',
      picture: 'https://randomuser.me/api/portraits/women/1.jpg'
    }
  });

  Accounts.createUserWithPhone({
    phone: '+972540000004',
    profile: {
      name: 'Katie Peterson',
      picture: 'https://randomuser.me/api/portraits/women/2.jpg'
    }
  });

  Accounts.createUserWithPhone({
    phone: '+972540000005',
    profile: {
      name: 'Ray Edwards',
      picture: 'https://randomuser.me/api/portraits/men/2.jpg'
    }
  });
});
