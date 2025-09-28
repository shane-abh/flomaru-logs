import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import CeleryLogs from './pages/CeleryLogs'
import DebugLogs from './pages/DebugLogs'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <DebugLogs />
    </>
  )
}

export default App
