import { Random } from 'meteor/random';

export const typeDefs = [
  `
type Email {
  address: String
  verified: Boolean
}

type User {
  emails: [Email]
  randomString: String
  _id: String
}

type Query {
  user: User
}
`,
];

export const resolvers = {
  Query: {
    async user(root, args, context) {
      /*
       * We access to the current user here thanks to the context. The current
       * user is added to the context thanks to the `meteor/apollo` package.
       */

      // console.log(context.user);
      // Meteor.users.find().fetch()
      const s =  await Meteor.users.find().fetch();
      // console.log(s[0].emails[0]);
      // console.log(s[0].emails[0]);
      return s;
    },
  },
  User: {
    emails: (users) => users[0].emails,
    randomString: () => Random.id(),
  },
};
