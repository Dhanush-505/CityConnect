import styles from '../../styles/components/Input.module.css';

function Input({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  name,
  label,
  error = '',
  disabled = false,
  required = false
}) {
  return (
    <div className={styles.inputGroup}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input
        id={name}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
}

export default Input;
