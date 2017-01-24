import { User, Message, Chat } from './models';
import { Users } from './collections/users';
import { Messages } from './collections/messages';
import { Chats } from './collections/chats';

Meteor.publishComposite('users', function(
  pattern: string
): PublishCompositeConfig<User> {
  if (!this.userId) {
    return;
  }

  let selector = {};

  if (pattern) {
    selector = {
      'profile.name': { $regex: pattern, $options: 'i' }
    };
  }

  return {
    find: () => {
      return Users.collection.find(selector, {
        fields: { profile: 1 },
        limit: 15
      });
    }
  };
});

Meteor.publish('messages', function(
  chatId: string,
  messagesBatchCounter: number): Mongo.Cursor<Message> {
  if (!this.userId || !chatId) {
    return;
  }

  return Messages.collection.find({
    chatId
  }, {
    sort: { createdAt: -1 },
    limit: 30 * messagesBatchCounter
  });
});

Meteor.publishComposite('chats', function(): PublishCompositeConfig<Chat> {
  if (!this.userId) {
    return;
  }

  return {
    find: () => {
      return Chats.collection.find({ memberIds: this.userId });
    },

    children: [
      <PublishCompositeConfig1<Chat, Message>> {
        find: (chat) => {
          return Messages.collection.find({ chatId: chat._id }, {
            sort: { createdAt: -1 },
            limit: 1
          });
        }
      },
      <PublishCompositeConfig1<Chat, User>> {
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
