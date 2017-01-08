import { Injectable } from '@angular/core';
import { _ } from 'meteor/underscore';
import { UploadFS } from 'meteor/jalik:ufs';
import { PicturesStore } from 'api/collections/ufs';
import { Picture } from 'api/models/ufs';

@Injectable()
export class PictureUploader {
  upload(file: File): Promise<Picture> {
    return new Promise((resolve, reject) => {
      const metadata = _.pick(file, 'name', 'type', 'size');

      const upload = new UploadFS.Uploader({
        data: file,
        file: metadata,
        store: PicturesStore,
        onComplete: resolve,
        onError: reject
      });

      upload.start();
    });
  }
}