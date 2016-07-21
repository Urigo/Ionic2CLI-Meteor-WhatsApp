import {Mongo} from 'meteor/mongo';
import {Chat, Message} from 'api/models';


export const Chats = new Mongo.Collection<Chat>('chats');
export const Messages = new Mongo.Collection<Message>('messages');
