import {Meteor} from 'meteor/meteor';
import {check, Match} from 'meteor/check';
import {Chats, Messages} from './collections';


const nonEmptyString = Match.Where((str) => {
  check(str, String);
  return str.length > 0;
});

Meteor.methods({
  updateProfile(profile) {
    if (!this.userId) throw new Meteor.Error('unauthorized',
      'User must be logged-in to create a new chat');

    check(profile, {
      name: nonEmptyString,
      picture: nonEmptyString
    });

    Meteor.users.update(this.userId, {
      $set: {profile}
    });
  },

  addChat(recieverId) {
    if (!this.userId) throw new Meteor.Error('unauthorized',
      'User must be logged-in to create a new chat');

    check(recieverId, nonEmptyString);

    if (recieverId == this.userId) throw new Meteor.Error('illegal-reciever',
      'Reciever must be different than the current logged in user');

    const chatExists = !!Chats.find({
      memberIds: {$all: [this.userId, recieverId]}
    }).count();

    if (chatExists) throw new Meteor.Error('chat-exists',
      'Chat already exists');

    const chat = {
      memberIds: [this.userId, recieverId]
    };

    Chats.insert(chat);
  },

  removeChat(chatId) {
    if (!this.userId) throw new Meteor.Error('unauthorized',
      'User must be logged-in to remove chat');

    check(chatId, nonEmptyString);

    const chatExists = !!Chats.find(chatId).count();

    if (!chatExists) throw new Meteor.Error('chat-not-exists',
      'Chat doesn\'t exist');

    Messages.remove({chatId});
    Chats.remove(chatId);
  },

  addMessage(chatId, content) {
    if (!this.userId) throw new Meteor.Error('unauthorized',
      'User must be logged-in to create a new message');

    check(chatId, nonEmptyString);
    check(content, nonEmptyString);

    const chatExists = !!Chats.find(chatId).count();

    if (!chatExists) throw new Meteor.Error('chat-not-exists',
      'Chat doesn\'t exist');

    Messages.insert({
      senderId: this.userId,
      chatId: chatId,
      content: content,
      createdAt: new Date()
    });
  }
});