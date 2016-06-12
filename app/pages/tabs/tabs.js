import {Component} from '@angular/core';
import {ChatListPage} from '../chat-list/chat-list';


@Component({
  templateUrl: 'build/pages/tabs/tabs.html'
})
export class TabsPage {
  constructor() {
    // this tells the tabs component which Pages
    // should be each tab's root Page
    this.chatListTabRoot = ChatListPage;
  }
}
