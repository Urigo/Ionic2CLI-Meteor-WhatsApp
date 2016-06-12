import {Component} from '@angular/core';
import {DateFormatPipe} from 'angular2-moment';
import {NavController, NavParams} from 'ionic-angular';
import {MessagesData} from '../../data-providers/messages-data';


@Component({
  templateUrl: 'build/pages/chat-detail/chat-detail.html',
  pipes: [DateFormatPipe]
})
export class ChatDetailPage {
  static parameters = [[NavController], [NavParams], [MessagesData]]

  constructor(nav, params, messages) {
    this.nav = nav;
    this.messages = messages;
    this.currentChat = messages.currentChat;
    this.message = '';
  }

  onInputKeypress({keyCode}, messageInput) {
    if (keyCode == 13) {
      this.sendMessage(messageInput);
    }
  }

  sendMessage(messageInput) {
    this.messages.add(this.message);
    this.message = '';
    messageInput.setFocus();
  }

  attachFile() {

  }

  showOptions() {

  }

  recordVoiceMessage() {

  }
}
