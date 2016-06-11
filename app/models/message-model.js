import {Model} from './model';


export class MessageModel extends Model {
  constructor({ chatId, addresseeId, contents }) {
    super();
    this.chatId = chatId;
    this.addresseeId = addresseeId;
    this.contents = contents;
  }
}