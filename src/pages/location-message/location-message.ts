import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, ViewController, AlertController } from 'ionic-angular';
import { Geolocation } from 'ionic-native';

const DEFAULT_ZOOM = 8;

@Component({
  selector: 'location-message',
  templateUrl: 'location-message.html'
})
export class NewLocationMessageComponent implements OnInit, OnDestroy {
  title: string = 'My first angular2-google-maps project';
  lat: number = 51.678418;
  lng: number = 7.809007;
  zoom: number = DEFAULT_ZOOM;
  accuracy: number = -1;
  intervalHandler: any;

  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public alertCtrl: AlertController
  ) {

  }

  ngOnInit() {
    // Load the current location now, and when fetched - refresh it to improve accuracy
    this.reloadLocation().then(() => {
      this.intervalHandler = setInterval(() => {
        this.reloadLocation();
      }, 1000);
    });
  }

  ngOnDestroy() {
    if (this.intervalHandler) {
      clearInterval(this.intervalHandler);
    }
  }

  reloadLocation() {
    return Geolocation.getCurrentPosition().then((position) => {
      if (this.lat && this.lng) {
        this.accuracy = position.coords.accuracy;
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;

        if (this.accuracy <= 60) {
          this.zoom = (60 - this.accuracy) * 2;
        }
        else {
          this.zoom = DEFAULT_ZOOM;
        }

        if (this.zoom === 0) {
          this.zoom = DEFAULT_ZOOM;
        }
      }
    });
  }

  sendLocation() {

  }
}
