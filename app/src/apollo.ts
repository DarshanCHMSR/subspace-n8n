import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient as createWSClient } from 'graphql-ws'
import { getMainDefinition } from '@apollo/client/utilities'
import { nhost } from './nhost'

const httpLink = new HttpLink({ uri: nhost.graphql.getUrl() })

const wsLink = new GraphQLWsLink(createWSClient({
  url: nhost.graphql.wsGetUrl(),
  connectionParams: async () => {
    const token = await nhost.auth.getJWTToken()
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {}
  }
}))

const link = split(
  ({ query }) => {
    const def = getMainDefinition(query)
    return def.kind === 'OperationDefinition' && def.operation === 'subscription'
  },
  wsLink,
  httpLink
)

export const apollo = new ApolloClient({
  link,
  cache: new InMemoryCache(),
})

