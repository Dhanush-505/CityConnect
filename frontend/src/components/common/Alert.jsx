import { useEffect, useState } from 'react';
import { MdClose, MdCheckCircle, MdError, MdWarning, MdInfo } from 'react-icons/md';
import styles from '../../styles/components/Alert.module.css';

function Alert({ 
  type = 'info', 
  message, 
  onClose,
  autoClose = true,
  duration = 5000,
  className = ''
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!autoClose || !isVisible) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [autoClose, duration, isVisible, onClose]);

  if (!isVisible) return null;

  const iconMap = {
    success: <MdCheckCircle size={20} />,
    error: <MdError size={20} />,
    warning: <MdWarning size={20} />,
    info: <MdInfo size={20} />
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  return (
    <div className={`${styles.alert} ${styles[type]} ${className}`}>
      <div className={styles.icon}>
        {iconMap[type]}
      </div>
      <div className={styles.message}>
        {message}
      </div>
      <button 
        className={styles.closeButton}
        onClick={handleClose}
        aria-label="Close alert"
      >
        <MdClose size={18} />
      </button>
    </div>
  );
}

export default Alert;
