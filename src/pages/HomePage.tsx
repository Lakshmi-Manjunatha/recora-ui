import { CalendarDays, ChartNoAxesColumn, ReceiptText, Sparkles } from 'lucide-react'
import StatCard from '../components/StatCard'
import ReceiptPreview from '../components/ReceiptPreview'
import './HomePage.css'

interface HomePageProps {
  onLoginClick: () => void
  onRegisterClick: () => void
}

function HomePage({ onLoginClick, onRegisterClick }: HomePageProps) {
  return (
    <div className="home-page">
      {/* Welcome section */}
      <section className="home-hero">
        <h1>Welcome to Recora</h1>

        <p className="home-hero-subtitle">
          Your everyday, understood. Organise receipts, discover spending patterns and remember what
          matters.
        </p>
      </section>

      {/* Create account banner */}
      <section className="home-intro" aria-labelledby="home-intro-title">
        <div className="home-intro-content">
          <h2 id="home-intro-title">Less paperwork. More peace of mind.</h2>

          <p>
            Save your shopping receipts, track your spending, and keep important dates in one calm
            place. Sign in to make it yours.
          </p>
        </div>

        <button type="button" className="create-account-btn" onClick={onRegisterClick}>
          Create your account →
        </button>
      </section>

      {/* Illustrative statistics */}
      <section className="dashboard-section" aria-labelledby="dashboard-title">
        <div className="dashboard-heading">
          <h2 id="dashboard-title">See what Recora can do</h2>
          <p>Illustrative demo data</p>
        </div>

        <div className="stats-grid">
          <StatCard
            label="EXAMPLE · WEEKLY GROCERY SPENDING"
            value="£38.90"
            description="Understand where your money goes"
          />

          <StatCard
            label="EXAMPLE · ITEMS PURCHASED"
            value="11"
            description="Keep itemised receipts organised"
          />

          <StatCard
            label="EXAMPLE · UPCOMING EVENTS"
            value="3"
            description="Remember returns and appointments"
          />
        </div>
      </section>

      {/* Example receipts */}
      <section className="home-section" aria-labelledby="receipts-title">
        <h2 id="receipts-title" className="section-title">
          <ReceiptText size={23} aria-hidden="true" />
          Your receipts, together
        </h2>

        <p className="home-section-description">
          Add a receipt, see its items and revisit purchases whenever you need.
        </p>

        <div className="receipt-preview-list">
          <ReceiptPreview
            merchant="Tesco"
            description="Milk, bread, apples and more"
            amount="£11.00"
          />

          <ReceiptPreview
            merchant="Sainsbury’s"
            description="Household and grocery items"
            amount="£27.90"
          />
        </div>
      </section>

      {/* Feature previews */}
      <section className="home-section" aria-labelledby="explore-title">
        <h2 id="explore-title" className="section-title">
          <Sparkles size={23} aria-hidden="true" />
          Explore more with Recora
        </h2>

        <div className="explore-grid">
          <article className="explore-card">
            <Sparkles size={24} aria-hidden="true" />
            <h3>Ask AI</h3>
            <p>Ask questions about saved purchases (planned feature)</p>
          </article>

          <article className="explore-card">
            <CalendarDays size={24} aria-hidden="true" />
            <h3>Events</h3>
            <p>Keep track of due dates and reminders</p>
          </article>

          <article className="explore-card">
            <ChartNoAxesColumn size={24} aria-hidden="true" />
            <h3>Insights</h3>
            <p>Explore your spending and shopping history</p>
          </article>
        </div>
      </section>

      {/* Authentication call to action */}
      <section className="home-cta" aria-labelledby="home-cta-title">
        <h2 id="home-cta-title">Ready to make Recora yours?</h2>

        <p>Your own receipts and spending appear only after you sign in.</p>

        <div className="home-cta-actions">
          <button type="button" className="home-login-btn" onClick={onLoginClick}>
            Log in
          </button>

          <button type="button" className="home-register-btn" onClick={onRegisterClick}>
            Create account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>
          All numbers and receipts above are illustrative examples. This prototype has no real
          authentication or server connection.
        </p>
      </footer>
    </div>
  )
}

export default HomePage
