import fetch from 'node-fetch';

export interface FcmNotification {
  title: string;
  text: string;
}

export class FcmService {
  private key: string = Meteor.settings.private.fcm.key;

  sendNotification(notification: FcmNotification, destination: string) {
    const body = {
      notification: notification,
      to: destination
    };

    const options = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        Authorization: `key=${this.key}`
      },
    };

    return fetch("https://fcm.googleapis.com/fcm/send", options);
  }
}

export const fcmService = new FcmService();
