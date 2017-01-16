import { Injectable } from '@angular/core';
import { PicturesStore } from 'api/collections';
import { Picture } from 'api/models';
import { UploadFS } from 'meteor/jalik:ufs';
import { _ } from 'meteor/underscore';

@Injectable()
export class PictureUploader {
  select(): Promise<File> {
    return new Promise((resolve, reject) => {
      try {
        UploadFS.selectFile((file: File) => {
          resolve(file);
        });
      }
      catch (e) {
        reject(e);
      }
    });
  }

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