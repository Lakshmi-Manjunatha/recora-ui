import './Header.css'
import { ReceiptText } from 'lucide-react'

function Header() {
  return (
    <header className="app-header">
      <div className="header-breadcrumb">
        <ReceiptText size={16} aria-hidden="true" />
        <span>RECORA / HOME</span>
      </div>
      <button className="login-button" type="button">
        Login
      </button>
    </header>
  )
}

export default Header
