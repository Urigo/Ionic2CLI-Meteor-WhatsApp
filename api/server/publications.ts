import { User, Message } from './models';
import { Users } from './collections/users';
import { Messages } from './collections/messages';

Meteor.publish('users', function(): Mongo.Cursor<User> {
  if (!this.userId) {
    return;
  }

  return Users.collection.find({}, {
    fields: {
      profile: 1
    }
  });
});

Meteor.publish('messages', function(chatId: string): Mongo.Cursor<Message> {
  if (!this.userId || !chatId) {
    return;
  }

  return Messages.collection.find({
    chatId
  }, {
    sort: { createdAt: -1 }
  });
});
