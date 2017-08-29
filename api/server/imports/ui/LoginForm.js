import React from 'react';
import { withApollo } from 'react-apollo';
import { Accounts } from 'meteor/std:accounts-ui';

Accounts.ui.config({
  passwordSignupFields: 'EMAIL_ONLY',
});

/*
 * Demonstrate the use of `withApollo` higher order component to give access to
 * the Apollo Client directly in the component's props as `client`.
 * `client` is used here to reset the data store when the current user changes.
 * See for more information: http://dev.apollodata.com/core/meteor.html#Accounts
 */
const LoginForm = props => (
  <Accounts.ui.LoginForm
    onSignedInHook={() => props.client.resetStore()}
    onSignedOutHook={() => props.client.resetStore()}
    onPostSignUpHook={() => props.client.resetStore()}
  />
);

export default withApollo(LoginForm);
