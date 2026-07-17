import styles from '../../styles/components/Card.module.css';

function Card({ 
  children, 
  title, 
  className = '', 
  padding = 'default',
  onClick 
}) {
  return (
    <div 
      className={`${styles.card} ${styles[padding]} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : -1}
    >
      {title && <h2 className={styles.title}>{title}</h2>}
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}

export default Card;
