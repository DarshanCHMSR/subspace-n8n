import './App.css'
import { AuthGate } from './auth/Auth.jsx'
import { ChatUI } from './chat/ChatUI.jsx'

function App() {
  return (
    <AuthGate>
      <ChatUI />
    </AuthGate>
  )
}

export default App
