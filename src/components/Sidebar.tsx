import { ReceiptText } from 'lucide-react'
import './Sidebar.css'

interface SidebarProps {
  onLoginRequired: () => void
  onReceiptsClick: () => void
  onHomeClick: () => void
  activePage: 'home' | 'receipts'
}

function Sidebar({ onLoginRequired, onReceiptsClick, onHomeClick, activePage }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo">
          <ReceiptText size={22} strokeWidth={2} />
        </span>
        <span>Recora</span>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${activePage === 'home' ? 'active' : ''}`}
          type="button"
          onClick={onHomeClick}
        >
          Home
        </button>

        <button
          className={`nav-item ${activePage === 'receipts' ? 'active' : ''}`}
          type="button"
          onClick={onReceiptsClick}
        >
          Receipts
        </button>

        <button className="nav-item" type="button" onClick={onLoginRequired}>
          Ask AI
        </button>

        {/* Events feature deferred until after cloud deployment.

        <button
          className="nav-item"
          type="button"
          disabled
        >
          Events
        </button>

        */}

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
