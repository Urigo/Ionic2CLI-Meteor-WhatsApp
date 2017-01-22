import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Sim } from 'ionic-native';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';

@Injectable()
export class PhoneService {
  constructor(private platform: Platform) {}

  getNumber(): Promise<string> {
    if (!this.platform.is('cordova') ||
        !this.platform.is('mobile')) return Promise.resolve('');

    return Sim.getSimInfo().then((info) => {
      return '+' + info.phoneNumber;
    });
  }

  verify(number: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      Accounts.requestPhoneVerification(number, (e: Error) => {
        if (e) return reject(e);
        resolve();
      });
    });
  }

  login(number: string, code: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      Accounts.verifyPhone(number, code, (e: Error) => {
        if (e) return reject(e);
        resolve();
      });
    });
  }

  logout(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      Meteor.logout((e: Error) => {
        if (e) return reject(e);
        resolve();
      });
    });
  }
}