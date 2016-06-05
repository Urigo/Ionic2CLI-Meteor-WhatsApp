import Moment from 'moment';
import {CalendarPipe} from 'angular2-moment';
import {Page, NavController, Modal} from 'ionic-angular';
import {NewChatPage} from '../new-chat/new-chat';


@Page({
  templateUrl: 'build/pages/chat-list/chat-list.html',
  pipes: [CalendarPipe]
})
export class ChatListPage {
  static get parameters() {
    return [[NavController]];
  }

  constructor(nav) {
    this.nav = nav;

    this.chats = [
      {
        _id: 0,
        title: 'Ethan Gonzalez',
        picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg',
        recentMessage: {
          text: 'You on your way?',
          timestamp: Moment().subtract(1, 'hours').toDate()
        }
      },
      {
        _id: 1,
        title: 'Bryan Wallace',
        picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
        recentMessage: {
          text: 'Hey, it\'s me',
          timestamp: Moment().subtract(2, 'hours').toDate()
        }
      },
      {
        _id: 2,
        title: 'Avery Stewart',
        picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg',
        recentMessage: {
          text: 'I should buy a boat',
          timestamp: Moment().subtract(1, 'days').toDate()
        }
      },
      {
        _id: 3,
        title: 'Katie Peterson',
        picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg',
        recentMessage: {
          text: 'Look at my mukluks!',
          timestamp: Moment().subtract(4, 'days').toDate()
        }
      },
      {
        _id: 4,
        title: 'Ray Edwards',
        picture: 'https://randomuser.me/api/portraits/thumb/men/2.jpg',
        recentMessage: {
          text: 'This is wicked good ice cream.',
          timestamp: Moment().subtract(2, 'weeks').toDate()
        }
      }
    ];
  }

  goToChatDetail(chat) {
    console.log(`going to chat detail ${chat}`);
  }

  deleteChat(chat) {
    const index = this.chats.indexOf(chat);
    this.chats.splice(index, 1);
  }

  createNewChat() {
    const modal = Modal.create(NewChatPage);
    this.nav.present(modal);
  }

  showOptions() {

  }
}
