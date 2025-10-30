import { useEffect, useState, useRef, useCallback } from 'react'
import { parseLogContent } from '../utils/logParser'

interface LogEntry {
  time: string
  content: string
  level: string
  timestamp: string
  datetime?: string
  parsed?: {
    timestamp: string
    level: string
    module: string
    lineNumber: string
    processId: string
    threadId: string
    taskId?: string
    message: string
  }
}

interface FileInfo {
  filename: string
  path: string
  exists: boolean
}

interface Pagination {
  lines_returned: number
  limit: number
  total_lines_in_file: number
}

interface ApiResponse {
  success: boolean
  data: {
    file_info: FileInfo
    logs: LogEntry[]
    pagination: Pagination
  }
  meta: {
    timestamp: string
    endpoint: string
  }
}

const TranslationLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [hours, setHours] = useState<string>('6')
  const [limit, setLimit] = useState<string>('100')
  const hasFetched = useRef(false)

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const url = new URL('https://www.flomaru.com/api/logs/translation-log/')
      if (hours) url.searchParams.append('hours', hours)
      if (limit) url.searchParams.append('limit', limit)

      const res = await fetch(url.toString())
      const data: ApiResponse = await res.json()

      if (data.success && data.data) {
        // Parse each log entry to extract structured components
        const parsedLogs = data.data.logs.map(log => parseLogContent(log.content))
        setLogs(parsedLogs)
        setFileInfo(data.data.file_info)
        setPagination(data.data.pagination)
      } else {
        setError('API request was not successful')
      }
    } catch (err) {
      console.error('Error fetching logs:', err)
      setError('Failed to fetch logs: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [hours, limit])

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    fetchLogs()
  }, [fetchLogs])

  const handleRefresh = () => {
    fetchLogs()
  }

  const getLogLevelColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'ERROR':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'WARNING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'INFO':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'DEBUG':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      case 'UNKNOWN':
        return 'text-purple-600 bg-purple-50 border-purple-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      if (!timestamp || timestamp.trim() === '') {
        return 'No timestamp'
      }
      if (timestamp.includes('/')) {
        return new Date(timestamp).toLocaleString()
      }
      if (timestamp.includes('T')) {
        return new Date(timestamp).toLocaleString()
      }
      if (timestamp.includes(',')) {
        return new Date(timestamp.replace(',', '.')).toLocaleString()
      }
      return new Date(timestamp).toLocaleString()
    } catch {
      return timestamp
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading logs...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl p-6">
      <h1 className="text-3xl font-bold mb-6">Translation Logs</h1>

      {/* Filter Controls */}
      <div className="mb-6 p-4 bg-white border rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Filter Logs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-1">
              Hours
            </label>
            <input
              type="number"
              id="hours"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="6"
              min="1"
              max="168"
            />
            <p className="text-xs text-gray-500 mt-1">Number of hours to look back (1-168)</p>
          </div>
          <div>
            <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-1">
              Limit
            </label>
            <input
              type="number"
              id="limit"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="100"
              min="1"
              max="1000"
            />
            <p className="text-xs text-gray-500 mt-1">Maximum number of log entries (1-1000)</p>
          </div>
          <div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Refresh Logs'}
            </button>
          </div>
        </div>
      </div>

      {/* File Info */}
      {fileInfo && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">File Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Filename:</span> {fileInfo.filename}
            </div>
            <div>
              <span className="font-medium">Path:</span> {fileInfo.path}
            </div>
            <div>
              <span className="font-medium">Exists:</span>
              <span className={`ml-1 ${fileInfo.exists ? 'text-green-600' : 'text-red-600'}`}>
                {fileInfo.exists ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Pagination Info */}
      {pagination && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span>
              Showing {pagination.lines_returned} of {pagination.total_lines_in_file} lines
            </span>
            <span>
              Limit: {pagination.limit} lines per page
            </span>
          </div>
        </div>
      )}

      {logs.length === 0 && !loading && !error && (
        <div className="text-center py-8">
          <p className="text-gray-500">No logs found</p>
        </div>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <div className="space-y-2 max-h-screen overflow-y-auto">
          {logs.map((log, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${getLogLevelColor(log.level)}`}
            >
              {/* Header with structured info */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-wrap">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getLogLevelColor(log.level)}`}>
                    {log.level}
                  </span>
                  <span className="text-sm text-gray-600">
                    {formatTimestamp(log.time || log.timestamp)}
                  </span>
                  {log.parsed && (
                    <>
                      <span className="text-sm text-blue-600 font-mono">
                        {log.parsed.module}:{log.parsed.lineNumber}
                      </span>
                      <span className="text-xs text-gray-500">
                        PID: {log.parsed.processId} | TID: {log.parsed.threadId}
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Task ID if present */}
              {log.parsed?.taskId && (
                <div className="mb-2">
                  <span className="text-xs text-purple-600 font-mono bg-purple-50 px-2 py-1 rounded">
                    TASK: {log.parsed.taskId}
                  </span>
                </div>
              )}
              
              {/* Message content */}
              <div className="text-sm text-gray-800 font-mono whitespace-pre-wrap">
                {log.parsed?.message || log.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TranslationLogs


