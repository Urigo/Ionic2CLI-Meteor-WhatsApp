import { Injectable } from '@angular/core';
import { _ } from 'meteor/underscore';
import { UploadFS } from 'meteor/jalik:ufs';
import { ImagesStore } from 'api/collections/ufs';
import { Image } from 'api/models/ufs';

@Injectable()
export class ImageUploader {
  upload(file: File): Promise<Image> {
    return new Promise((resolve, reject) => {
      const metadata = _.pick(file, 'name', 'type', 'size');

      const upload = new UploadFS.Uploader({
        data: file,
        file: metadata,
        store: ImagesStore,
        onComplete: resolve,
        onError: reject
      });

      upload.start();
    });
  }
}