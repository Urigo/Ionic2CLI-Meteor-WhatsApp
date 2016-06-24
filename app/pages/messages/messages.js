import {Component} from '@angular/core';
import {MeteorComponent} from 'angular2-meteor';
import {DateFormatPipe} from 'angular2-moment';
import {Meteor} from 'meteor/meteor';
import {NavController, NavParams} from 'ionic-angular';
import {Messages} from 'api/collections';


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
    this.addresseeId = Meteor.userId();
    this.message = '';

    const recipientId = this.activeChat.memberIds.find(memberId => memberId != this.addresseeId);
    const recipient = Meteor.users.findOne(recipientId);

    this.title = recipient.profile.name;
    this.picture = recipient.profile.picture;

    this.subscribe('messages', this.activeChat._id, () => {
      this.autorun(() => {
        this.messages = this.findMessages();
      }, true);
    });
  }

  ngAfterViewChecked() {
    if (!this.messageSent) return;
    this.messageSent = false;
    this.scrollDown();
  }

  ngOnDestroy() {
    localStorage.removeItem('activeChat');
  }

  findMessages() {
    const messages = Messages.find({
      chatId: this.activeChat._id
    }, {
      sort: {createdAt: 1},
      transform: this::this.transformMessage
    });

    messages.observe({
      added: this::this.onMessageAdded
    });

    return messages;
  }

  transformMessage(message) {
    if (!Meteor.user()) return message;
    message.ownership = this.addresseeId == message.addresseeId ? 'mine' : 'others';
    return message;
  }

  onMessageAdded(message) {
    this.messageSent = true;
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
    this.messageInput.focus();
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
