import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform, ViewController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Location } from 'api/models';
import { Observable, Subscription } from 'rxjs';

const DEFAULT_ZOOM = 8;
const EQUATOR = 40075004;
const DEFAULT_LAT = 51.678418;
const DEFAULT_LNG = 7.809007;
const LOCATION_REFRESH_INTERVAL = 500;

@Component({
  selector: 'location-message',
  templateUrl: 'location-message.html'
})
export class NewLocationMessageComponent implements OnInit, OnDestroy {
  lat: number = DEFAULT_LAT;
  lng: number = DEFAULT_LNG;
  zoom: number = DEFAULT_ZOOM;
  accuracy: number = -1;
  intervalObs: Subscription;

  constructor(private platform: Platform,
              private viewCtrl: ViewController,
              private geolocation: Geolocation) {
  }

  ngOnInit() {
    // Refresh location at a specific refresh rate
    this.intervalObs = this.reloadLocation()
      .flatMapTo(Observable
        .interval(LOCATION_REFRESH_INTERVAL)
        .timeInterval())
      .subscribe(() => {
        this.reloadLocation();
      });
  }

  ngOnDestroy() {
    // Dispose subscription
    if (this.intervalObs) {
      this.intervalObs.unsubscribe();
    }
  }

  calculateZoomByAccureacy(accuracy: number): number {
    // Source: http://stackoverflow.com/a/25143326
    const deviceHeight = this.platform.height();
    const deviceWidth = this.platform.width();
    const screenSize = Math.min(deviceWidth, deviceHeight);
    const requiredMpp = accuracy / screenSize;

    return ((Math.log(EQUATOR / (256 * requiredMpp))) / Math.log(2)) + 1;
  }

  reloadLocation() {
    return Observable.fromPromise(this.geolocation.getCurrentPosition().then((position) => {
      if (this.lat && this.lng) {
        // Update view-models to represent the current geo-location
        this.accuracy = position.coords.accuracy;
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        this.zoom = this.calculateZoomByAccureacy(this.accuracy);
      }
    }));
  }

  sendLocation() {
    this.viewCtrl.dismiss(<Location>{
      lat: this.lat,
      lng: this.lng,
      zoom: this.zoom
    });
  }
}
