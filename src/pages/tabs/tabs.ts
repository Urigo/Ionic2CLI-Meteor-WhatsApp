import { Component } from '@angular/core';
import { ChatsPage } from '../chats/chats';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  chatsTab = ChatsPage;

  constructor() {

  }
}
