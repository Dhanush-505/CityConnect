import AuditLog from '../models/AuditLog.js';
import logger from './logger.js';

export const recordAuditLog = async ({ req, action, module, details = {} }) => {
  try {
    const user = req?.user?.email || req?.user?.name || 'Anonymous/System';
    const userId = req?.user?.id || req?.user?._id || null;
    const role = req?.user?.role || 'guest';
    const ipAddress = req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress || '127.0.0.1';

    // File log
    logger.activity(user, action, module, details);

    // MongoDB audit trail record
    await AuditLog.create({
      user,
      userId,
      role,
      action,
      module,
      ipAddress,
      details,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Failed to save AuditLog to database:', error);
  }
};

export default recordAuditLog;
