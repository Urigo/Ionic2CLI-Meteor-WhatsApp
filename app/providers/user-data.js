import {Injectable} from '@angular/core';


@Injectable()
export class UserData {
  constructor() {
    this._name = '';
    this._picture = '/ionicons/dist/svg/ios-contact.svg';
    this._phone = '';
  }

  set name(name) {
    if (typeof name != 'string' || !name.length) {
      throw Error('User name is invalid');
    }

    this._name = name;
  }

  get name() {
    return this._name;
  }

  set picture(picture) {
    if (typeof picture != 'string' || !picture.length) {
      throw Error('Profile picture is invalid');
    }

    this._picture = picture;
  }

  get picture() {
    return this._picture;
  }

  set phone(phone) {
    if (!/^\+\d{10,12}$/.test(phone)) {
      throw Error('Phone number is invalid');
    }

    this._phone = phone;
  }

  get phone() {
    return this._phone;
  }

  verify(code) {
    if (!/^\d{4}$/.test(code)) {
      throw Error('Verification code did not match');
    }
  }
}