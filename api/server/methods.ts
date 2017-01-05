import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { UploadFS } from 'meteor/jalik:ufs';
import { Profile } from 'api/models/whatsapp-models';
import { Chats, Messages } from '../collections/whatsapp-collections';
import { ImagesStore, Thumbs } from '../collections/images-collections';

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
        picture: nonEmptyString
      });

      Meteor.users.update(this.userId, {
        $set: { profile }
      });
    },

    uploadProfilePic(data: File): void {
      const file = {
        name: data.name,
        type: data.type,
        size: data.size,
      };

      const upload = Meteor.wrapAsync((options, callback) => {
        options = Object.assign({}, options, {
          onComplete: result => callback(result),
          onError: err => callback(null, err),
        });

        new UploadFS.Uploader(options).start();
      });

      upload({
        data: data,
        file: file,
        store: ImagesStore
      }, (err, result) => {
        if (err) throw new Meteor.Error('upload-failed', err.message);

        const thumbnail = Thumbs.collection.findOne({
          originalStore: 'images',
          originalId: result._id
        }, {
          fields: {
            _id: 0,
            url: 1
          }
        });

        Meteor.users.update(this.userId, {
          $set: {
            'profile.picture': result.url,
            'profile.thumbnail': thumbnail.url
          }
        });

        return Meteor.users.findOne(this.userId, {
          fields: { profile: 1 }
        });
      });
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
