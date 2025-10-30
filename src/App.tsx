
import './App.css'
import { useState } from 'react'
import DebugLogs from './pages/DebugLogs'
import CeleryLogs from './pages/CeleryLogs'
import TranslationLogs from './pages/TranslationLogs'

function App() {
  const [currentPage, setCurrentPage] = useState<'debug' | 'celery' | 'translation'>('debug')

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'debug':
        return <DebugLogs />
      case 'celery':
        return <CeleryLogs />
      case 'translation':
        return <TranslationLogs />
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
          <button
            onClick={() => setCurrentPage('translation')}
            className={`px-4 py-2 rounded-md transition-colors ${
              currentPage === 'translation'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Translation Logs
          </button>
        </div>
      </nav>

      {/* Page Content */}
      {renderCurrentPage()}
    </>
  )
}

export default App
