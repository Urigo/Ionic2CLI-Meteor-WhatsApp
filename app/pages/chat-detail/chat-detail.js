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

  onInputKeypress({keyCode}) {
    if (keyCode == 13) {
      this.sendMessage();
    }
  }

  sendMessage() {
    this.sendingMessage = true;
    this.messages.add(this.message);
    this.message = '';
    this.messageInput.focus();
  }

  ngAfterViewChecked() {
    if (this.sendingMessage) {
      this.sendingMessage = false;
      this.scrollDown();
    }
  }

  scrollDown() {
    this.scroller.scrollTop = this.scroller.scrollHeight;
  }

  attachFile() {

  }

  showOptions() {

  }

  recordVoiceMessage() {

  }

  get chatDetail() {
    return document.querySelector('.chat-detail');
  }

  get messageBox() {
    return document.querySelector('.chat-detail-message-box');
  }

  get messagesList() {
    return this.chatDetail.querySelector('.messages-list');
  }

  get messageInput() {
    return this.messageBox.querySelector('.message-input');
  }

  get scroller() {
    return this.messagesList.querySelector('scroll-content');
  }
}
