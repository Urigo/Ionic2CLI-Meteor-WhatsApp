import { Injectable } from '@angular/core';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { Platform } from 'ionic-angular';
import { Sim } from '@ionic-native/sim';
import { Contact, ContactFieldType, Contacts, IContactField, IContactFindOptions } from "@ionic-native/contacts";
import { SmsReceiver } from "../ionic/sms-receiver";
import * as Bluebird from "bluebird";
import { TWILIO_SMS_NUMBERS } from "api/models";
import { Observable } from "rxjs";

@Injectable()
export class PhoneService {
  constructor(private platform: Platform,
              private sim: Sim,
              private smsReceiver: SmsReceiver,
              private contacts: Contacts) {
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

  getContactsFromAddressbook(): Promise<string[]> {
    const getContacts = (): Promise<Contact[]> => {
      if (!this.platform.is('cordova')) {
        return Promise.reject(new Error('Cannot get contacts: not cordova.'));
      }

      const fields: ContactFieldType[] = ["phoneNumbers"];
      const options: IContactFindOptions = {
        filter: "",
        multiple: true,
        desiredFields: ["phoneNumbers"],
        hasPhoneNumber: true
      };
      return this.contacts.find(fields, options);
    };

    const cleanPhoneNumber = (phoneNumber: string): string => {
      const phoneNumberNoSpaces: string = phoneNumber.replace(/ /g, '');

      if (phoneNumberNoSpaces.charAt(0) === '+') {
        return phoneNumberNoSpaces;
      } else if (phoneNumberNoSpaces.substring(0, 2) === "00") {
        return '+' + phoneNumberNoSpaces.slice(2);
      } else {
        // Use user's international prefix when absent
        // FIXME: update meteor-accounts-phone typings
        const prefix: string = (<any>Meteor.user()).phone.number.substring(0, 3);

        return prefix + phoneNumberNoSpaces;
      }
    };

    return new Promise((resolve, reject) => {
      getContacts()
        .then((contacts: Contact[]) => {
          const arrayOfArrays: string[][] = contacts
            .map((contact: Contact) => {
              return contact.phoneNumbers
                .filter((phoneNumber: IContactField) => {
                  return phoneNumber.type === "mobile";
                }).map((phoneNumber: IContactField) => {
                  return cleanPhoneNumber(phoneNumber.value);
                }).filter((phoneNumber: string) => {
                  return phoneNumber.slice(1).match(/^[0-9]+$/) && phoneNumber.length >= 8;
                });
            });
          const flattenedArray: string[] = [].concat(...arrayOfArrays);
          const uniqueArray: string[] = [...new Set(flattenedArray)];
          resolve(uniqueArray);
        })
        .catch((e: Error) => {
          reject(e);
        });
    });
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

  linkFacebook(): Promise<any> {
    return new Promise((resolve, reject) => {
      const options = {
        requestPermissions: ['public_profile', 'user_friends', 'email']
      };

      // TODO: add link-accounts types to meteor typings
      (<any>Meteor).linkWithFacebook(options, (error: Error) => {
        if (error) {
          reject(new Error(error.message));
        } else {
          resolve();
        }
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
