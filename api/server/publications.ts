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

}
