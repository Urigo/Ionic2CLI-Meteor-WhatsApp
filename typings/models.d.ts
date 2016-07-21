declare module 'api/models' {
  interface Profile {
    name?: string;
    picture?: string;
  }

  interface Chat {
    _id?: string;
    memberIds?: Array<string>;
    title?: string;
    picture?: string;
    lastMessage?: Message;
    receiverComp?: Tracker.Computation;
    lastMessageComp?: Tracker.Computation;
  }

  interface Message {
    _id?: string;
    chatId?: string;
    senderId?: string;
    ownership?: string;
    content?: string;
    createdAt?: Date;
  }
}