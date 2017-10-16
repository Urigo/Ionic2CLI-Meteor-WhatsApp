import { MongoObservable } from 'meteor-rxjs';
import { UploadFS } from 'meteor/jalik:ufs';
import { Meteor } from 'meteor/meteor';
import * as sharp from 'sharp';
import { Picture, DEFAULT_PICTURE_URL } from '../models';

export interface PicturesCollection<T> extends MongoObservable.Collection<T> {
  getPictureUrl(selector?: Object | string, platform?: string): string;
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
    // Resize picture, then crop it to 1:1 aspect ratio, then compress it to 75% from its original quality
    const transform = sharp().resize(800,800).min().crop().toFormat('jpeg', {quality: 75});
    from.pipe(transform).pipe(to);
  }
});

// Gets picture's url by a given selector
Pictures.getPictureUrl = function (selector, platform = "") {
  const prefix = platform === "android" ? "/android_asset/www" :
    platform === "ios" ? "" : "";

  const picture = this.findOne(selector) || {};
  return picture.url || prefix + DEFAULT_PICTURE_URL;
};

function picturesPermissions(userId: string): boolean {
  return Meteor.isServer || !!userId;
}
