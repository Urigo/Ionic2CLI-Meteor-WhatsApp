import {Injectable} from '@angular/core';
import {Cordova, Plugin, IonicNativePlugin} from '@ionic-native/core';


/**
 * @name Sim
 * @description
 * Gets info from the Sim card like the carrier name, mcc, mnc and country code and other system dependent info.
 *
 * Requires Cordova plugin: `cordova-plugin-sim`. For more info, please see the [Cordova Sim docs](https://github.com/pbakondy/cordova-plugin-sim).
 *
 * @usage
 * ```typescript
 * import { Sim } from '@ionic-native/sim';
 *
 *
 * constructor(private sim: Sim) { }
 *
 * ...
 *
 * this.sim.getSimInfo().then(
 *   (info) => console.log('Sim info: ', info),
 *   (err) => console.log('Unable to get sim info: ', err)
 * );
 *
 * this.sim.hasReadPermission().then(
 *   (info) => console.log('Has permission: ', info)
 * );
 *
 * this.sim.requestReadPermission().then(
 *   () => console.log('Permission granted'),
 *   () => console.log('Permission denied')
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
