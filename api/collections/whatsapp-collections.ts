import { MongoObservable } from "meteor-rxjs";

let Meteor = Package["meteor"].Meteor;

export const Chats = new MongoObservable.Collection("chats");
export const Messages = new MongoObservable.Collection("messages");
export const Users = MongoObservable.fromExisting(Meteor.users);
