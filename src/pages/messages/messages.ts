import {Component, OnInit, OnDestroy, ElementRef} from "@angular/core";
import { NavParams } from "ionic-angular";
import { Chat, Message } from "api/models/whatsapp-models";
import { Messages } from "api/collections/whatsapp-collections";
import { Observable, Subscription } from "rxjs";
import { MeteorObservable } from "meteor-rxjs";

@Component({
  selector: "messages-page",
  templateUrl: "messages.html"
})
export class MessagesPage implements OnInit, OnDestroy {
  selectedChat: Chat;
  title: string;
  picture: string;
  messages: Observable<Message[]>;
  message: string = "";
  autoScroller: Subscription;
  senderId: string;

  constructor(navParams: NavParams, element: ElementRef) {
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

  ngOnDestroy() {
    if (this.autoScroller) {
      this.autoScroller.unsubscribe();
      this.autoScroller = undefined;
    }
  }

  ngOnInit() {
    this.messages = Messages.find(
      {chatId: this.selectedChat._id},
      {sort: {createdAt: 1}}
    ).map((messages: Message[]) => {
      messages.forEach((message: Message) => {
        message.ownership = this.senderId == message.senderId ? 'mine' : 'other';
      });

      return messages;
    });

    this.autoScroller = MeteorObservable.autorun().subscribe(() => {
      this.scroller.scrollTop = this.scroller.scrollHeight;
      this.messageEditor.focus();
    });
  }

  onInputKeypress({keyCode}: KeyboardEvent): void {
    if (keyCode == 13) {
      this.sendMessage();
    }
  }

  sendMessage(): void {
    MeteorObservable.call('addMessage', this.selectedChat._id, this.message).zone().subscribe(() => {
      this.message = '';
    });
  }
}

