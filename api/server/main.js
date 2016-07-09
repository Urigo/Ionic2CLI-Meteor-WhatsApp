import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';
import {Chats, Messages} from './collections';


Meteor.startup(function() {
  if (Meteor.users.find().count()) return;

  Accounts.createUserWithPhone({
    phone: '+972540000001',
    profile: {
      name: 'Ethan Gonzalez',
      picture: '/profile-pics/man1.jpg'
    }
  });

  Accounts.createUserWithPhone({
    phone: '+972540000002',
    profile: {
      name: 'Bryan Wallace',
      picture: '/profile-pics/lego1.jpg'
    }
  });

  Accounts.createUserWithPhone({
    phone: '+972540000003',
    profile: {
      name: 'Avery Stewart',
      picture: '/profile-pics/woman1.jpg'
    }
  });

  Accounts.createUserWithPhone({
    phone: '+972540000004',
    profile: {
      name: 'Katie Peterson',
      picture: '/profile-pics/woman2.jpg'
    }
  });

  Accounts.createUserWithPhone({
    phone: '+972540000005',
    profile: {
      name: 'Ray Edwards',
      picture: '/profile-pics/man2.jpg'
    }
  });
});