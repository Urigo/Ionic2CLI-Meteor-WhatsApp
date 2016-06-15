import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
import {Chats, Messages} from './collections';


Meteor.methods({
  updateUsername(name) {
    if (!this.userId) throw new Meteor.Error('not-logged-in',
      'User must be logged-in to update its name');

    check(name, String);

    if (name.length) throw Meteor.Error('name-required',
      'A name must be provided');

    return Meteor.users.update(this.userId, {
      $set: {'profile.name': name}
    });
  },

  newChat(recipientId) {
    if (!this.userId) throw new Meteor.Error('not-logged-in',
      'User must be logged-in to create a new chat');

    check(recipientId, String);
    const recipient = Meteor.users.findOne(recipientId);

    if (!recipient) throw new Meteor.Error('recipient-not-exist',
      'Recipient doesn\'t exist');

    const chat = {
      memberIds: [this.userId, recipientId],
      createdAt: new Date()
    };

    return Chats.insert(chat);
  },

  removeChat(chatId) {
    if (!this.userId) throw new Meteor.Error('not-logged-in',
      'User must be logged-in to remove chat');

    check(chatId, String);

    const chat = Chats.findOne(chatId);
    const chatExists = chat && _.include(chat.memberIds, this.userId);

    if (!chatExists) throw new Meteor.Error('chat-not-exist',
      'Chat doesn\'t exist');

    Messages.remove({chatId: chatId});
    return Chats.remove({_id: chatId});
  },

  newMessage(message) {
    if (!this.userId) throw new Meteor.Error('not-logged-in',
      'User must be logged-in to create a new message');

    check(message, {
      chatId: String,
      content: String
    });

    message.addresseeId = this.userId;
    message.createdAt = new Date();

    return Messages.insert(message);
  }
});