import { useState } from 'react'
import { useMutation, useQuery, useSubscription } from '@apollo/client'
import { CREATE_CHAT, GET_CHATS, GET_MESSAGES, INSERT_MESSAGE, MESSAGES_SUB, SEND_MESSAGE_ACTION } from '../graphql'

export function ChatUI() {
  const [title, setTitle] = useState('New Chat')
  const [activeChat, setActiveChat] = useState<string | null>(null)

  const { data: chatsData, refetch: refetchChats } = useQuery(GET_CHATS)
  const [createChat] = useMutation(CREATE_CHAT, { onCompleted: (r) => setActiveChat(r.insert_chats_one.id) })

  const { data: messagesData } = useQuery(GET_MESSAGES, { skip: !activeChat, variables: { chat_id: activeChat } })
  useSubscription(MESSAGES_SUB, { skip: !activeChat, variables: { chat_id: activeChat } })

  const [insertMessage] = useMutation(INSERT_MESSAGE)
  const [sendMessageAction] = useMutation(SEND_MESSAGE_ACTION)

  const [input, setInput] = useState('')

  const onCreateChat = async () => {
    await createChat({ variables: { title } })
    await refetchChats()
  }

  const onSend = async () => {
    if (!activeChat || !input.trim()) return
    const content = input
    setInput('')
    await insertMessage({ variables: { chat_id: activeChat, role: 'user', content } })
    await sendMessageAction({ variables: { chat_id: activeChat, content } })
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside style={{ width: 280, borderRight: '1px solid #ddd', padding: 12 }}>
        <h3>Chats</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={title} onChange={e => setTitle(e.target.value)} />
          <button onClick={onCreateChat}>Create</button>
        </div>
        <ul>
          {chatsData?.chats?.map((c: any) => (
            <li key={c.id}>
              <button onClick={() => setActiveChat(c.id)} style={{ fontWeight: activeChat === c.id ? 'bold' : 'normal' }}>{c.title}</button>
            </li>
          ))}
        </ul>
      </aside>
      <main style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column' }}>
        {!activeChat ? (
          <p>Select or create a chat</p>
        ) : (
          <>
            <div style={{ flex: 1, overflow: 'auto', border: '1px solid #eee', padding: 12, marginBottom: 12 }}>
              {messagesData?.messages?.map((m: any) => (
                <div key={m.id} style={{ margin: '8px 0' }}>
                  <b>{m.role}:</b> {m.content}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={input} onChange={e => setInput(e.target.value)} style={{ flex: 1 }} placeholder="Type a message" />
              <button onClick={onSend}>Send</button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

