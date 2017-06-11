import { User, Message, Chat, Picture } from './models';
import { Users } from './collections/users';
import { Messages } from './collections/messages';
import { Chats } from './collections/chats';
import { Pictures } from './collections/pictures';
import { facebookService } from "./services/facebook";

Meteor.publishComposite('users', function(
  pattern: string,
  contacts: string[]
): PublishCompositeConfig<User> {
  if (!this.userId) {
    return;
  }

  let selector = {};

  var facebookFriendsIds: string[] = [];
  if (Users.collection.findOne({'_id': this.userId}).services.facebook) {
    //FIXME: add definitions for the promise Meteor package
    //TODO: handle error: token may be expired
    const accessToken = (<any>Promise).await(facebookService.getAccessToken(this.userId));
    //TODO: handle error: user may have denied permissions
    const facebookFriends = (<any>Promise).await(facebookService.getFriends(accessToken));
    facebookFriendsIds = facebookFriends.map((friend) => friend.id);
  }

  if (pattern) {
    selector = {
      'profile.name': { $regex: pattern, $options: 'i' },
      $or: [
        {'phone.number': {$in: contacts}},
        {'services.facebook.id': {$in: facebookFriendsIds}},
        {'profile.name': {$in: ['Ethan Gonzalez', 'Bryan Wallace', 'Avery Stewart', 'Katie Peterson', 'Ray Edwards']}}
      ]
    };
  } else {
    selector = {
      $or: [
        {'phone.number': {$in: contacts}},
        {'services.facebook.id': {$in: facebookFriendsIds}},
        {'profile.name': {$in: ['Ethan Gonzalez', 'Bryan Wallace', 'Avery Stewart', 'Katie Peterson', 'Ray Edwards']}}
      ]
    }
  }

  return {
    find: () => {
      return Users.collection.find(selector, {
        fields: { profile: 1 },
        limit: 15
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

Meteor.publish('user', function () {
  if (!this.userId) {
    return;
  }

  const profile = Users.findOne(this.userId).profile || {};

  return Pictures.collection.find({
    _id: profile.pictureId
  });
});
