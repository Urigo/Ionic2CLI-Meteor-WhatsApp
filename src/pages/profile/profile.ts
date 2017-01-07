import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { MeteorObservable } from 'meteor-rxjs';
import { Profile } from 'api/models/whatsapp';
import { Image } from 'api/models/ufs';
import { TabsPage } from '../tabs/tabs';
import { ImageUploader } from '../../services/image-uploader';

@Component({
  selector: 'profile',
  templateUrl: 'profile.html'
})
export class ProfilePage implements OnInit {
  profile: Profile;

  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private imageUploader: ImageUploader
  ) {}

  ngOnInit(): void {
    this.profile = Meteor.user().profile || {
      name: '',
      picture: '/ionicons/dist/svg/ios-contact.svg',
      thumbnail: '/ionicons/dist/svg/ios-contact.svg'
    };
  }

  done(): void {
    MeteorObservable.call('updateProfile', this.profile).subscribe({
      next: () => {
        this.navCtrl.push(TabsPage);
      },
      error: (e: Error) => {
        this.handleError(e);
      }
    });
  }

  uploadProfilePic(file: File): void {
    this.imageUploader.upload(file).then((image) => {
      this.updateProfilePic(image);
    })
    .catch((e) => {
      this.handleError(e);
    });
  }

  updateProfilePic(image: Image) {
    MeteorObservable.call<Profile>('updateProfilePic', image).subscribe({
      next: ({ picture, thumbnail }) => {
        this.profile.picture = picture;
        this.profile.thumbnail = thumbnail;
      },
      error: (e: Error) => {
        this.handleError(e);
      }
    });
  }

  private handleError(e: Error): void {
    console.error(e);

    const alert = this.alertCtrl.create({
      title: 'Oops!',
      message: e.message,
      buttons: ['OK']
    });

    alert.present();
  }
}
