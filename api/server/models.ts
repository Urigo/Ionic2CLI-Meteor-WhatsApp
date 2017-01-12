import { Meteor } from 'meteor/meteor';

export const DEFAULT_PICTURE_URL = '/ionicons/dist/svg/ios-contact.svg';

export interface Profile {
  name?: string;
  pictureId?: string;
}

export interface Message {
  _id?: string;
  chatId?: string;
  content?: string;
  createdAt?: Date;
  ownership?: string;
  senderId?: string;
}

export interface Chat {
  _id?: string;
  lastMessage?: Message;
  memberIds?: string[];
  picture?: string;
  title?: string;
}

export interface Picture {
  _id?: string;
  complete?: boolean;
  extension?: string;
  name?: string;
  progress?: number;
  size?: number;
  store?: string;
  token?: string;
  type?: string;
  uploadedAt?: Date;
  uploading?: boolean;
  url?: string;
  userId?: string;
}

export interface User extends Meteor.User {
  profile?: Profile;
}