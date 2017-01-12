import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { MeteorObservable } from 'meteor-rxjs';
import { Pictures } from 'api/collections';
import { Profile, DEFAULT_PICTURE_URL } from 'api/models';
import { TabsPage } from '../tabs/tabs';
import { PictureUploader } from '../../services/picture-uploader';

@Component({
  selector: 'profile',
  templateUrl: 'profile.html'
})
export class ProfilePage implements OnInit {
  picture: string;
  profile: Profile;

  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private pictureUploader: PictureUploader
  ) {}

  ngOnInit(): void {
    this.profile = Meteor.user().profile || {
      name: 'Whatsapp Newbie'
    };

    MeteorObservable.subscribe('user').subscribe(() => {
      const picture = Pictures.findOne(this.profile.pictureId) || {};
      this.picture = picture.url || DEFAULT_PICTURE_URL;
    });
  }

  pickProfilePicture({ target }: Event): void {
    const file = (<HTMLInputElement>target).files[0];
    this.uploadProfilePicture(file);
  }

  uploadProfilePicture(file: File): void {
    this.pictureUploader.upload(file).then((picture) => {
      const oldPictureId = this.profile.pictureId;
      if (oldPictureId) Meteor.call('removePicture', oldPictureId);

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
