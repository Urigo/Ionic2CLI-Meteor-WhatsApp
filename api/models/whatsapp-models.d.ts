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
