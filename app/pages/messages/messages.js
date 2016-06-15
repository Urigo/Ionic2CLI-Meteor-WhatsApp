import {Component} from '@angular/core';
import {DateFormatPipe} from 'angular2-moment';
import {NavController, NavParams} from 'ionic-angular';
import {ChatsService} from '../../services/chats-service';
import {MessagesService} from '../../services/messages-service';


@Component({
  templateUrl: 'build/pages/messages/messages.html',
  pipes: [DateFormatPipe]
})
export class MessagesPage {
  static parameters = [[NavController], [NavParams], [ChatsService], [MessagesService]]

  constructor(nav, params, chats, messages) {
    this.nav = nav;
    this.chats = chats;
    this.messages = messages;
    this.activeChat = messages.activeChat;
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
  }

  ngAfterViewChecked() {
    if (this.sendingMessage) {
      this.sendingMessage = false;
      this.scrollDown();
      this.messageInput.focus();
    }
  }

  ngOnDestroy() {
    this.chats.unsetActive().dispose();
  }

  scrollDown() {
    this.scroller.scrollTop = this.scroller.scrollHeight;
  }

  get messagesPageContent() {
    return document.querySelector('.messages-page-content');
  }

  get messagesPageFooter() {
    return document.querySelector('.messages-page-footer');
  }

  get messagesList() {
    return this.messagesPageContent.querySelector('.messages');
  }

  get messageInput() {
    return this.messagesPageFooter.querySelector('.message-input');
  }

  get scroller() {
    return this.messagesList.querySelector('scroll-content');
  }
}
