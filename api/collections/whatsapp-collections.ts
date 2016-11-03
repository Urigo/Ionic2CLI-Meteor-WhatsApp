import { MongoObservable } from "meteor-rxjs";

export const Chats = new MongoObservable.Collection("chats");
export const Messages = new MongoObservable.Collection("messages");
