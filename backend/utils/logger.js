import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  try {
    fs.mkdirSync(logsDir, { recursive: true });
  } catch (err) {
    // Directory created or existing
  }
}

const accessLogPath = path.join(logsDir, 'access.log');
const errorLogPath = path.join(logsDir, 'error.log');
const activityLogPath = path.join(logsDir, 'activity.log');

const writeLog = (filePath, message) => {
  const timestamp = new Date().toISOString();
  const formattedMsg = `[${timestamp}] ${message}\n`;
  fs.appendFile(filePath, formattedMsg, (err) => {
    if (err) console.error('Failed to write log:', err);
  });
};

export const logger = {
  info: (msg) => {
    console.log(`[INFO] ${msg}`);
    writeLog(accessLogPath, `INFO: ${msg}`);
  },
  error: (msg, err = null) => {
    const errorDetails = err ? `${msg} | Stack: ${err.stack || err}` : msg;
    console.error(`[ERROR] ${errorDetails}`);
    writeLog(errorLogPath, `ERROR: ${errorDetails}`);
  },
  activity: (user, action, module, details = '') => {
    const logStr = `USER: ${user} | MODULE: ${module} | ACTION: ${action} | DETAILS: ${typeof details === 'object' ? JSON.stringify(details) : details}`;
    console.log(`[ACTIVITY] ${logStr}`);
    writeLog(activityLogPath, logStr);
  }
};

export default logger;
