declare namespace SMS {
  var twilio: {
    FROM?: string;
    ACCOUNT_SID?: string;
    AUTH_TOKEN?: string;
  };

  var phoneTemplate: {
    from: string;
    text: Function;
  };

  function send(options: Object, callback?: Function): void;
}

declare namespace Meteor {
  function loginWithPhoneAndPassword(selector: Object | String, password: String, callback?: Function): void;
}

declare module 'meteor/meteor' {
  namespace Meteor {
    function loginWithPhoneAndPassword(selector: Object | String, password: String, callback?: Function): void;
  }
}

declare namespace Accounts {
  var _options: {
    verificationCodeLength?: number,
    verificationMaxRetries?: number,
    verificationRetriesWaitTime?: number,
    verificationWaitTime?: number,
    sendPhoneVerificationCodeOnCreation?: boolean,
    forbidClientAccountCreation?: boolean,
    phoneVerificationMasterCode?: Array<string>,
    adminPhoneNumbers?: Array<string>
  };

  function createUserWithPhone(options: Object, callback?: Function): void;
  function requestPhoneVerification(phone: string, callback?: Function): void;
  function verifyPhone(phone: string, code: string, newPassword?: string | Function, callback?: Function): void;
  function isPhoneVerified(): boolean;
  function onPhoneVerification(func: Function): void;
}

declare module 'meteor/accounts-base' {
  namespace Accounts {
    var _options: {
      verificationCodeLength?: number,
      verificationMaxRetries?: number,
      verificationRetriesWaitTime?: number,
      verificationWaitTime?: number,
      sendPhoneVerificationCodeOnCreation?: boolean,
      forbidClientAccountCreation?: boolean,
      phoneVerificationMasterCode?: Array<string>,
      adminPhoneNumbers?: Array<string>
    };

    function createUserWithPhone(options: Object, callback?: Function): void;
    function requestPhoneVerification(phone: string, callback?: Function): void;
    function verifyPhone(phone: string, code: string, newPassword?: string | Function, callback?: Function): void;
    function isPhoneVerified(): boolean;
    function onPhoneVerification(func: Function): void;
  }
}