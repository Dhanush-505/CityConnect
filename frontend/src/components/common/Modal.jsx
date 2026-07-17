import { useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import styles from '../../styles/components/Modal.module.css';

function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'medium',
  footer
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={`${styles.modal} ${styles[size]}`}>
        <div className={styles.header}>
          <h2>{title}</h2>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            <MdClose size={24} />
          </button>
        </div>
        <div className={styles.content}>
          {children}
        </div>
        {footer && (
          <div className={styles.footer}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
