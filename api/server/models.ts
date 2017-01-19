import { Meteor } from 'meteor/meteor';

export const DEFAULT_PICTURE_URL = '/ionicons/dist/svg/ios-contact.svg';
export const DEFAULT_USERNAME = 'Whatsapp Newbie';

export enum MessageOwnership {
  MINE = <any>'mine',
  OTHER = <any>'other'
}

export enum MessageType {
  PICTURE = <any>'picture',
  TEXT = <any>'text',
  LOCATION = <any>'location'
}

export interface Profile {
  name?: string;
  pictureId?: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Message {
  _id?: string;
  chatId?: string;
  content?: string;
  createdAt?: Date;
  ownership?: MessageOwnership;
  senderId?: string;
  location?: Location;
  type?: MessageType;
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
