import { useState } from 'react'
import { Package } from 'lucide-react'
import StatCard from '../components/StatCard'
import SpendingBreakdown from '../components/insights/SpendingBreakdown'
import { formatAmount, RECEIPT_CATEGORIES } from '../types/receipt'
import type { Receipt } from '../types/receipt'
import { getReceiptInsights } from './receiptInsights'
import type { InsightsCategory, InsightsPeriod } from './receiptInsights'
import './InsightsPage.css'

interface ProductNutrition {
  id: string
  name: string
  nutrients: { name: string; grams: number }[]
  allergens?: string
  ingredients?: string
}

interface PriceComparison {
  id: string
  productName: string
  offers: { retailer: string; amount: number }[]
}

interface InsightsPageProps {
  receipts?: readonly Receipt[]
  isLoading?: boolean
  error?: string | null
  products?: ProductNutrition[]
  priceComparisons?: PriceComparison[]
}

function InsightsPage({
  receipts = [],
  isLoading = false,
  error = null,
  products = [],
  priceComparisons = [],
}: InsightsPageProps) {
  const [period, setPeriod] = useState<InsightsPeriod>('all')
  const [category, setCategory] = useState<InsightsCategory>('all')
  const insights = getReceiptInsights(receipts, period, category)
  const hasResults = insights.receiptCount > 0
  const hasFilters = period !== 'all' || category !== 'all'
  const emptyMessage =
    receipts.length === 0
      ? 'Add receipts to see your spending.'
      : 'No receipts match these filters.'

  const summaryCards = [
    {
      label: 'Total spending',
      value: hasResults ? formatAmount(insights.totalSpending) : '—',
      description: 'Across matching receipts',
    },
    {
      label: 'Monthly spending',
      value: hasResults ? formatAmount(insights.monthlySpending) : '—',
      description: 'This calendar month',
    },
    {
      label: 'Average receipt value',
      value: hasResults ? formatAmount(insights.averageReceiptValue) : '—',
      description: 'Per matching receipt',
    },
    {
      label: 'Total receipts',
      value: hasResults ? insights.receiptCount.toString() : '—',
      description: 'Matching the selected filters',
    },
  ]

  return (
    <section className="insights-page" aria-labelledby="insights-title">
      <div className="insights-heading">
        <h1 id="insights-title">Shopping insights</h1>
        <p>Explore what you bought, what’s in it, and what you spent.</p>
      </div>

      {isLoading ? (
        <div className="insights-card insights-state" role="status">
          Loading insights…
        </div>
      ) : error ? (
        <div className="insights-card insights-state" role="alert">
          {error}
        </div>
      ) : (
        <>
          <div className="insights-filters" role="group" aria-label="Filter receipt insights">
            <label>
              Date range
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value as InsightsPeriod)}
              >
                <option value="all">All time</option>
                <option value="this-month">This month</option>
                <option value="last-six-months">Last 6 months</option>
              </select>
            </label>
            <label>
              Category
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as InsightsCategory)}
              >
                <option value="all">All categories</option>
                {RECEIPT_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setPeriod('all')
                  setCategory('all')
                }}
              >
                Clear filters
              </button>
            )}
          </div>

          <section className="insights-grid insights-summary" aria-label="Spending summary">
            {summaryCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </section>

          {!hasResults && (
            <div className="insights-card insights-state" role="status">
              {emptyMessage}
            </div>
          )}

          <div className="insights-grid insights-spending-grid">
            <SpendingBreakdown
              title="Spending by category"
              entries={insights.categorySpending}
              emptyMessage="No category spending to display."
            />
            <SpendingBreakdown
              title="Monthly spending trends"
              entries={insights.monthlyTrend}
              emptyMessage="No monthly spending to display."
            />
            <SpendingBreakdown
              title="Spending by merchant"
              entries={insights.merchantSpending}
              emptyMessage="No merchant spending to display."
            />
          </div>

          <section className="insights-section" aria-labelledby="product-nutrition-heading">
            <h2 id="product-nutrition-heading">Product nutrition</h2>
            {products.length === 0 ? (
              <p className="insights-card">No product nutrition data available yet.</p>
            ) : (
              <div className="insights-grid insights-product-grid">
                {products.map(({ id, name, nutrients, allergens, ingredients }) => (
                  <article className="insights-card" key={id}>
                    <span className="insights-icon">
                      <Package size={22} aria-hidden="true" />
                    </span>
                    <h3>{name}</h3>
                    <p>Per 100 g</p>
                    <ul className="insights-nutrients">
                      {nutrients.map(({ name: nutrient, grams }) => (
                        <li key={nutrient}>
                          <span>{nutrient}</span>
                          <span className="insights-track" aria-hidden="true">
                            <span style={{ width: `${grams}%` }} />
                          </span>
                          <strong>{grams} g</strong>
                        </li>
                      ))}
                    </ul>
                    {allergens && <p>{allergens}</p>}
                    {ingredients && (
                      <details className="insights-ingredients">
                        <summary aria-label={`View ingredients for ${name}`}>
                          View ingredients
                        </summary>
                        <p>{ingredients}</p>
                      </details>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          <section
            className="insights-card insights-section"
            aria-labelledby="price-comparison-heading"
          >
            <h2 id="price-comparison-heading">Exact-match price comparison</h2>
            <p>Compare products with the same brand, variant, and pack size.</p>
            {priceComparisons.length === 0 ? (
              <p className="insights-notice">No retailer prices available yet.</p>
            ) : (
              priceComparisons.map(({ id, productName, offers }) => (
                <div className="insights-comparison-product" key={id}>
                  <h3>{productName}</h3>
                  <ul className="insights-offers">
                    {offers.map(({ retailer, amount }) => (
                      <li key={retailer}>
                        <span>{retailer}</span>
                        <strong>{formatAmount(amount)}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </section>
        </>
      )}
    </section>
  )
}

export default InsightsPage
