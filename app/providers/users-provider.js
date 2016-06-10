import {Injectable} from '@angular/core';
import {Provider} from './provider';
import {UsersCollection} from '../collections';


@Injectable()
export class UsersProvider extends Provider {
  constructor() {
    super();
    this.collection = new UsersCollection();

    this.collection.add({
      name: 'Ethan Gonzalez',
      picture: 'https://randomuser.me/api/portraits/thumb/men/1.jpg'
    });

    this.collection.add({
      name: 'Bryan Wallace',
      picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg'
    });

    this.collection.add({
      name: 'Avery Stewart',
      picture: 'https://randomuser.me/api/portraits/thumb/women/1.jpg'
    });

    this.collection.add({
      name: 'Katie Peterson',
      picture: 'https://randomuser.me/api/portraits/thumb/women/2.jpg'
    });

    this.collection.add({
      name: 'Ray Edwards',
      picture: 'https://randomuser.me/api/portraits/thumb/men/2.jpg'
    });
  }
}
