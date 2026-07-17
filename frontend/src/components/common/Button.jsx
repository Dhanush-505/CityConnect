import styles from '../../styles/components/Button.module.css';

function Button({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  onClick,
  type = 'button',
  className = ''
}) {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;
