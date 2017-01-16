import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Chats, Messages, Pictures, Users } from './collections';
import { Chat, Message, Picture, User } from './models';

export function initPublications() {
  Meteor.publish('user', function () {
    if (!this.userId) return;

    const profile = Users.findOne(this.userId).profile || {};

    return Pictures.collection.find({
      _id: profile.pictureId
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

  Meteor.publishComposite('users', function(
    phoneNumbers?: number[]
  ): PublishCompositeConfig<User> {
    if (!this.userId) return;

    return {
      find: () => {
        const query = !phoneNumbers ? {} : {
          phone: { $in: phoneNumbers }
        };

        return Users.collection.find(query, {
          fields: {
            profile: 1
          }
        });
      },

      children: [
        <PublishCompositeConfig1<User, Picture>> {
          find: (user) => {
            return Pictures.collection.find(user.profile.pictureId, {
              fields: { url: 1 }
            });
          }
        }
      ]
    }
  });

  Meteor.publishComposite('chats', function(): PublishCompositeConfig<Chat> {
    if (!this.userId) return;

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
          },

          children: [
            <PublishCompositeConfig2<Chat, User, Picture>> {
              find: (user, chat) => {
                return Pictures.collection.find(user.profile.pictureId, {
                  fields: { url: 1 }
                });
              }
            }
          ]
        }
      ]
    };
  });
}
