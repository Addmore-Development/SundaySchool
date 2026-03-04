import LandingPage from './features/landingpage/LandingPage'
import './index.css'

function App() {
  return (
    <LandingPage
      onLogin={() => alert('Login coming soon')}
      onRegister={() => alert('Register coming soon')}
    />
  )
}

export default App