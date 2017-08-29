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
    user(root, args, context) {
      /*
       * We access to the current user here thanks to the context. The current
       * user is added to the context thanks to the `meteor/apollo` package.
       */
      return context.user;
    },
  },
  User: {
    emails: ({ emails }) => emails,
    randomString: () => Random.id(),
  },
};
