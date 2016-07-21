import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {Chat, Message} from 'api/models';
import {Chats, Messages} from './collections';


Meteor.publish('users', function(): Mongo.Cursor<Meteor.User> {
  if (!this.userId) return;

  return Meteor.users.find({}, {
    fields: {profile: 1}
  });
});

Meteor.publishComposite('chats', function(): PublishCompositeConfig<Chat> {
  if (!this.userId) return;

  return {
    find: () => {
      return Chats.find({memberIds: this.userId});
    },

    children: [
      <PublishCompositeConfig1<Chat, Message>> {
        find: (chat) => {
          return Messages.find({chatId: chat._id}, {
            sort: {createdAt: -1},
            limit: 1
          });
        }
      },
      <PublishCompositeConfig1<Chat, Meteor.User>> {
        find: (chat) => {
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

Meteor.publish('messages', function(chatId: string): Mongo.Cursor<Message> {
  if (!this.userId) return;
  if (!chatId) return;

  return Messages.find({chatId});
});