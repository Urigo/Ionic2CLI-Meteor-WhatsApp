import {Collection} from './collection';
import {ChatModel} from '../models/chat-model';


export class ChatsCollection extends Collection {
  static model = ChatModel
}