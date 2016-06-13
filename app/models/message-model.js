import {Model} from './model';


export class MessageModel extends Model {
  constructor({ chatId, addresseeId, content }) {
    super();
    this.chatId = chatId;
    this.addresseeId = addresseeId;
    this.content = content;
  }
}