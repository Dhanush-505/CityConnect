import { Link } from 'react-router-dom';
import styles from '../styles/Navbar.module.css';

function Navbar() {
  return (
    <header className={styles.navbar}>
      <div className={styles.logo}>CityConnect</div>
      <nav className={styles.navLinks}>
        <Link to="/">Home</Link>
        <Link to="/public-dashboard">Public Portal</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </nav>
    </header>
  );
}

export default Navbar;
