import { MongoObservable } from 'meteor-rxjs';
import { UploadFS } from 'meteor/jalik:ufs';
import { Meteor } from 'meteor/meteor';
import * as Sharp from 'sharp';
import { Picture, DEFAULT_PICTURE_URL } from '../models';

export interface PicturesCollection<T> extends MongoObservable.Collection<T> {
  getPictureUrl(selector?: Object | string): string;
}

export const Pictures =
  new MongoObservable.Collection<Picture>('pictures') as PicturesCollection<Picture>;

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

// Gets picture's url by a given selector
Pictures.getPictureUrl = function (selector) {
  const picture = this.findOne(selector) || {};
  return picture.url || DEFAULT_PICTURE_URL;
};

function picturesPermissions(userId: string): boolean {
  return Meteor.isServer || !!userId;
}
