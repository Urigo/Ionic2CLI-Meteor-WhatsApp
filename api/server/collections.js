import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';


Meteor.users.allow({
  update(userId, user, fields) {
    return userId == user._id &&
      fields.length == 1 &&
      fields[0] == 'profile';
  },

  fetch: ['_id']
});

export const Chats = new Mongo.Collection('chats', {
  transform(chat) {
    const recipientId = chat.memberIds.find(memberId => memberId != Meteor.user()._id);
    const recipient = Meteor.users.findOne(recipientId);

    const lastMessage = Messages.findOne({}, {
      sort: {createdAt: -1},
      transform: null
    });

    chat.addressee = Meteor.user();
    chat.recipient = recipient;
    chat.title = recipient.profile.name;
    chat.picture = recipient.profile.picture;
    chat.lastMessage = lastMessage;

    return chat;
  }
});

export const Messages = new Mongo.Collection('messages', {
  transform(message) {
    const chat = Chats.findOne(message.chatId);
    const addressee = Meteor.users.findOne(message.addresseeId);
    const recipientId = Chats.active.memberIds.find(memberId => memberId != addressee._id);
    const recipient = Meteor.users.findOne(recipientId);

    message.chat = Chats.active;
    message.addressee = addressee;
    message.recipient = recipient;
    message.ownership = Meteor.userId() == addressee._id ? 'mine' : 'others';

    return message;
  }
});
