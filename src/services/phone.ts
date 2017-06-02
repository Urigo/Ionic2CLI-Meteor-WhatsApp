import { Injectable } from '@angular/core';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { Platform } from 'ionic-angular';
import { Sim } from '@ionic-native/sim';

@Injectable()
export class PhoneService {
  constructor(private platform: Platform,
              private sim: Sim) {

  }

  async getNumber(): Promise<string> {
    if (!this.platform.is('cordova')) {
      throw new Error('Cannot read SIM, platform is not Cordova.')
    }

    if (!(await this.sim.hasReadPermission())) {
      try {
        await this.sim.requestReadPermission();
      } catch (e) {
        throw new Error('User denied SIM access.');
      }
    }

    return '+' + (await this.sim.getSimInfo()).phoneNumber;
  }

  verify(phoneNumber: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      Accounts.requestPhoneVerification(phoneNumber, (e: Error) => {
        if (e) {
          return reject(e);
        }

        resolve();
      });
    });
  }

  login(phoneNumber: string, code: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      Accounts.verifyPhone(phoneNumber, code, (e: Error) => {
        if (e) {
          return reject(e);
        }

        resolve();
      });
    });
  }

  logout(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      Meteor.logout((e: Error) => {
        if (e) {
          return reject(e);
        }

        resolve();
      });
    });
  }
}
