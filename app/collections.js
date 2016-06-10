import {UserModel, ChatModel, MessageModel} from './models';

export class Collection {
  constructor() {
    this.model = this.constructor.model;
    this.models = [];
  }

  add(modelData) {
    const model = new this.model(modelData);
    this.models.push(model);
    return model;
  }

  get(modelId) {
    return this.models.find(model => model._id === modelId);
  }

  remove(modelId) {
    const model = this.get(modelId);
    if (model == null) return;

    const index = this.models.indexOf(model);
    this.models.splice(index, 1);
    return model;
  }

  get first() {
    return this.models[0];
  }

  get last() {
    return this.models[this.models.length - 1];
  }
}

export class UsersCollection extends Collection {
  static model = UserModel
}

export class ChatsCollection extends Collection {
  static model = ChatModel
}

export class MessagesCollection extends Collection {
  static model = MessageModel
}