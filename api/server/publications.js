import {Meteor} from 'meteor/meteor';
import {Chats, Messages} from './collections';


Meteor.publish('users', function() {
  if (!this.userId) return;

  return Meteor.users.find({}, {
    fields: {profile: 1}
  });
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
          return Messages.find({chatId: chat._id}, {
            sort: {createdAt: -1},
            limit: 1
          });
        }
      },
      {
        find(chat) {
          return Meteor.users.find({
            _id: {$in: chat.memberIds}
          }, {
            fields: {profile: 1}
          });
        }
      }
    ]
  };
});

Meteor.publish('messages', function(chatId) {
  if (!this.userId) return;
  if (!chatId) return;

  return Messages.find({chatId});
});