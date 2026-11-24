import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import './LoginModal.css'

interface RegisterModalProps {
  onClose: () => void
  onLoginClick: () => void
}

function RegisterModal({ onClose, onLoginClick }: RegisterModalProps) {
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
      className="login-modal register-modal"
      aria-labelledby="register-modal-title"
      aria-describedby="register-modal-description"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <div className="login-modal-header">
        <h2 id="register-modal-title">Create a Recora account</h2>

        <button
          type="button"
          className="login-modal-close"
          aria-label="Close registration modal"
          onClick={onClose}
        >
          <X size={22} aria-hidden="true" />
        </button>
      </div>

      <p id="register-modal-description" className="login-modal-description">
        Start organising your receipts, tracking spending and managing important dates.
      </p>

      <form className="login-form" onSubmit={(event) => event.preventDefault()}>
        <div className="login-form-field">
          <label htmlFor="register-name">Full name</label>

          <input
            id="register-name"
            name="fullName"
            type="text"
            placeholder="Enter your full name"
            autoComplete="name"
            required
          />
        </div>

        <div className="login-form-field">
          <label htmlFor="register-email">Email address</label>

          <input
            id="register-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="login-form-field">
          <label htmlFor="register-password">Password</label>

          <input
            id="register-password"
            name="password"
            type="password"
            placeholder="Create a password"
            autoComplete="new-password"
            required
          />
        </div>

        <div className="login-form-field">
          <label htmlFor="register-confirm-password">Confirm password</label>

          <input
            id="register-confirm-password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            autoComplete="new-password"
            required
          />
        </div>

        <button type="submit" className="login-submit-btn" disabled>
          Create account
        </button>
      </form>

      <div className="login-modal-footer">
        <p>Already have an account?</p>

        <button type="button" className="login-register-btn" onClick={onLoginClick}>
          Log in
        </button>
      </div>
    </dialog>
  )
}

export default RegisterModal
