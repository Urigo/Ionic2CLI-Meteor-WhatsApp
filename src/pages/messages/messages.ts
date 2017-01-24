import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { Chat, Message, MessageType } from 'api/models';
import { Observable } from 'rxjs';
import { Messages } from 'api/collections';
import { MeteorObservable } from 'meteor-rxjs';

@Component({
  selector: 'messages-page',
  templateUrl: 'messages.html'
})
export class MessagesPage implements OnInit, OnDestroy {
  selectedChat: Chat;
  title: string;
  picture: string;
  messages: Observable<Message[]>;
  message: string = '';
  autoScroller: MutationObserver;
  scrollOffset = 0;

  constructor(
    navParams: NavParams,
    private el: ElementRef
  ) {
    this.selectedChat = <Chat>navParams.get('chat');
    this.title = this.selectedChat.title;
    this.picture = this.selectedChat.picture;
  }

  private get messagesPageContent(): Element {
    return this.el.nativeElement.querySelector('.messages-page-content');
  }

  private get messagesList(): Element {
    return this.messagesPageContent.querySelector('.messages');
  }

  private get scroller(): Element {
    return this.messagesList.querySelector('.scroll-content');
  }

  ngOnInit() {
    this.autoScroller = this.autoScroll();

    let isEven = false;

    this.messages = Messages.find(
      {chatId: this.selectedChat._id},
      {sort: {createdAt: 1}}
    ).map((messages: Message[]) => {
      messages.forEach((message: Message) => {
        message.ownership = isEven ? 'mine' : 'other';
        isEven = !isEven;
      });

      return messages;
    });
  }

  ngOnDestroy() {
    this.autoScroller.disconnect();
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
    // Scroll down and apply specified offset
    this.scroller.scrollTop = this.scroller.scrollHeight - this.scrollOffset;
    // Zero offset for next invocation
    this.scrollOffset = 0;
  }

  onInputKeypress({ keyCode }: KeyboardEvent): void {
    if (keyCode === 13) {
      this.sendTextMessage();
    }
  }

  sendTextMessage(): void {
    // If message was yet to be typed, abort
    if (!this.message) {
      return;
    }

    MeteorObservable.call('addMessage', MessageType.TEXT,
      this.selectedChat._id,
      this.message
    ).zone().subscribe(() => {
      // Zero the input field
      this.message = '';
    });
  }
}
