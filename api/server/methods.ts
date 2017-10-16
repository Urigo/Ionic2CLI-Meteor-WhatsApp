import { Chats } from './collections/chats';
import { Messages } from './collections/messages';
import { MessageType, Profile } from './models';
import { check, Match } from 'meteor/check';
import { Users } from "./collections/users";
import { fcmService } from "./services/fcm";
import { facebookService, FbProfile } from "./services/facebook";

const nonEmptyString = Match.Where((str) => {
  check(str, String);
  return str.length > 0;
});

Meteor.methods({
  addChat(receiverId: string): void {
    if (!this.userId) {
      throw new Meteor.Error('unauthorized',
        'User must be logged-in to create a new chat');
    }

    check(receiverId, nonEmptyString);

    if (receiverId === this.userId) {
      throw new Meteor.Error('illegal-receiver',
        'Receiver must be different than the current logged in user');
    }

    const chatExists = !!Chats.collection.find({
      memberIds: { $all: [this.userId, receiverId] }
    }).count();

    if (chatExists) {
      throw new Meteor.Error('chat-exists',
        'Chat already exists');
    }

    const chat = {
      memberIds: [this.userId, receiverId]
    };

    Chats.insert(chat);
  },
  removeChat(chatId: string): void {
    if (!this.userId) {
      throw new Meteor.Error('unauthorized',
        'User must be logged-in to remove chat');
    }

    check(chatId, nonEmptyString);

    const chatExists = !!Chats.collection.find(chatId).count();

    if (!chatExists) {
      throw new Meteor.Error('chat-not-exists',
        'Chat doesn\'t exist');
    }

    Chats.remove(chatId);
  },
  updateProfile(profile: Profile): void {
    if (!this.userId) throw new Meteor.Error('unauthorized',
      'User must be logged-in to create a new chat');

    check(profile, {
      name: nonEmptyString,
      pictureId: Match.Maybe(nonEmptyString)
    });

    Meteor.users.update(this.userId, {
      $set: {profile}
    });
  },
  addMessage(type: MessageType, chatId: string, content: string) {
    if (!this.userId) throw new Meteor.Error('unauthorized',
      'User must be logged-in to create a new chat');

    check(type, Match.OneOf(String, [ MessageType.TEXT, MessageType.LOCATION ]));
    check(chatId, nonEmptyString);
    check(content, nonEmptyString);

    const chatExists = !!Chats.collection.find(chatId).count();

    if (!chatExists) {
      throw new Meteor.Error('chat-not-exists',
        'Chat doesn\'t exist');
    }

    const userId = this.userId;
    const senderName = Users.collection.findOne({_id: userId}).profile.name;
    const memberIds = Chats.collection.findOne({_id: chatId}).memberIds;
    const tokens: string[] = Users.collection.find(
      {
        _id: {$in: memberIds, $nin: [userId]},
        fcmToken: {$exists: true}
      }
    ).map((el) => el.fcmToken);

    for (let token of tokens) {
      console.log("Sending FCM notification");
      fcmService.sendNotification({"title": `New message from ${senderName}`, "text": content}, token);
    }

    return {
      messageId: Messages.collection.insert({
        chatId: chatId,
        senderId: this.userId,
        content: content,
        createdAt: new Date(),
        type: type
      })
    };
  },
  countMessages(): number {
    return Messages.collection.find().count();
  },
  saveFcmToken(token: string): void {
    if (!this.userId) throw new Meteor.Error('unauthorized', 'User must be logged-in to call this method');

    check(token, nonEmptyString);

    Users.collection.update({_id: this.userId}, {$set: {"fcmToken": token}});
  },
  async getFbProfile(): Promise<FbProfile> {
    if (!this.userId) throw new Meteor.Error('unauthorized', 'User must be logged-in to call this method');

    if (!Users.collection.findOne({'_id': this.userId}).services.facebook) {
      throw new Meteor.Error('unauthorized', 'User must be logged-in with Facebook to call this method');
    }

    //TODO: handle error: token may be expired
    const accessToken = await facebookService.getAccessToken(this.userId);
    //TODO: handle error: user may have denied permissions
    return await facebookService.getProfile(accessToken);
  }
});
