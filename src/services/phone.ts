import { Injectable } from '@angular/core';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';

@Injectable()
export class PhoneService {
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
