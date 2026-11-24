import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import './LoginModal.css'

interface LoginModalProps {
  onClose: () => void
  onRegisterClick: () => void
}

function LoginModal({ onClose, onRegisterClick }: LoginModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current

    dialog?.showModal()

    return () => {
      dialog?.close()
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className="login-modal"
      aria-labelledby="login-modal-title"
      aria-describedby="login-modal-description"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <div className="login-modal-header">
        <h2 id="login-modal-title">Log in to Recora</h2>

        <button
          type="button"
          className="login-modal-close"
          aria-label="Close login modal"
          onClick={onClose}
        >
          <X size={22} aria-hidden="true" />
        </button>
      </div>

      <p id="login-modal-description" className="login-modal-description">
        Access your receipts, events and personal spending insights.
      </p>

      <form className="login-form" onSubmit={(event) => event.preventDefault()}>
        <div className="login-form-field">
          <label htmlFor="login-email">Email address</label>

          <input
            id="login-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="login-form-field">
          <label htmlFor="login-password">Password</label>

          <input
            id="login-password"
            name="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" className="login-submit-btn" disabled>
          Log in
        </button>
      </form>

      <div className="login-modal-footer">
        <p>New to Recora?</p>

        <button type="button" className="login-register-btn" onClick={onRegisterClick}>
          Create an account
        </button>
      </div>
    </dialog>
  )
}

export default LoginModal
