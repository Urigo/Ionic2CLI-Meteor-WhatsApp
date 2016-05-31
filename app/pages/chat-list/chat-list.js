import {Page, NavController, Modal} from 'ionic-angular';
import {NewChatPage} from '../new-chat/new-chat';


@Page({
  templateUrl: 'build/pages/chat-list/chat-list.html'
})
export class ChatListPage {
  static get parameters() {
    return [[NavController]];
  }

  constructor(nav) {
    this.nav = nav;
  }

  createNewChat() {
    const modal = Modal.create(NewChatPage);
    this.nav.present(modal);
  }

  showOptions() {

  }
}
