import {Component, OnInit, OnDestroy} from '@angular/core';
import {NavParams} from 'ionic-angular';
import {MeteorComponent} from 'angular2-meteor';
import {DateFormatPipe} from 'angular2-moment';
import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {Chat, Message} from 'api/models';
import {Messages} from 'api/collections';


@Component({
  templateUrl: 'build/pages/messages/messages.html',
  pipes: [DateFormatPipe]
})
export class MessagesPage extends MeteorComponent implements OnInit, OnDestroy {
  message = '';
  title: string;
  picture: string;
  messages: Mongo.Cursor<Message>;
  private senderId: string;
  private activeChat: Chat;
  private autoScroller: MutationObserver;

  constructor(navParams: NavParams) {
    super();

    this.activeChat = <Chat>navParams.get('chat');
    this.senderId = Meteor.userId();

    const receiverId = this.activeChat.memberIds.find(memberId => memberId != this.senderId);
    const receiver = Meteor.users.findOne(receiverId);

    this.title = receiver.profile.name;
    this.picture = receiver.profile.picture;

    this.subscribe('messages', this.activeChat._id, () => {
      this.autorun(() => {
        this.messages = this.findMessages();
      });
    });
  }

  ngOnInit(): void {
    this.autoScroller = this.autoScroll();
  }

  ngOnDestroy(): void {
    this.autoScroller.disconnect();
  }

  onInputKeypress({keyCode}: KeyboardEvent): void {
    if (keyCode == 13) {
      this.sendMessage();
    }
  }

  sendMessage(): void {
    this.call('addMessage', this.activeChat._id, this.message);
    this.message = '';
  }

  private findMessages(): Mongo.Cursor<Message> {
    return Messages.find({
      chatId: this.activeChat._id
    }, {
      sort: {createdAt: 1},
      transform: this.transformMessage.bind(this)
    });
  }

  private transformMessage(message: Message): Message {
    if (!this.senderId) return message;
    message.ownership = this.senderId == message.senderId ? 'mine' : 'other';
    return message;
  }

  private autoScroll(): MutationObserver {
    const autoScroller = new MutationObserver(this.scrollDown.bind(this));

    autoScroller.observe(this.messagesList, {
      childList: true,
      subtree: true
    });

    return autoScroller;
  }

  private scrollDown(): void {
    this.scroller.scrollTop = this.scroller.scrollHeight;
    this.messageInput.focus();
  }

  private get messagesPageContent(): Element {
    return document.querySelector('.messages-page-content');
  }

  private get messagesPageFooter(): Element {
    return document.querySelector('.messages-page-footer');
  }

  private get messagesList(): Element {
    return this.messagesPageContent.querySelector('.messages');
  }

  private get messageInput(): HTMLInputElement {
    return <HTMLInputElement>this.messagesPageFooter.querySelector('.message-input');
  }

  private get scroller(): Element {
    return this.messagesList.querySelector('scroll-content');
  }
}
