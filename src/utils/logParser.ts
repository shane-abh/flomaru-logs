export interface ParsedLogEntry {
  time: string
  content: string
  level: string
  timestamp: string
  datetime?: string
  // Parsed components
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

export const parseLogContent = (content: string): ParsedLogEntry => {
  // Pattern to match: [29/Oct/2025 20:57:22] ERROR [vendor.background:236] 1483094 140349782585408 [TASK ebd19c10-db79-4eac-9881-e1c85ee7caa6] message
  const logPattern = /^\[(\d{2}\/\w{3}\/\d{4}\s+\d{2}:\d{2}:\d{2})\]\s+(\w+)\s+\[([^:]+):(\d+)\]\s+(\d+)\s+(\d+)\s+(?:\[TASK\s+([^\]]+)\]\s+)?(.*)$/
  
  const match = content.match(logPattern)
  
  if (match) {
    const [, timestamp, level, module, lineNumber, processId, threadId, taskId, message] = match
    return {
      time: timestamp,
      content,
      level,
      timestamp,
      parsed: {
        timestamp,
        level,
        module,
        lineNumber,
        processId,
        threadId,
        taskId,
        message: message.trim()
      }
    }
  }
  
  // Fallback for unmatched logs
  return {
    time: '',
    content,
    level: 'UNKNOWN',
    timestamp: '',
    parsed: {
      timestamp: '',
      level: 'UNKNOWN',
      module: 'unknown',
      lineNumber: '0',
      processId: '0',
      threadId: '0',
      message: content
    }
  }
}
