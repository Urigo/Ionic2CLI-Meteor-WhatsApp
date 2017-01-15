declare module 'api/models/whatsapp-models' {
  interface Profile {
    name?: string;
    picture?: string;
  }

  interface Chat {
    _id?: string;
    title?: string;
    picture?: string;
    lastMessage?: Message;
    memberIds?: string[];
  }

  enum MessageType {
    TEXT,
    LOCATION
  }

  type TextMessage = Message & {
    messageType: MessageType.TEXT;
  }

  type LocationMessage = Message & {
    messageType: MessageType.LOCATION;
  }

  interface Message {
    _id?: string;
    chatId?: string;
    content?: string;
    createdAt?: Date;
    ownership?: string;
    senderId?: string;
  }

  interface User extends Meteor.User {
    profile?: Profile;
  }
}
