import { MongoObservable } from "meteor-rxjs";
import { Meteor } from "meteor/meteor";

export const Chats = new MongoObservable.Collection("chats");
export const Messages = new MongoObservable.Collection("messages");
export const Users = MongoObservable.fromExisting(Meteor.users);
