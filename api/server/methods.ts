import { Chats } from './collections/chats';
import { Messages } from './collections/messages';
import { MessageType } from './models';
import { check, Match } from 'meteor/check';

const nonEmptyString = Match.Where((str) => {
  check(str, String);
  return str.length > 0;
});

Meteor.methods({
  addMessage(type: MessageType, chatId: string, content: string) {
    check(type, Match.OneOf(String, [ MessageType.TEXT ]));
    check(chatId, nonEmptyString);
    check(content, nonEmptyString);

    const chatExists = !!Chats.collection.find(chatId).count();

    if (!chatExists) {
      throw new Meteor.Error('chat-not-exists',
        'Chat doesn\'t exist');
    }

    return {
      messageId: Messages.collection.insert({
        chatId: chatId,
        content: content,
        createdAt: new Date(),
        type: type
      })
    };
  }
});
