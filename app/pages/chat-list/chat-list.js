import Moment from 'moment';
import {CalendarPipe} from 'angular2-moment';
import {Page, NavController, Modal} from 'ionic-angular';
import {ChatDetailPage} from '../chat-detail/chat-detail';
import {NewChatPage} from '../new-chat/new-chat';
import {ChatsData} from '../../providers/chats-data';


@Page({
  templateUrl: 'build/pages/chat-list/chat-list.html',
  pipes: [CalendarPipe]
})
export class ChatListPage {
  static get parameters() {
    return [[NavController], [ChatsData]];
  }

  constructor(nav, chats) {
    this.nav = nav;
    this.chats = chats;
  }

  goToChatDetail(chat) {
    this.nav.push(ChatDetailPage, { chat });
  }

  addChat() {
    const modal = Modal.create(NewChatPage);
    this.nav.present(modal);
  }

  removeChat(chat) {
    this.chats.remove(chat._id);
  }

  showOptions() {

  }
}
