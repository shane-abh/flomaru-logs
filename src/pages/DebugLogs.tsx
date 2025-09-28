import { useEffect, useState, useRef } from 'react'

interface LogEntry {
  level: string
  timestamp: string
  module: string
  processId: string
  threadId: string
  message: string
  rawLine: string
}

const DebugLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const hasFetched = useRef(false)

  const parseLogContent = (content: string): LogEntry[] => {
    const logEntries: LogEntry[] = []
    
    // Split by actual newlines (not escaped \n)
    const lines = content.split('\n').filter(line => line.trim())
    
    lines.forEach((line) => {
      // Try Django log format: [DD/MMM/YYYY HH:MM:SS] LEVEL [module:line] process_id thread_id message
      let match = line.match(/^\[(\d{2}\/\w{3}\/\d{4}\s+\d{2}:\d{2}:\d{2})\]\s+(\w+)\s+\[([^:]+):(\d+)\]\s+(\d+)\s+(\d+)\s+(.*)$/)
      
      if (match) {
        const [, timestamp, level, module, , processId, threadId, message] = match
        logEntries.push({
          level,
          timestamp,
          module,
          processId,
          threadId,
          message,
          rawLine: line
        })
      } else {
        // Try Celery log format: [DD/MMM/YYYY HH:MM:SS] LEVEL [module:line] process_id thread_id message
        match = line.match(/^\[(\d{2}\/\w{3}\/\d{4}\s+\d{2}:\d{2}:\d{2})\]\s+(\w+)\s+\[([^:]+):(\d+)\]\s+(\d+)\s+(\d+)\s+(.*)$/)
        
        if (match) {
          const [, timestamp, level, module, , processId, threadId, message] = match
          logEntries.push({
            level,
            timestamp,
            module,
            processId,
            threadId,
            message,
            rawLine: line
          })
        } else {
          // Try simpler format: [DD/MMM/YYYY HH:MM:SS] LEVEL message
          match = line.match(/^\[(\d{2}\/\w{3}\/\d{4}\s+\d{2}:\d{2}:\d{2})\]\s+(\w+)\s+(.*)$/)
          
          if (match) {
            const [, timestamp, level, message] = match
            logEntries.push({
              level,
              timestamp,
              module: 'unknown',
              processId: '0',
              threadId: '0',
              message,
              rawLine: line
            })
          } else {
            // Handle continuation lines or malformed entries
            if (logEntries.length > 0) {
              const lastEntry = logEntries[logEntries.length - 1]
              lastEntry.message += ' ' + line
              lastEntry.rawLine += '\n' + line
            } else {
              // If no previous entry, create a raw entry
              logEntries.push({
                level: 'RAW',
                timestamp: new Date().toISOString(),
                module: 'unknown',
                processId: '0',
                threadId: '0',
                message: line,
                rawLine: line
              })
            }
          }
        }
      }
    })

    return logEntries
  }

  useEffect(() => {
    if (hasFetched.current) return
    
    const fetchLogs = async () => {
      try {
        hasFetched.current = true
        setLoading(true)
        const res = await fetch('https://www.flomaru.com/api/logs/debug-log/')
        const data = await res.json()
        
        if (data.content) {
          const parsedLogs = parseLogContent(data.content)
          setLogs(parsedLogs)
        } else {
          setError('No log content found in API response')
        }
      } catch (err) {
        console.error('Error fetching logs:', err)
        setError('Failed to fetch logs: ' + (err as Error).message)
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [])

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'WARNING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'INFO':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'DEBUG':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      case 'RAW':
        return 'text-purple-600 bg-purple-50 border-purple-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      // Handle Celery format: "10/Jul/2025 13:25:13"
      if (timestamp.includes('/')) {
        return new Date(timestamp).toLocaleString()
      }
      // Handle Django format: "2025-06-04 10:51:18,412"
      return new Date(timestamp.replace(',', '.')).toLocaleString()
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
    <div className="max-w-7xl  p-6">
      <h1 className="text-3xl font-bold mb-6 ">Debug Logs</h1>
      
      {logs.length === 0 && !loading && !error && (
        <div className="text-center py-8">
          <p className="text-gray-500">No logs found</p>
        </div>
      )}
      
      {/* Logs */}
      {logs.length > 0 && (
        <div className="space-y-2 max-h-screen overflow-y-auto ">
          {logs.map((log, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border-l-4 ${getLogLevelColor(log.level)}`}
            >
              <div className="flex items-start justify-between mb-2 ">
                <div className="flex items-start gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getLogLevelColor(log.level)}`}>
                    {log.level}
                  </span>
                  <span className="text-sm text-gray-600 ">
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span className="text-sm text-gray-500 ">
                    {log.module}
                  </span>
                </div>
                <span className="text-xs text-gray-400 ">
                  PID: {log.processId} | TID: {log.threadId}
                </span>
              </div>
              <div className="text-sm text-gray-800 font-mono whitespace-pre-wrap flex items-start">
                {log.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DebugLogs