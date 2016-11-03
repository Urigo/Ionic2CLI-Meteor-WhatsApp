import { Component, OnInit } from '@angular/core';
import { MeteorObservable, ObservableCursor } from 'meteor-rxjs';
import { NavController, ViewController, AlertController } from 'ionic-angular';
import { Chats, Users } from 'api/collections/whatsapp-collections';
import { User } from 'api/models/whatsapp-models';

@Component({
  selector: 'new-chat',
  templateUrl: 'new-chat.html'
})
export class NewChatComponent implements OnInit {
  users;
  senderId: string;

  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public alertCtrl: AlertController
  ) {
    this.senderId = Meteor.userId();
  }

  ngOnInit() {
    MeteorObservable.subscribe('users').subscribe(() => {
      MeteorObservable.autorun().subscribe(() => {
        this.users = this.findUsers().zone();
      });
    });
  }

  addChat(user): void {
    MeteorObservable.call('addChat', user._id).subscribe({
      next: () => {
        this.viewCtrl.dismiss();
      },
      error: (e: Error) => {
        this.viewCtrl.dismiss().then(() => {
          this.handleError(e);
        });
      }
    });
  }

  private findUsers(): ObservableCursor<User> {
    return Chats.find({
      memberIds: this.senderId
    }, {
      fields: {
        memberIds: 1
      }
    })
      .startWith([]) // empty result
      .mergeMap((chats) => {
        const recieverIds = chats
          .map(({memberIds}) => memberIds)
          .reduce((result, memberIds) => result.concat(memberIds), [])
          .concat(this.senderId);

        return Users.find({
          _id: {$nin: recieverIds}
        })
      });
  }

  private handleError(e: Error): void {
    console.error(e);

    const alert = this.alertCtrl.create({
      title: 'Oops!',
      message: e.message,
      buttons: ['OK']
    });

    alert.present();
  }
}
