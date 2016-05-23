import {Injectable} from '@angular/core';


@Injectable()
export class UserData {
  constructor() {
    this._phone = '';
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