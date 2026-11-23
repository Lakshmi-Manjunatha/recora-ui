import './Header.css'

function Header() {
    return (
        <header className="app-header">
            <div>
                <span className="header-label">YOUR PERSONAL ORGANISER</span>
                <h1>Welcome to Recora</h1>
            </div>

            <button className="login-button" type="button">
                Login
            </button>
        </header>
    )
}

export default Header