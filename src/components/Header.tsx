import { ReceiptText } from 'lucide-react'
import './Header.css'

interface HeaderProps {
  onLoginClick: () => void
}

function Header({ onLoginClick }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-breadcrumb">
        <ReceiptText size={16} aria-hidden="true" />
        <span>RECORA / HOME</span>
      </div>

      <button className="login-button" type="button" onClick={onLoginClick}>
        Log in
      </button>
    </header>
  )
}

export default Header
