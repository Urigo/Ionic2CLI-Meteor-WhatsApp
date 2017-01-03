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
    private el: ElementRef,
    private popoverCtrl: PopoverController
  ) {
    this.selectedChat = <Chat>navParams.get('chat');
    this.title = this.selectedChat.title;
    this.picture = this.selectedChat.picture;
    this.senderId = Meteor.userId();
  }

  private get messagesPageContent(): Element {
    return this.el.nativeElement.querySelector('.messages-page-content');
  }

  private get messagesPageFooter(): Element {
    return this.el.nativeElement.querySelector('.messages-page-footer');
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

    // Get total messages count in database so we can have an indication of when to
    // stop the auto-subscriber
    MeteorObservable.call('countMessages').subscribe((messagesCount: number) => {
      // Note that the 'scroller' element is being created dynamically by an Ionic
      // component and therefore the event listener can't be registered directly
      // from the view
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
    // Unless we're at the top of the messages page
    if (!this.scroller.scrollTop) {
      this.subscribeMessages();
    }
  }

  showOptions(): void {
    const popover = this.popoverCtrl.create(MessagesOptionsComponent, {
      chat: this.selectedChat
    }, {
      // Will be used as a CSS selector in our style-sheet
      cssClass: 'options-popover'
    });

    popover.present();
  }

  // Subscribes to the relevant set of messages
  subscribeMessages(): Subscription {
    // Prohibit parallel subscriptions
    if (this.loadingMessages) return;
    // A flag which indicates if there's a subscription in process
    this.loadingMessages = true;
    // A custom offset to be used to re-adjust the scrolling position once
    // new dataset is fetched
    this.scrollOffset = this.scroller.scrollHeight;

    return MeteorObservable.subscribe('messages',
      this.selectedChat._id,
      ++this.messagesBatchCounter
    ).subscribe(() => {
      // Keep tracking changes in the dataset and re-render the view
      if (!this.messagesComputation) this.messagesComputation = this.autorunMessages();
      // Allow incoming subscription requests
      this.loadingMessages = false;
    });
  }

  // Removes the scroll listener once all messages from the past were fetched
  autoRemoveScrollListener(
    messagesCount: number,
    scrollListener: EventListener
  ): Subscription {
    return MeteorObservable.autorun().subscribe(() => {
      if (messagesCount != Messages.collection.find().count()) return;
      this.scroller.removeEventListener('scroll', scrollListener);
    });
  }

  // Detects changes in the messages dataset and re-renders the view
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
    // If message was yet to be typed, abort
    if (!this.message) return;

    MeteorObservable.call('addMessage',
      this.selectedChat._id,
      this.message
    ).zone().subscribe(() => {
      // Zero the input field
      this.message = '';
    });
  }

  // Detects changes in the scroll view and scrolls automatically
  autoScroll(): MutationObserver {
    const autoScroller = new MutationObserver(this.scrollDown.bind(this));

    autoScroller.observe(this.messagesList, {
      childList: true,
      subtree: true
    });

    return autoScroller;
  }

  scrollDown(): void {
    // Don't scroll down if messages subscription is being loaded
    if (this.loadingMessages) return;

    // Scroll down and apply specified offset
    this.scroller.scrollTop = this.scroller.scrollHeight - this.scrollOffset;
    // Zero offset for next invocation
    this.scrollOffset = 0;
  }
}

