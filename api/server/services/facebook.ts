import {Users} from "../collections/users";
import {FB} from "fb";

export interface FbProfile {
  name?: string;
  pictureUrl?: string;
};

export class FacebookService {
  private APP_ID: string = Meteor.settings.private.oAuth.facebook.appId;
  private APP_SECRET: string = Meteor.settings.private.oAuth.facebook.secret;

  constructor() {
  }

  async getAppToken(): Promise<string> {
    try {
      return (await FB.api(`/oauth/access_token?client_id=${this.APP_ID}&client_secret=${this.APP_SECRET}&grant_type=client_credentials`)).access_token;
    } catch (e) {
      throw new Meteor.Error('cannot-receive', 'Cannot get an app token');
    }
  }

//TODO: create a before.insert in the users collection to check if the token is valid
  async tokenIsValid(token: string): Promise<boolean> {
    try {
      return (await FB.api(`debug_token?input_token=${token}&access_token=${await this.getAppToken()}`)).data.is_valid;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

// Useless because we already got a long lived token
  async getLongLivedToken(token: string): Promise<string> {
    try {
      return (await FB.api(`/oauth/access_token?grant_type=fb_exchange_token&client_id=${this.APP_ID}&client_secret=${this.APP_SECRET}&fb_exchange_token=${token}`)).access_token;
    } catch (e) {
      throw new Meteor.Error('cannot-receive', 'Cannot get a long lived token');
    }
  }

  async getAccessToken(user: string): Promise<string> {
    //TODO: check if token has expired, if so the user must login again
    try {
      const facebook = await Users.findOne(user).services.facebook;
      if (facebook.accessToken) {
        return facebook.accessToken;
      } else {
        throw new Error();
      }
    } catch (e) {
      throw new Meteor.Error('unauthorized', 'User must be logged-in with Facebook to call this method');
    }
  }

  async getFriends(accessToken: string, user?: string): Promise<any> {
    //TODO: check if more permissions are needed, if so user must login again
    try {
      const params: any = {
        //fields: 'id,name',
        limit: 5000
      };
      let friends: string[] = [];
      let result: any;
      const fb = FB.withAccessToken(accessToken);

      do {
        result = await fb.api(`/${user || 'me'}/friends`, params);
        friends = friends.concat(result.data);
        params.after = result.paging && result.paging.cursors && result.paging.cursors.after;
      } while (result.paging && result.paging.next);

      return friends;
    } catch (e) {
      console.error(e);
      throw new Meteor.Error('cannot-receive', 'Cannot get friends')
    }
  }

  async getProfile(accessToken: string, user?: string): Promise<FbProfile> {
    //TODO: check if more permissions are needed, if so user must login again
    try {
      const params: any = {
        fields: 'id,name,picture.width(800).height(800)'
      };

      let profile: FbProfile = {};

      const fb = FB.withAccessToken(accessToken);
      const result = await fb.api(`/${user || 'me'}`, params);

      profile.name = result.name;
      profile.pictureUrl = result.picture.data.url;

      return profile;
    } catch (e) {
      console.error(e);
      throw new Meteor.Error('cannot-receive', 'Cannot get profile')
    }
  }
}

export const facebookService = new FacebookService();
