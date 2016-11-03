import { Meteor } from 'meteor/meteor';
import { Chats, Messages } from "../collections/whatsapp-collections";
import { check, Match } from "meteor/check";

const nonEmptyString = Match.Where((str) => {
  check(str, String);
  return str.length > 0;
});

export function initMethods() {
  Meteor.methods({
    addMessage(chatId: string, content: string) {
      check(chatId, nonEmptyString);
      check(content, nonEmptyString);

      const chatExists = !!Chats.collection.find(chatId).count();

      if (!chatExists) throw new Meteor.Error('chat-not-exists',
        'Chat doesn\'t exist');

      return {
        messageId: Messages.collection.insert({
          chatId: chatId,
          content: content,
          createdAt: new Date()
        })
      }
    }
  });
}
