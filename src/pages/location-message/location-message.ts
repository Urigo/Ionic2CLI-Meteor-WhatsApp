import { Component, OnInit, OnDestroy } from '@angular/core';
import { ViewController, Platform } from 'ionic-angular';
import { Geolocation } from 'ionic-native';
import { Location } from 'api/models';

const DEFAULT_ZOOM = 8;
const EQUATOR = 40075004;
const DEFAULT_LAT = 51.678418;
const DEFAULT_LNG = 7.809007;

@Component({
  selector: 'location-message',
  templateUrl: 'location-message.html'
})
export class NewLocationMessageComponent implements OnInit, OnDestroy {
  lat: number = DEFAULT_LAT;
  lng: number = DEFAULT_LNG;
  zoom: number = DEFAULT_ZOOM;
  accuracy: number = -1;
  intervalHandler: any;

  constructor(private viewCtrl: ViewController, private platform: Platform) {
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
    const requiredMpp = accuracy / screenSize;
    return ((Math.log(EQUATOR / (256 * requiredMpp))) / Math.log(2)) + 1;
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
      lng: this.lng,
      zoom: this.zoom
    });
  }
}
