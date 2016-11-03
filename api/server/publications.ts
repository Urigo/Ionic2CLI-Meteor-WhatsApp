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

}
