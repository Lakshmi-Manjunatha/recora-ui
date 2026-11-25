import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import ReceiptsPage from './pages/ReceiptsPage'
import InsightsPage from './pages/InsightsPage'
import LoginModal from './components/auth/LoginModal'
import RegisterModal from './components/auth/RegisterModal'
import './App.css'

type AuthModalType = 'login' | 'register' | null

type PageType = 'home' | 'receipts' | 'insights'

const PAGE_NAMES: Record<PageType, string> = {
  home: 'Home',
  receipts: 'Receipts',
  insights: 'Insights',
}

function App() {
  const [authModal, setAuthModal] = useState<AuthModalType>(null)

  const [activePage, setActivePage] = useState<PageType>('home')

  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const [userName, setUserName] = useState('')

  const handleOpenLogin = () => {
    setAuthModal('login')
  }

  const handleOpenRegister = () => {
    setAuthModal('register')
  }

  const handleCloseAuth = () => {
    setAuthModal(null)
  }

  const handleOpenHome = () => {
    setActivePage('home')
  }

  const handleOpenMemberPage = (page: Exclude<PageType, 'home'>) => {
    if (isAuthenticated || import.meta.env.DEV) {
      setIsAuthenticated(true)
      setActivePage(page)
      return
    }

    handleOpenLogin()
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUserName('')
    setActivePage('home')
    setAuthModal(null)
  }

  return (
    <div className={activePage === 'insights' ? 'app-layout app-layout--insights' : 'app-layout'}>
      <Sidebar
        activePage={activePage}
        onHomeClick={handleOpenHome}
        onReceiptsClick={() => handleOpenMemberPage('receipts')}
        onInsightsClick={() => handleOpenMemberPage('insights')}
        onLoginRequired={handleOpenLogin}
      />

      <main className="main-content">
        <Header
          pageName={PAGE_NAMES[activePage]}
          isAuthenticated={isAuthenticated}
          userName={userName}
          onLoginClick={handleOpenLogin}
          onLogoutClick={handleLogout}
        />

        {activePage === 'home' && (
          <HomePage onLoginClick={handleOpenLogin} onRegisterClick={handleOpenRegister} />
        )}

        {activePage === 'receipts' && isAuthenticated && <ReceiptsPage />}
        {activePage === 'insights' && isAuthenticated && <InsightsPage />}
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
