import { ReceiptText } from 'lucide-react'
import './Sidebar.css'

function Sidebar() {
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

        <button className="nav-item" type="button">
          Receipts
        </button>

        <button className="nav-item" type="button">
          Ask AI
        </button>

        <button className="nav-item" type="button">
          Events
        </button>

        <button className="nav-item" type="button">
          Insights
        </button>
      </nav>
    </aside>
  )
}

export default Sidebar
