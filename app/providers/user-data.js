import {Injectable} from '@angular/core';


@Injectable()
export class UserData {
  constructor() {
    this._phone = '';
  }

  set phone(value) {
    // TODO: add verification
    this._phone = value;
  }

  get phone() {
    return this._phone;
  }
}