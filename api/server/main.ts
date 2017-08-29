import { createApolloServer } from 'meteor/apollo';
import { makeExecutableSchema } from 'graphql-tools';
import { Meteor } from 'meteor/meteor';
import {typeDefs, resolvers} from './imports/api/schema';
import * as cors from 'cors';

Meteor.startup(() => {

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });


  createApolloServer({
    schema,
    context: {},
    formatError(error) {
      console.error(error.stack);

      return error;
    },
  }, {
    configServer(app) {
        app.use(cors());
    },
  });

});
