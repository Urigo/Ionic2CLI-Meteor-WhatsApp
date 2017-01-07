import * as Gm from 'gm';
import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { UploadFS } from 'meteor/jalik:ufs';
import { Thumbnail, Image } from 'api/models/ufs';

export const Images = new MongoObservable.Collection<Image>('images');
export const Thumbnails = new MongoObservable.Collection<Thumbnail>('thumbs');

function loggedIn(userId) {
  return !!userId;
}

export const ThumbnailsStore = new UploadFS.store.GridFS({
  collection: Thumbnails.collection,
  name: 'thumbs',
  permissions: new UploadFS.StorePermissions({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
  }),
  transformWrite(from, to, fileId, file) {
    // Resize to 32x32
    Gm(from, file.name)
      .resize(32, 32)
      .gravity('Center')
      .extent(32, 32)
      .quality(75)
      .stream()
      .pipe(to);
  }
});

export const ImagesStore = new UploadFS.store.GridFS({
  collection: Images.collection,
  name: 'images',
  filter: new UploadFS.Filter({
    contentTypes: ['image/*']
  }),
  copyTo: [
    ThumbnailsStore
  ],
  permissions: new UploadFS.StorePermissions({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
  })
});