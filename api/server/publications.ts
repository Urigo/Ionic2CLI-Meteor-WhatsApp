import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { User, Message, Chat } from 'api/models/whatsapp-models';
import { Users, Messages, Chats } from '../collections/whatsapp-collections';

export function initPublications() {
  Meteor.publish('users', function(phoneNumbers?: number[]): Mongo.Cursor<User> {
    if (!this.userId) return;

    const query = !phoneNumbers ? {} : {
      phone: { $in: phoneNumbers }
    };

    return Users.collection.find(query, {
      fields: {
        profile: 1
      }
    });
  });

  Meteor.publish('messages', function(
    chatId: string,
    messagesBatchCounter: number
  ): Mongo.Cursor<Message> {
    if (!this.userId) return;
    if (!chatId) return;

    return Messages.collection.find({
      chatId
    }, {
      sort: { createdAt: -1 },
      limit: 30 * messagesBatchCounter
    });
  });

  Meteor.publishComposite('chats', function(): PublishCompositeConfig<Chat> {
    if (!this.userId) return;

    return {
      find: () => {
        return Chats.collection.find({ memberIds: this.userId });
      },

      children: [
        <PublishCompositeConfig1<Chat, Message>>{
          find: (chat) => {
            return Messages.collection.find({ chatId: chat._id }, {
              sort: { createdAt: -1 },
              limit: 1
            });
          }
        }, {
          find: (chat) => {
            return Users.collection.find({
              _id: { $in: chat.memberIds }
            }, {
              fields: { profile: 1 }
            });
          }
        }
      ]
    };
  });
}
