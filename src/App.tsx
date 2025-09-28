
import './App.css'
import { useState } from 'react'
import DebugLogs from './pages/DebugLogs'
import CeleryLogs from './pages/CeleryLogs'

function App() {
  const [currentPage, setCurrentPage] = useState<'debug' | 'celery'>('debug')

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'debug':
        return <DebugLogs />
      case 'celery':
        return <CeleryLogs />
      default:
        return <DebugLogs />
    }
  }

  return (
    <>
      {/* Navigation */}
      <nav className="bg-gray-800 text-white p-4">
        <div className="max-w-7xl mx-auto flex space-x-4">
          <button
            onClick={() => setCurrentPage('debug')}
            className={`px-4 py-2 rounded-md transition-colors ${
              currentPage === 'debug'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Debug Logs
          </button>
          <button
            onClick={() => setCurrentPage('celery')}
            className={`px-4 py-2 rounded-md transition-colors ${
              currentPage === 'celery'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Celery Logs
          </button>
        </div>
      </nav>

      {/* Page Content */}
      {renderCurrentPage()}
    </>
  )
}

export default App
