import {Component} from '@angular/core';
import {ChatsPage} from '../chats/chats';


@Component({
  templateUrl: 'build/pages/tabs/tabs.html'
})
export class TabsPage {
  constructor() {
    // this tells the tabs component which Pages
    // should be each tab's root Page
    this.chatsTabRoot = ChatsPage;
  }
}
