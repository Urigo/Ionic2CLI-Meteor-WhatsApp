declare module 'api/models/whatsapp' {
  interface Profile {
    name?: string;
    pictureId?: string;
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
