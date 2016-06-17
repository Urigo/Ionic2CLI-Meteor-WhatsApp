import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
import {Chats, Messages} from './collections';


Meteor.methods({
  addChat(recipientId) {
    if (!this.userId) throw new Meteor.Error('not-logged-in',
      'User must be logged-in to create a new chat');

    check(recipientId, String);

    const recipientExists = !!Chats.find(recipientId).count();

    if (!recipientExists) throw new Meteor.Error('recipient-not-exist',
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

    const chatExists = !!Chats.find(chatId).count() &&
      chat.memberIds.includes(this.userId);

    if (!chatExists) throw new Meteor.Error('chat-not-exist',
      'Chat doesn\'t exist');

    Messages.remove({chatId: chatId});
    return Chats.remove({_id: chatId});
  },

  addMessage(chatId, content) {
    if (!this.userId) throw new Meteor.Error('not-logged-in',
      'User must be logged-in to create a new message');

    check(chatId, String);
    check(content, String);

    const chatExists = !!Chats.find(chatId).count() &&
      chat.memberIds.includes(this.userId);

    if (!chatExists) throw new Meteor.Error('chat-not-exist',
      'Chat doesn\'t exist');

    return Messages.insert({
      addresseeId: this.userId,
      chatId: chatId,
      content: content,
      createdAt: new Date()
    });
  }
});