import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient as createWSClient } from 'graphql-ws'
import { getMainDefinition } from '@apollo/client/utilities'
import { nhost } from './nhost'

const httpUrl = nhost.graphql.getUrl()
const wsUrl = httpUrl.replace(/^http/, 'ws') // http->ws, https->wss

const httpLink = new HttpLink({ uri: httpUrl })

const authLink = setContext(async (_, { headers }) => {
  const token = await nhost.auth.getJWTToken()
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }
})

const wsLink = new GraphQLWsLink(
  createWSClient({
    url: wsUrl,
    connectionParams: async () => {
      const token = await nhost.auth.getJWTToken()
      return token ? { headers: { Authorization: `Bearer ${token}` } } : {}
    },
  })
)

const link = split(
  ({ query }) => {
    const def = getMainDefinition(query)
    return def.kind === 'OperationDefinition' && def.operation === 'subscription'
  },
  wsLink,
  authLink.concat(httpLink)
)

export const apollo = new ApolloClient({
  link,
  cache: new InMemoryCache(),
})

