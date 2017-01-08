import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { MeteorObservable } from 'meteor-rxjs';
import { Profile } from 'api/models/whatsapp';
import { Picture } from 'api/models/ufs';
import { TabsPage } from '../tabs/tabs';
import { PictureUploader } from '../../services/picture-uploader';

@Component({
  selector: 'profile',
  templateUrl: 'profile.html'
})
export class ProfilePage implements OnInit {
  profile: Profile;

  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private pictureUploader: PictureUploader
  ) {}

  ngOnInit(): void {
    this.profile = Meteor.user().profile || {
      name: '',
      picture: '/ionicons/dist/svg/ios-contact.svg'
    };
  }

  pickProfilePicture({ target }: Event): void {
    const file = (<HTMLInputElement>target).files[0];
    this.uploadProfilePicture(file);
  }

  uploadProfilePicture(file: File): void {
    this.pictureUploader.upload(file).then((picture) => {
      this.updateProfilePicture(picture);
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

  updateProfilePicture(picture: Picture) {
    MeteorObservable.call<Profile>('updateProfilePic', picture).subscribe({
      next: ({ picture }) => {
        this.profile.picture = picture;
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
