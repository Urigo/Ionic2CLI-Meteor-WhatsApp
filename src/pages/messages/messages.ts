import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { NavParams, PopoverController } from 'ionic-angular';
import { Chat, Message, MessageType, Location } from 'api/models';
import { Messages } from 'api/collections';
import { MeteorObservable } from 'meteor-rxjs';
import * as moment from 'moment';
import * as _ from 'lodash';
import { MessagesOptionsComponent } from './messages-options';
import { Subscription, Observable, Subscriber } from 'rxjs';
import { MessagesAttachmentsComponent } from './messages-attachments';
import { PictureService } from '../../services/picture';

@Component({
  selector: 'messages-page',
  templateUrl: 'messages.html'
})
export class MessagesPage implements OnInit, OnDestroy {
  selectedChat: Chat;
  title: string;
  picture: string;
  messagesDayGroups;
  message: string = '';
  autoScroller: MutationObserver;
  scrollOffset = 0;
  senderId: string;
  loadingMessages: boolean;
  messagesComputation: Subscription;
  messagesBatchCounter: number = 0;

  constructor(
    navParams: NavParams,
    private el: ElementRef,
    private popoverCtrl: PopoverController,
    private pictureService: PictureService
  ) {
    this.selectedChat = <Chat>navParams.get('chat');
    this.title = this.selectedChat.title;
    this.picture = this.selectedChat.picture;
    this.senderId = Meteor.userId();
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
    this.subscribeMessages();

    // Get total messages count in database so we can have an indication of when to
    // stop the auto-subscriber
    MeteorObservable.call('countMessages').subscribe((messagesCount: number) => {
      Observable
      // Chain every scroll event
        .fromEvent(this.scroller, 'scroll')
        // Remove the scroll listener once all messages have been fetched
        .takeUntil(this.autoRemoveScrollListener(messagesCount))
        // Filter event handling unless we're at the top of the page
        .filter(() => !this.scroller.scrollTop)
        // Prohibit parallel subscriptions
        .filter(() => !this.loadingMessages)
        // Invoke the messages subscription once all the requirements have been met
        .forEach(() => this.subscribeMessages());
    });
  }

  ngOnDestroy() {
    this.autoScroller.disconnect();
  }

  // Subscribes to the relevant set of messages
  subscribeMessages(): void {
    // A flag which indicates if there's a subscription in process
    this.loadingMessages = true;
    // A custom offset to be used to re-adjust the scrolling position once
    // new dataset is fetched
    this.scrollOffset = this.scroller.scrollHeight;

    MeteorObservable.subscribe('messages',
      this.selectedChat._id,
      ++this.messagesBatchCounter
    ).subscribe(() => {
      // Keep tracking changes in the dataset and re-render the view
      if (!this.messagesComputation) {
        this.messagesComputation = this.autorunMessages();
      }

      // Allow incoming subscription requests
      this.loadingMessages = false;
    });
  }

  // Detects changes in the messages dataset and re-renders the view
  autorunMessages(): Subscription {
    return MeteorObservable.autorun().subscribe(() => {
      this.messagesDayGroups = this.findMessagesDayGroups();
    });
  }

  // Removes the scroll listener once all messages from the past were fetched
  autoRemoveScrollListener<T>(messagesCount: number): Observable<T> {
    return Observable.create((observer: Subscriber<T>) => {
      Messages.find().subscribe({
        next: (messages) => {
          // Once all messages have been fetched
          if (messagesCount !== messages.length) {
            return;
          }

          // Signal to stop listening to the scroll event
          observer.next();

          // Finish the observation to prevent unnecessary calculations
          observer.complete();
        },
        error: (e) => {
          observer.error(e);
        }
      });
    });
  }

  showOptions(): void {
    const popover = this.popoverCtrl.create(MessagesOptionsComponent, {
      chat: this.selectedChat
    }, {
      cssClass: 'options-popover messages-options-popover'
    });

    popover.present();
  }

  findMessagesDayGroups() {
    return Messages.find({
      chatId: this.selectedChat._id
    }, {
      sort: { createdAt: 1 }
    })
      .map((messages: Message[]) => {
        const format = 'D MMMM Y';

        // Compose missing data that we would like to show in the view
        messages.forEach((message) => {
          message.ownership = this.senderId == message.senderId ? 'mine' : 'other';

          return message;
        });

        // Group by creation day
        const groupedMessages = _.groupBy(messages, (message) => {
          return moment(message.createdAt).format(format);
        });

        // Transform dictionary into an array since Angular's view engine doesn't know how
        // to iterate through it
        return Object.keys(groupedMessages).map((timestamp: string) => {
          return {
            timestamp: timestamp,
            messages: groupedMessages[timestamp],
            today: moment().format(format) === timestamp
          };
        });
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
    // Don't scroll down if messages subscription is being loaded
    if (this.loadingMessages) {
      return;
    }

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

  sendLocationMessage(location: Location): void {
    MeteorObservable.call('addMessage', MessageType.LOCATION,
      this.selectedChat._id,
      `${location.lat},${location.lng},${location.zoom}`
    ).zone().subscribe(() => {
      // Zero the input field
      this.message = '';
    });
  }

  showAttachments(): void {
    const popover = this.popoverCtrl.create(MessagesAttachmentsComponent, {
      chat: this.selectedChat
    }, {
      cssClass: 'attachments-popover'
    });

    popover.onDidDismiss((params) => {
      if (params) {
        if (params.messageType === MessageType.LOCATION) {
          const location = params.selectedLocation;
          this.sendLocationMessage(location);
        }
        else if (params.messageType === MessageType.PICTURE) {
          const blob: File = params.selectedPicture;
          this.sendPictureMessage(blob);
        }
      }
    });

    popover.present();
  }

  sendPictureMessage(blob: File): void {
    this.pictureService.upload(blob).then((picture) => {
      MeteorObservable.call('addMessage', MessageType.PICTURE,
        this.selectedChat._id,
        picture.url
      ).zone().subscribe();
    });
  }

  getLocation(locationString: string): Location {
    const splitted = locationString.split(',').map(Number);

    return <Location>{
      lat: splitted[0],
      lng: splitted[1],
      zoom: Math.min(splitted[2] || 0, 19)
    };
  }
}
