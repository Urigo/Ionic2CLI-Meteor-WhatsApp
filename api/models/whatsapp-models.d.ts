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
  }

  interface Message {
    _id?: string;
    chatId?: string;
    content?: string;
    createdAt?: Date;
    ownership?: string;
  }
}
