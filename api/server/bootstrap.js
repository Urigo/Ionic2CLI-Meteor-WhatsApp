import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';
import {Chats, Messages} from './collections';


Meteor.startup(function() {
  if (Meteor.users.find().count() != 0) return;

  Accounts.createUserWithPhone({
    phone: '+9725400000',
    profile: {
      name: 'Ethan Gonzalez',
      picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg'
    }
  });

  Accounts.createUserWithPhone({
    phone: '+9725400001',
    profile: {
      name: 'Bryan Wallace',
      picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg'
    }
  });

  Accounts.createUserWithPhone({
    phone: '+9725400002',
    profile: {
      name: 'Avery Stewart',
      picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg'
    }
  });

  Accounts.createUserWithPhone({
    phone: '+9725400003',
    profile: {
      name: 'Katie Peterson',
      picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg'
    }
  });

  Accounts.createUserWithPhone({
    phone: '+9725400004',
    profile: {
      name: 'Ray Edwards',
      picture: 'https://randomuser.me/api/portraits/thumb/men/2.jpg'
    }
  });
});