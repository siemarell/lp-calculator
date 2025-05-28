import { useState } from 'react'
import './App.css'
import Button from './components/Button'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <header className="App-header">
        <h1>Options Payoff Calculator</h1>
        <p>React + Vite + TypeScript</p>
        <div className="card">
          <Button 
            text={`count is ${count}`} 
            onClick={() => setCount((count) => count + 1)} 
          />
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
      </header>
    </div>
  )
}

export default App
