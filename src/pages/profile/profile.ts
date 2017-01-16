import { Component, OnInit } from '@angular/core';
import { Pictures } from 'api/collections';
import { DEFAULT_PICTURE_URL, DEFAULT_USERNAME, Profile } from 'api/models';
import { AlertController, NavController } from 'ionic-angular';
import { MeteorObservable } from 'meteor-rxjs';
import { PictureUploader } from '../../services/picture-uploader';
import { TabsPage } from '../tabs/tabs';

@Component({
  selector: 'profile',
  templateUrl: 'profile.html'
})
export class ProfilePage implements OnInit {
  picture: string;
  profile: Profile;

  constructor(
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private pictureUploader: PictureUploader
  ) {}

  ngOnInit(): void {
    this.profile = Meteor.user().profile || {
      name: DEFAULT_USERNAME
    };

    MeteorObservable.subscribe('user').subscribe(() => {
      const picture = Pictures.findOne(this.profile.pictureId) || {};
      this.picture = picture.url || DEFAULT_PICTURE_URL;
    });
  }

  selectProfilePicture(): void {
    this.pictureUploader.select().then((file) => {
      this.uploadProfilePicture(file);
    })
    .catch((e) => {
      this.handleError(e);
    });
  }

  uploadProfilePicture(file: File): void {
    this.pictureUploader.upload(file).then((picture) => {
      this.profile.pictureId = picture._id;
      this.picture = picture.url;
    })
    .catch((e) => {
      this.handleError(e);
    });
  }

  updateProfile(): void {
    MeteorObservable.call('updateProfile', this.profile).subscribe({
      next: () => {
        this.navCtrl.push(TabsPage);
      },
      error: (e: Error) => {
        this.handleError(e);
      }
    });
  }

  handleError(e: Error): void {
    console.error(e);

    const alert = this.alertCtrl.create({
      title: 'Oops!',
      message: e.message,
      buttons: ['OK']
    });

    alert.present();
  }
}
