import { useMemo, useState } from 'react'
import { useMutation, useQuery, useSubscription } from '@apollo/client'
import { useUserData } from '@nhost/react'
import { CREATE_CHAT, GET_CHATS, GET_MESSAGES, INSERT_MESSAGE, MESSAGES_SUB, SEND_MESSAGE_ACTION } from '../graphql'
import { nhost } from '../nhost.js'
import '../styles/chat.css'

export function ChatUI() {
  const [title, setTitle] = useState('New Chat')
  const [activeChat, setActiveChat] = useState(null)
  const user = useUserData()

  const { data: chatsData, refetch: refetchChats } = useQuery(GET_CHATS)
  const [createChat] = useMutation(CREATE_CHAT, { onCompleted: (r) => setActiveChat(r.insert_chats_one.id) })

  const { data: messagesData } = useQuery(GET_MESSAGES, { skip: !activeChat, variables: { chat_id: activeChat } })
  const { data: subData } = useSubscription(MESSAGES_SUB, { skip: !activeChat, variables: { chat_id: activeChat } })

  const [insertMessage] = useMutation(INSERT_MESSAGE)
  const [sendMessageAction] = useMutation(SEND_MESSAGE_ACTION)

  const [input, setInput] = useState('')
  const msgs = useMemo(() => (subData?.messages ?? messagesData?.messages ?? []), [subData, messagesData])

  const onCreateChat = async () => {
    await createChat({ variables: { title } })
    await refetchChats()
  }

  const onSend = async () => {
    if (!activeChat || !input.trim()) return
    const content = input
    setInput('')
    // Optimistic-feel: insert first, then call action
    await insertMessage({ variables: { chat_id: activeChat, role: 'user', content } })
    await sendMessageAction({ variables: { chat_id: activeChat, content } })
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">AI Chat</div>
        <div className="new-chat" style={{ marginBottom: 16, justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, opacity: .85 }}>Signed in as<br/><b>{user?.email}</b></div>
          <button className="btn" onClick={() => {
            if (confirm('Are you sure you want to log out?')) nhost.auth.signOut()
          }}>Logout</button>
        </div>
        <div className="new-chat">
          <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="New chat title" />
          <button className="btn primary" onClick={onCreateChat}>Create</button>
        </div>
        <ul className="chat-list">
          {chatsData?.chats?.map((c) => (
            <li key={c.id}>
              <button className={`chat-item ${activeChat === c.id ? 'active' : ''}`} onClick={() => setActiveChat(c.id)}>
                <span className="chat-item-title">{c.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <main className="chat-panel">
        {!activeChat ? (
          <div className="empty-state">
            <div>
              <h2>Start a conversation</h2>
              <p>Create a new chat from the left panel to begin.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="messages">
              {msgs.map((m) => (
                <div key={m.id} className={`message-row ${m.role === 'user' ? 'user' : 'assistant'}`}>
                  <div className="avatar">{m.role === 'user' ? '🧑' : '🤖'}</div>
                  <div className="bubble">{m.content}</div>
                </div>
              ))}
            </div>
            <div className="composer">
              <input className="input" value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..." />
              <button className="btn primary" onClick={onSend}>Send</button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

