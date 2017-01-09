import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { UploadFS } from 'meteor/jalik:ufs';
import { Profile } from 'api/models/whatsapp';
import { Picture } from 'api/models/ufs';
import { Chats, Messages } from './collections/whatsapp';
import { Pictures } from './collections/ufs';

const nonEmptyString = Match.Where((str) => {
  check(str, String);
  return str.length > 0;
});

export function initMethods() {
  Meteor.methods({
    addChat(receiverId: string): void {
      if (!this.userId) throw new Meteor.Error('unauthorized',
        'User must be logged-in to create a new chat');

      check(receiverId, nonEmptyString);

      if (receiverId == this.userId) throw new Meteor.Error('illegal-receiver',
        'Receiver must be different than the current logged in user');

      const chatExists = !!Chats.collection.find({
        memberIds: { $all: [this.userId, receiverId] }
      }).count();

      if (chatExists) throw new Meteor.Error('chat-exists',
        'Chat already exists');

      const chat = {
        memberIds: [this.userId, receiverId]
      };

      Chats.insert(chat);
    },

    removeChat(chatId: string): void {
      if (!this.userId) throw new Meteor.Error('unauthorized',
        'User must be logged-in to remove chat');

      check(chatId, nonEmptyString);

      const chatExists = !!Chats.collection.find(chatId).count();

      if (!chatExists) throw new Meteor.Error('chat-not-exists',
        'Chat doesn\'t exist');

      Messages.remove({chatId});
      Chats.remove(chatId);
    },

    updateProfile(profile: Profile): void {
      if (!this.userId) throw new Meteor.Error('unauthorized',
        'User must be logged-in to create a new chat');

      check(profile, {
        name: nonEmptyString,
        pictureId: nonEmptyString
      });

      Meteor.users.update(this.userId, {
        $set: { profile }
      });
    },

    removePicture(pictureId: string): void {
      check(pictureId, String);
      Pictures.collection.remove(pictureId);
    },

    addMessage(chatId: string, content: string): Object {
      if (!this.userId) throw new Meteor.Error('unauthorized',
        'User must be logged-in to create a new chat');

      check(chatId, nonEmptyString);
      check(content, nonEmptyString);

      const chatExists = !!Chats.collection.find(chatId).count();

      if (!chatExists) throw new Meteor.Error('chat-not-exists',
        'Chat doesn\'t exist');

      return {
        messageId: Messages.collection.insert({
          senderId: this.userId,
          chatId: chatId,
          content: content,
          createdAt: new Date()
        })
      }
    },

    countMessages(): number {
      return Messages.collection.find().count();
    }
  });
}
