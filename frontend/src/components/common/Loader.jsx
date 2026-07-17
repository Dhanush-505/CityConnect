import styles from '../../styles/components/Loader.module.css';

function Loader({ 
  size = 'medium', 
  fullPage = false,
  message = 'Loading...'
}) {
  const content = (
    <div className={`${styles.loader} ${styles[size]}`}>
      <div className={styles.spinner}></div>
      <p className={styles.message}>{message}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className={styles.fullPageLoader}>
        {content}
      </div>
    );
  }

  return content;
}

export default Loader;
