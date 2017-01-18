import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { Pictures } from './pictures';
import { User } from '../models';

export const Users = MongoObservable.fromExisting<User>(Meteor.users);

// Dispose unused profile pictures
Meteor.users.after.update(function (userId, doc, fieldNames, modifier, options) {
  if (doc.profile.pictureId != this.previous.profile.pictureId) {
    Pictures.collection.remove({ _id: doc.profile.pictureId });
  }
}, { fetchPrevious: true });

// Deny all client-side updates to user documents
Meteor.users.deny({
  update() { return true; }
});
