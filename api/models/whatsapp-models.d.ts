declare module 'api/models/whatsapp-models' {
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
  }
}
