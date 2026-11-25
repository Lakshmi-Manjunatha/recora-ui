import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import ReceiptsPage from './pages/ReceiptsPage'
import InsightsPage from './pages/InsightsPage'
import AskAiPage from './pages/AskAiPage'
import LoginModal from './components/auth/LoginModal'
import RegisterModal from './components/auth/RegisterModal'
import type { AskAiRequestHandler } from './types/askAi'
import type { Receipt, ReceiptSaveHandler } from './types/receipt'
import './App.css'

type AuthModalType = 'login' | 'register' | null

type PageType = 'home' | 'receipts' | 'insights' | 'ask-ai'

const PAGE_NAMES: Record<PageType, string> = {
  home: 'Home',
  receipts: 'Receipts',
  insights: 'Insights',
  'ask-ai': 'Ask AI',
}

interface AppProps {
  onAskAi?: AskAiRequestHandler
  receipts?: Receipt[]
  onEditReceipt?: ReceiptSaveHandler
}

function App({ onAskAi, receipts, onEditReceipt }: AppProps) {
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
    <div className={`app-layout app-layout--${activePage}`}>
      <Sidebar
        activePage={activePage}
        onHomeClick={handleOpenHome}
        onReceiptsClick={() => handleOpenMemberPage('receipts')}
        onInsightsClick={() => handleOpenMemberPage('insights')}
        onAskAiClick={() => handleOpenMemberPage('ask-ai')}
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

        {activePage === 'receipts' && isAuthenticated && (
          <ReceiptsPage receipts={receipts} onEdit={onEditReceipt} />
        )}
        {activePage === 'insights' && isAuthenticated && <InsightsPage receipts={receipts} />}
        {isAuthenticated && <AskAiPage hidden={activePage !== 'ask-ai'} onRequest={onAskAi} />}
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
