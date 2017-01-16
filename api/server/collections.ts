import { MongoObservable } from 'meteor-rxjs';
import { UploadFS } from 'meteor/jalik:ufs';
import { Meteor } from 'meteor/meteor';
import * as Sharp from 'sharp';
import { DEFAULT_PICTURE_URL, Chat, Message, Picture, User } from './models';

export interface PicturesCollection<T> extends MongoObservable.Collection<T> {
  getPictureUrl(selector?: Object | string): string;
}

export const Chats =
  new MongoObservable.Collection<Chat>('chats');
export const Messages =
  new MongoObservable.Collection<Message>('messages');
export const Pictures =
  new MongoObservable.Collection<Picture>('pictures') as PicturesCollection<Picture>;
export const Users =
  MongoObservable.fromExisting<User>(Meteor.users);

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
    // Compress picture to 75% from its original quality
    const transform = Sharp().png({ quality: 75 });
    from.pipe(transform).pipe(to);
  }
});

// Gets picture's url by a given selector. If no picture was found, will return the
// default picture url
Pictures.getPictureUrl = function (selector) {
  const picture = this.findOne(selector) || {};
  return picture.url || DEFAULT_PICTURE_URL;
};

// Deny all client-side updates to user documents
Meteor.users.deny({
  update() { return true; }
});

function picturesPermissions(userId: string): boolean {
  return Meteor.isServer || !!userId;
}