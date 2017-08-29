// https://github.com/KeithGillette/Apollo-GraphQL-Meteor-Integration-Typings

// Type definitions for Apollo GraphQL  Meteor Integration 0.6.1
// Project: https://github.com/apollographql/meteor-integration
// Definitions by: Keith Gillette <https://github.com/KeithGillette>

// Thanks to: <https://github.com/xavcz> and <https://github.com/csillag>
// <https://github.com/apollographql/meteor-integration/issues/65>

declare module 'meteor/apollo' {
	import { NetworkInterface } from 'apollo-client';
	import { GraphQLSchema } from 'graphql';
	import { ApolloStateSelector } from 'apollo-client/ApolloClient';
	import { CustomResolverMap } from 'apollo-client/data/readFromStore';

	export function createNetworkInterface(customNetworkInterface?: CustomNetworkInterface): NetworkInterface;

	export function meteorClientConfig(customClientConfig?: ApolloClientConfig): any;

	export function createApolloServer(customOptions: GraphQLOptions, customConfig?: customApolloServerConfig): void;

	export interface GraphQLOptions {
		schema: GraphQLSchema;	// values to be used as context and rootValue in resolvers
		context?: Object;	// value to be used as context in resolvers
		rootValue?: Object;	// value to be used as rootValue in resolvers
		formatError?: Function;	// function used to format errors before returning them to clients
		validationRules?: Array<Function>;	// additional validation rules to be applied to client-specified queries
		formatParams?: Function;	// function applied for each query in a batch to format parameters before passing them to `runQuery`
		formatResponse?: Function;	// function applied to each response before returning data to clients
		debug?: boolean;	// a boolean option that will trigger additional debug logging if execution errors occur
	}

	export interface ApolloClientConfig {
		addTypename?: undefined | boolean;
		connectToDevTools?: undefined | boolean;
		customResolvers?: CustomResolverMap;
		dataIdFromObject?: (object: any) => string | null | undefined;
		initialState?: any;
		networkInterface?: any;
		queryDeduplication?: undefined | boolean;
		reduxRootSelector?: string | ApolloStateSelector;
		ssrForceFetchDelay?: undefined | number;
		ssrMode?: boolean;
	}

	export interface CustomNetworkInterface {
		uri?: string;
		opts?: {};
		useMeteorAccounts?: boolean;
		batchingInterface?: boolean;
		batchInterval?: number;
	}

	export interface customApolloServerConfig {
		path?: string;
		configServer?: (server: any) => void;
		graphiql?: boolean;
		graphiqlPath?: string;
		graphiqlOptions?: graphiqlOptions;
	}

	export interface graphiqlOptions {
		endpointURL: string; // URL for the GraphQL endpoint this instance of GraphiQL serves
		query?: string; // optional query to pre-populate the GraphiQL UI with
		operationName?: string; // optional operationName to pre-populate the GraphiQL UI with
		variables?: {}; // optional variables to pre-populate the GraphiQL UI with
		result?: {}; // optional result to pre-populate the GraphiQL UI with
	}
}
