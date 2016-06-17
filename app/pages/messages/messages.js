import {Component} from '@angular/core';
import {MeteorComponent} from 'angular2-meteor';
import {DateFormatPipe} from 'angular2-moment';
import {NavController, NavParams} from 'ionic-angular';
import {Messages} from 'service/collections';


@Component({
  templateUrl: 'build/pages/messages/messages.html',
  pipes: [DateFormatPipe]
})
export class MessagesPage extends MeteorComponent {
  static parameters = [[NavController], [NavParams]]

  constructor(nav, params) {
    super();

    this.nav = nav;
    this.activeChat = params.get('chat');
    this.message = '';

    this.messages = Messages.find({
      chatId: this.activeChat._id
    });

    this.messages.find().observe({
      added() {
        this.scrollDown();
        this.messageInput.focus();
      }
    });
  }

  onInputKeypress({keyCode}) {
    if (keyCode == 13) {
      this.sendMessage();
    }
  }

  sendMessage() {
    this.call('addMessage', this.activeChat._id, this.message);
    this.message = '';
  }

  scrollDown() {
    this.scroller.scrollTop = this.scroller.scrollHeight;
  }

  ngOnDestroy() {
    localStorage.removeItem('activeChat');
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
