import {_} from 'meteor/underscore';
import {Meteor} from 'meteor/meteor';
import {Chats, Messages} from './collections';


Meteor.publish('potentialRecipients', function() {
  if (!this.userId) return;

  let query;
  let options;

  query = {
    memberIds: this.userId
  };

  options = {
    fields: {memberIds: 1}
  };

  let recipientIds = Chats.find(query, options).map(({memberIds}) => {
    return memberIds;
  });

  recipientIds = _.chain(recipientIds)
    .flatten()
    .uniq()
    .value()

  query = {
    _id: {$nin: recipientIds}
  };

  options = {
    fields: {profile: 1}
  };

  return Meteor.users.find(query, options);
});

Meteor.publishComposite('chats', function() {
  if (!this.userId) return;

  return {
    find() {
      return Chats.find({memberIds: this.userId});
    },

    children: [
      {
        find(chat) {
          return Messages.find({chatId: chat._id});
        }
      },
      {
        find(chat) {
          const query = {
            _id: {$in: chat.memberIds}
          };

          const options = {
            fields: {profile: 1}
          };

          return Meteor.users.find(query, options);
        }
      }
    ]
  };
});