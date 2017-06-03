import { Injectable } from '@angular/core';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { Platform } from 'ionic-angular';
import { Sim } from '@ionic-native/sim';
import { SmsReceiver } from "../ionic/sms-receiver";
import * as Bluebird from "bluebird";
import { TWILIO_SMS_NUMBERS } from "api/models";
import { Observable } from "rxjs";

@Injectable()
export class PhoneService {
  constructor(private platform: Platform,
              private sim: Sim,
              private smsReceiver: SmsReceiver) {
    Bluebird.promisifyAll(this.smsReceiver);
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

  async getSMS(): Promise<string> {
    if (!this.platform.is('android')) {
      throw new Error('Cannot read SMS, platform is not Android.')
    }

    try {
      await (<any>this.smsReceiver).isSupported();
    } catch (e) {
      throw new Error('User denied SMS access.');
    }

    const startObs = Observable.fromPromise((<any>this.smsReceiver).startReceiving()).map((msg: string) => msg);
    const timeoutObs = Observable.interval(120000).take(1).map(() => {
      throw new Error('Receiving SMS timed out.')
    });

    try {
      var msg = await startObs.takeUntil(timeoutObs).toPromise();
    } catch (e) {
      await (<any>this.smsReceiver).stopReceiving();
      throw e;
    }

    await (<any>this.smsReceiver).stopReceiving();

    if (TWILIO_SMS_NUMBERS.includes(msg.split(">")[0])) {
      return msg.substr(msg.length - 4);
    } else {
      throw new Error('Sender is not a Twilio number.')
    }
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
