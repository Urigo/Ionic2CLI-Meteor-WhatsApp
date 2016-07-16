import {Component} from '@angular/core';
import {NavParams} from 'ionic-angular';
import {MeteorComponent} from 'angular2-meteor';
import {DateFormatPipe} from 'angular2-moment';
import {Meteor} from 'meteor/meteor';
import {Messages} from 'api/collections';


@Component({
  templateUrl: 'build/pages/messages/messages.html',
  pipes: [DateFormatPipe]
})
export class MessagesPage extends MeteorComponent {
  static parameters = [[NavParams]]

  constructor(navParams) {
    super();

    this.activeChat = navParams.get('chat');
    this.senderId = Meteor.userId();
    this.message = '';

    const receiverId = this.activeChat.memberIds.find(memberId => memberId != this.senderId);
    const receiver = Meteor.users.findOne(receiverId);

    this.title = receiver.profile.name;
    this.picture = receiver.profile.picture;

    this.subscribe('messages', this.activeChat._id, () => {
      this.autorun(() => {
        this.messages = this.findMessages();
      }, true);
    });
  }

  ngOnInit() {
    this.autoScroller = this.autoScroll();
  }

  ngOnDestroy() {
    this.autoScroller.disconnect();
  }

  findMessages() {
    return Messages.find({
      chatId: this.activeChat._id
    }, {
      sort: {createdAt: 1},
      transform: this::this.transformMessage
    });
  }

  transformMessage(message) {
    if (!this.senderId) return message;
    message.ownership = this.senderId == message.senderId ? 'mine' : 'other';
    return message;
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

  autoScroll() {
    const autoScroller = new MutationObserver(this::this.scrollDown);

    autoScroller.observe(this.messagesList, {
      childList: true,
      subtree: true
    });

    return autoScroller;
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
