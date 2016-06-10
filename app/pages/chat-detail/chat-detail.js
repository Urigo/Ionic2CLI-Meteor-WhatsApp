import {DateFormatPipe} from 'angular2-moment';
import {Page, NavController, NavParams} from 'ionic-angular';
import {UserData} from '../../providers/user-data';


@Page({
  templateUrl: 'build/pages/chat-detail/chat-detail.html',
  pipes: [DateFormatPipe]
})
export class ChatDetailPage {
  static get parameters() {
    return [[NavController], [NavParams], [UserData]];
  }

  constructor(nav, params, user) {
    this.nav = nav;
    this.user = user;
    this.message = '';
    this.chat = params.get('chat');
  }

  sendMessage(messageInput) {
    this.chat.messages.push({
      userId: this.user._id,
      contents: this.message,
      timestamp: new Date()
    });

    this.message = '';
    messageInput.setFocus();
  }

  onInputKeypress(e, messageInput) {
    if (e.keyCode != 13) return;
    this.sendMessage(messageInput);
  }

  getMessageClass(message) {
    const ownership = message.userId === this.user._id ? 'mine' : 'others';
    return `message message-${ownership}`;
  }

  attachFile() {

  }

  showOptions() {

  }

  recordVoiceMessage() {

  }
}

