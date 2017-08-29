import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { User } from '../models';

export const Users = MongoObservable.fromExisting<User>(Meteor.users);

// Dispose unused profile pictures
Meteor.users.after.update(function (userId, doc, fieldNames, modifier, options) {
  if (!doc.profile) return;
  if (!this.previous.profile) return;
  if (doc.profile.pictureId == this.previous.profile.pictureId) return;
}, { fetchPrevious: true });
