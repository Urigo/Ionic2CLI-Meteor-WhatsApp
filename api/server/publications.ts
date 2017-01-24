import { User } from './models';
import { Users } from './collections/users';

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
