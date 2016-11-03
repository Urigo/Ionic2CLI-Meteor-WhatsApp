import { Meteor } from 'meteor/meteor';
import {Chats, Messages} from "../collections/whatsapp-collections";

export function initMethods() {
  Meteor.methods({
    addMessage(chatId: string, content: string) {
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
