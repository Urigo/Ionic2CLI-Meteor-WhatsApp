import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, ViewController, AlertController, Platform } from 'ionic-angular';
import { Geolocation } from 'ionic-native';
import { Location } from 'api/models';

const DEFAULT_ZOOM = 8;

@Component({
  selector: 'location-message',
  templateUrl: 'location-message.html'
})
export class NewLocationMessageComponent implements OnInit, OnDestroy {
  lat: number = 51.678418;
  lng: number = 7.809007;
  zoom: number = DEFAULT_ZOOM;
  accuracy: number = -1;
  intervalHandler: any;

  constructor(
    private navCtrl: NavController,
    private viewCtrl: ViewController,
    private alertCtrl: AlertController,
    private platform: Platform
  ) {

  }

  ngOnInit() {
    this.platform.ready().then(() => {
      // Load the current location now, and when fetched - refresh it to improve accuracy
      this.reloadLocation().then(() => {
        this.intervalHandler = setInterval(() => {
          this.reloadLocation();
        }, 1000);
      });
    });
  }

  ngOnDestroy() {
    if (this.intervalHandler) {
      clearInterval(this.intervalHandler);
    }
  }

  calculateZoomByAccureacy(accuracy: number): number {
    const deviceHeight = this.platform.height();
    const deviceWidth = this.platform.width();
    const screenSize = Math.min(deviceWidth, deviceHeight);
    const equator = 40075004;
    const requiredMpp = accuracy / screenSize;
    return ((Math.log(equator / (256 * requiredMpp))) / Math.log(2)) + 1;
  }

  reloadLocation() {
    return Geolocation.getCurrentPosition().then((position) => {
      if (this.lat && this.lng) {
        this.accuracy = position.coords.accuracy;
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        this.zoom = this.calculateZoomByAccureacy(this.accuracy);
      }
    });
  }

  sendLocation() {
    this.viewCtrl.dismiss(<Location>{
      lat: this.lat,
      lng: this.lng
    });
  }
}
