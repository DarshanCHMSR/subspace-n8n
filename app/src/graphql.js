import { gql } from '@apollo/client'

export const GET_CHATS = gql`
  query GetChats {
    chats(order_by: { created_at: desc }) { id title created_at }
  }
`

export const CREATE_CHAT = gql`
  mutation CreateChat($title: String!) {
    insert_chats_one(object: { title: $title }) { id title }
  }
`

export const GET_MESSAGES = gql`
  query GetMessages($chat_id: uuid!) {
    messages(where: { chat_id: { _eq: $chat_id } }, order_by: { created_at: asc }) {
      id role content created_at
    }
  }
`

export const MESSAGES_SUB = gql`
  subscription MessagesSub($chat_id: uuid!) {
    messages(where: { chat_id: { _eq: $chat_id } }, order_by: { created_at: asc }) {
      id role content created_at
    }
  }
`

export const INSERT_MESSAGE = gql`
  mutation InsertMessage($chat_id: uuid!, $role: String!, $content: String!) {
    insert_messages_one(object: { chat_id: $chat_id, role: $role, content: $content }) { id }
  }
`

export const SEND_MESSAGE_ACTION = gql`
  mutation SendMessage($chat_id: uuid!, $content: String!) {
    sendMessage(chat_id: $chat_id, content: $content) { message_id content }
  }
`

