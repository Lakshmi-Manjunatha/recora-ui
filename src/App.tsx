import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import LoginModal from './components/auth/LoginModal'
import RegisterModal from './components/auth/RegisterModal'

import './App.css'

type AuthModalType = 'login' | 'register' | null

function App() {
  const [authModal, setAuthModal] = useState<AuthModalType>(null)

  const handleOpenLogin = () => setAuthModal('login')

  const handleOpenRegister = () => setAuthModal('register')

  const handleCloseAuth = () => setAuthModal(null)

  return (
    <div className="app-layout">
      <Sidebar onLoginRequired={handleOpenLogin} />

      <main className="main-content">
        <Header onLoginClick={handleOpenLogin} />

        <HomePage onLoginClick={handleOpenLogin} onRegisterClick={handleOpenRegister} />
      </main>

      {authModal === 'login' && (
        <LoginModal onClose={handleCloseAuth} onRegisterClick={handleOpenRegister} />
      )}

      {authModal === 'register' && (
        <RegisterModal onClose={handleCloseAuth} onLoginClick={handleOpenLogin} />
      )}
    </div>
  )
}

export default App
