import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { MeteorObservable } from 'meteor-rxjs';
import { NavParams, PopoverController } from 'ionic-angular';
import { Observable, Subscription } from 'rxjs';
import { Meteor } from 'meteor/meteor';
import { Chat, Message } from 'api/models/whatsapp-models';
import { Messages } from 'api/collections/whatsapp-collections';
import { MessagesOptionsComponent } from '../messages-options/messages-options';

@Component({
  selector: 'messages-page',
  templateUrl: 'messages.html'
})
export class MessagesPage implements OnInit, OnDestroy {
  message: string = '';
  messagesBatchCounter = 0;
  picture: string;
  scrollOffset = 0;
  senderId: string;
  title: string;
  autoScroller: MutationObserver;
  messages: Observable<Message[]>;
  messagesComputation: Subscription;
  messagesSubscription: Subscription;
  loadingMessages: Boolean;
  selectedChat: Chat;

  constructor(
    navParams: NavParams,
    element: ElementRef,
    public popoverCtrl: PopoverController
  ) {
    this.selectedChat = <Chat>navParams.get('chat');
    this.title = this.selectedChat.title;
    this.picture = this.selectedChat.picture;
    this.senderId = Meteor.userId();
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

  private get messageEditor(): HTMLInputElement {
    return <HTMLInputElement>this.messagesPageFooter.querySelector('.message-editor');
  }

  private get scroller(): Element {
    return this.messagesList.querySelector('.scroll-content');
  }

  ngOnInit() {
    this.autoScroller = this.autoScroll();
    this.subscribeMessages();

    MeteorObservable.call('countMessages').subscribe((messagesCount: number) => {
      let scrollListener = this.onScroll.bind(this);
      this.scroller.addEventListener('scroll', scrollListener);
      this.autoRemoveScrollListener(messagesCount, scrollListener);
    });
  }

  ngOnDestroy() {
    this.autoScroller.disconnect();
  }

  onInputKeypress({ keyCode }: KeyboardEvent): void {
    if (keyCode == 13) {
      this.sendMessage();
    }
  }

  onScroll(e): void {
    if (!this.scroller.scrollTop) {
      this.subscribeMessages();
    }
  }

  showOptions(): void {
    const popover = this.popoverCtrl.create(MessagesOptionsComponent, {
      chat: this.selectedChat
    }, {
      cssClass: 'options-popover'
    });

    popover.present();
  }

  subscribeMessages(): Subscription {
    if (this.loadingMessages) return;
    this.loadingMessages = true;
    this.scrollOffset = this.scroller.scrollHeight;

    return MeteorObservable.subscribe('messages',
      this.selectedChat._id,
      ++this.messagesBatchCounter
    ).subscribe(() => {
      if (!this.messagesComputation) this.messagesComputation = this.autorunMessages();
      this.loadingMessages = false;
    });
  }

  autoRemoveScrollListener(
    messagesCount: number,
    scrollListener: EventListener
  ): Subscription {
    return MeteorObservable.autorun().subscribe(() => {
      if (messagesCount != Messages.collection.find().count()) return;
      this.scroller.removeEventListener('scroll', scrollListener);
    });
  }

  autorunMessages(): Subscription {
    return MeteorObservable.autorun().subscribe(() => {
      this.messages = this.findMessages();
    });
  }

  findMessages(): Observable<Message[]> {
    return Messages.find({
      chatId: this.selectedChat._id
    }, {
      sort: { createdAt: 1 }
    })
    .map((messages: Message[]) => messages.map((message) => {
       message.ownership = this.senderId == message.senderId ? 'mine' : 'other';
       return message;
    }));
  }

  sendMessage(): void {
    if (!this.message) return;

    MeteorObservable.call('addMessage',
      this.selectedChat._id,
      this.message
    ).zone().subscribe(() => {
      this.message = '';
    });
  }

  autoScroll(): MutationObserver {
    const autoScroller = new MutationObserver(this.scrollDown.bind(this));

    autoScroller.observe(this.messagesList, {
      childList: true,
      subtree: true
    });

    return autoScroller;
  }

  scrollDown(): void {
    if (this.loadingMessages) return;

    this.scroller.scrollTop = this.scroller.scrollHeight - this.scrollOffset;
    this.scrollOffset = 0;
  }
}

