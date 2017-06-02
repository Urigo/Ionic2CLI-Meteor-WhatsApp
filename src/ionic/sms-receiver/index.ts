import {Injectable} from '@angular/core';
import {Cordova, Plugin, IonicNativePlugin} from '@ionic-native/core';


/**
 * @name SmsReceiver
 * @description
 * Allows you to receive incoming SMS. You have the possibility to start and stop the message broadcasting.
 *
 * Requires Cordova plugin: `cordova-plugin-smsreceiver`. For more info, please see the [Cordova SmsReceiver docs](https://github.com/ahmedwahba/cordova-plugin-smsreceiver).
 *
 * @usage
 * ```typescript
 * import { SmsReceiver } from '@ionic-native/smsreceiver';
 *
 *
 * constructor(private smsReceiver: SmsReceiver) { }
 *
 * ...
 *
 * this.smsReceiver.isSupported().then(
 *   (supported) => console.log('Permission granted'),
 *   (err) => console.log('Permission denied: ', err)
 * );
 *
 * this.smsReceiver.startReceiving().then(
 *   (msg) => console.log('Message received: ', msg)
 * );
 *
 * this.smsReceiver.stopReceiving().then(
 *   () => console.log('Stopped receiving'),
 *   (err) => console.log('Error: ', err)
 * );
 * ```
 */
@Plugin({
  pluginName: 'SmsReceiver',
  plugin: 'cordova-plugin-smsreceiver',
  pluginRef: 'sms',
  repo: 'https://github.com/ahmedwahba/cordova-plugin-smsreceiver',
  platforms: ['Android']
})
@Injectable()
export class SmsReceiver extends IonicNativePlugin {
  /**
   * Check if the SMS permission is granted and SMS technology is supported by the device.
   * In case of Marshmallow devices, it requests permission from user.
   * @returns {void}
   */
  @Cordova()
  isSupported(callback: (supported: boolean) => void, error: () => void): void {
    return;
  }

  /**
   * Start the SMS receiver waiting for incoming message.
   * The success callback function will be called every time a new message is received.
   * The error callback is called if an error occurs.
   * @returns {void}
   */
  @Cordova({
    platforms: ['Android']
  })
  startReceiving(callback: (msg: string) => void, error: () => void): void {
    return;
  }

  /**
   * Stop the SMS receiver.
   * @returns {void}
   */
  @Cordova({
    platforms: ['Android']
  })
  stopReceiving(callback: () => void, error: () => void): void {
    return;
  }
}
