import {Page, ViewController} from 'ionic-angular';


@Page({
  templateUrl: 'build/pages/new-chat/new-chat.html'
})
export class NewChatPage {
  static parameters = [[ViewController]]

  constructor(view) {
    this.view = view;
  }

  dismiss() {
    this.view.dismiss();
  }
}