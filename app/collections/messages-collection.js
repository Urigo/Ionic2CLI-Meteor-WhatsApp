import {Collection} from './collection';
import {MessageModel} from '../models/message-model';


export class MessagesCollection extends Collection {
  static model = MessageModel
}