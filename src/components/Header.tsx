import { ReceiptText } from 'lucide-react'
import './Header.css'

interface HeaderProps {
    pageName: string
    isAuthenticated: boolean
    userName: string
    onLoginClick: () => void
    onLogoutClick: () => void
}

function Header({
                    pageName,
                    isAuthenticated,
                    userName,
                    onLoginClick,
                    onLogoutClick,
                }: HeaderProps) {
    return (
        <header className="app-header">
            <div className="header-breadcrumb">
                <ReceiptText size={16} aria-hidden="true" />
                <span>RECORA / {pageName.toUpperCase()}</span>
            </div>

            <div className="header-actions">
                {isAuthenticated ? (
                    <>
                        {userName.trim() && (
                            <span className="header-user-name">
                {userName}
              </span>
                        )}

                        <button
                            className="login-button"
                            type="button"
                            onClick={onLogoutClick}
                        >
                            Log out
                        </button>
                    </>
                ) : (
                    <button
                        className="login-button"
                        type="button"
                        onClick={onLoginClick}
                    >
                        Log in
                    </button>
                )}
            </div>
        </header>
    )
}

export default Header