import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';

@Component({
  selector: 'show-picture',
  templateUrl: 'show-picture.html'
})
export class ShowPictureComponent {
  pictureSrc: string;

  constructor(private navParams: NavParams) {
    this.pictureSrc = this.navParams.get('pictureSrc');
  }
}
