
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import './App.css'

function App() {
    return (
        <div className="app-layout">
            <Sidebar />

            <main className="main-content">
                <Header />

                <p>
                    Your receipts, spending and important
                    purchases — organised in one place.
                </p>
            </main>
        </div>
    )
}

export default App
