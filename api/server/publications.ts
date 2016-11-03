import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Users, Messages, Chats } from '../collections/whatsapp-collections';
import { User, Message, Chat } from 'api/models/whatsapp-models';

export function initPublications() {
  Meteor.publish('users', function(): Mongo.Cursor<User> {
    if (!this.userId) return;

    return Users.collection.find({}, {
      fields: {
        profile: 1
      }
    });
  });

  Meteor.publish('messages', function(chatId: string): Mongo.Cursor<Message> {
    if (!this.userId) return;
    if (!chatId) return;

    return Messages.collection.find({chatId});
  });

  Meteor.publishComposite('chats', function() {
    if (!this.userId) return;

    return {
      find: () => {
        return Chats.collection.find({memberIds: this.userId});
      },

      children: [
        {
          find: (chat) => {
            return Messages.collection.find({chatId: chat._id}, {
              sort: {createdAt: -1},
              limit: 1
            });
          }
        },
        {
          find: (chat) => {
            return Users.collection.find({
              _id: {$in: chat.memberIds}
            }, {
              fields: {profile: 1}
            });
          }
        }
      ]
    };
  });
}
