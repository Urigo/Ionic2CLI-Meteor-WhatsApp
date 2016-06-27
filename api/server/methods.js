import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
import {Chats, Messages} from './collections';


Meteor.methods({
  updateProfile(profile) {
    if (!this.userId) throw new Meteor.Error('logged-out',
      'User must be logged-in to create a new chat');

    check(profile, Object);

    Meteor.users.update(this.userId, {
      $set: {profile}
    });
  },

  addChat(recieverId) {
    if (!this.userId) throw new Meteor.Error('logged-out',
      'User must be logged-in to create a new chat');

    check(recieverId, String);

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
    if (!this.userId) throw new Meteor.Error('logged-out',
      'User must be logged-in to remove chat');

    check(chatId, String);

    const chatExists = !!Chats.find(chatId).count();

    if (!chatExists) throw new Meteor.Error('chat-not-exists',
      'Chat doesn\'t exist');

    Messages.remove({chatId: chatId});
    Chats.remove({_id: chatId});
  },

  addMessage(chatId, content) {
    if (!this.userId) throw new Meteor.Error('logged-out',
      'User must be logged-in to create a new message');

    check(chatId, String);
    check(content, String);

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