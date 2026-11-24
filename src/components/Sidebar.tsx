import { ReceiptText } from 'lucide-react'
import './Sidebar.css'

interface SidebarProps {
  onLoginRequired: () => void
}

function Sidebar({ onLoginRequired }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo">
          <ReceiptText size={22} strokeWidth={2} />
        </span>
        <span>Recora</span>
      </div>

      <nav className="sidebar-nav">
        <button className="nav-item active" type="button">
          Home
        </button>

        <button className="nav-item" type="button" onClick={onLoginRequired}>
          Receipts
        </button>

        <button className="nav-item" type="button" onClick={onLoginRequired}>
          Ask AI
        </button>

        <button className="nav-item" type="button" onClick={onLoginRequired}>
          Events
        </button>

        <button className="nav-item" type="button" onClick={onLoginRequired}>
          Insights
        </button>
      </nav>
      <div className="sidebar-bottom">
        <strong>🌱 Your everyday, understood.</strong>
        <p>Keep receipts, shopping insights and important dates in one calm place.</p>
      </div>
    </aside>
  )
}

export default Sidebar
