import {Collection} from './collection';
import {UserModel} from '../models/user-model';


export class UsersCollection extends Collection {
  static model = UserModel
}