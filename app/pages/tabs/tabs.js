import {Page} from 'ionic-angular';
import {ChatsPage} from '../chats/chats';
import {ContactsPage} from '../contacts/contacts';
import {FavoritesPage} from '../favorites/favorites';
import {RecentsPage} from '../recents/recents';
import {SettingsPage} from '../settings/settings';


@Page({
  templateUrl: 'build/pages/tabs/tabs.html'
})
export class TabsPage {
  constructor() {
    // this tells the tabs component which Pages
    // should be each tab's root Page
    this.chatsTabRoot = ChatsPage;
    this.contactsTabRoot = ContactsPage;
    this.favoritesTabRoot = FavoritesPage;
    this.recentsTabRoot = RecentsPage;
    this.settingsTabRoot = SettingsPage;
  }
}
