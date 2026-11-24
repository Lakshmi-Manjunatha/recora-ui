import { ShoppingBasket } from 'lucide-react'
import './ReceiptPreview.css'

type ReceiptPreviewProps = {
  merchant: string
  description: string
  amount: string
}

function ReceiptPreview({ merchant, description, amount }: ReceiptPreviewProps) {
  return (
    <article className="receipt-preview">
      <div className="receipt-preview-icon">
        <ShoppingBasket size={22} aria-hidden="true" />
      </div>

      <div className="receipt-preview-details">
        <h3>{merchant} · Example receipt</h3>
        <p>{description}</p>
      </div>

      <strong className="receipt-preview-amount">{amount}</strong>
    </article>
  )
}

export default ReceiptPreview
