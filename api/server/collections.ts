import { MongoObservable } from 'meteor-rxjs';
import { UploadFS } from 'meteor/jalik:ufs';
import { Meteor } from 'meteor/meteor';
import * as Sharp from 'sharp';
import { Picture } from './models';

export const Chats = new MongoObservable.Collection('chats');
export const Messages = new MongoObservable.Collection('messages');
export const Pictures = new MongoObservable.Collection<Picture>('pictures');
export const Users = MongoObservable.fromExisting(Meteor.users);

export const PicturesStore = new UploadFS.store.GridFS({
  collection: Pictures.collection,
  name: 'pictures',
  filter: new UploadFS.Filter({
    contentTypes: ['image/*']
  }),
  permissions: new UploadFS.StorePermissions({
    insert: picturesPermissions,
    update: picturesPermissions,
    remove: picturesPermissions
  }),
  transformWrite(from, to) {
    // Compress
    const transform = Sharp().png({ quality: 75 });
    from.pipe(transform).pipe(to);
  }
});

function picturesPermissions(userId: string): boolean {
  return Meteor.isServer || !!userId;
}