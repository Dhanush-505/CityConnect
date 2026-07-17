import { Link } from 'react-router-dom';
import { Button, Card } from '../components/common';
import styles from '../styles/HomePage.module.css';

function HomePage() {
  return (
    <section className={styles.homePage}>
      <div className={styles.hero}>
        <h1>Welcome to CityConnect</h1>
        <p>Report civic issues and help your city improve faster.</p>
        <div className={styles.heroButtons}>
          <Link to="/login">
            <Button>Login</Button>
          </Link>
          <Link to="/register">
            <Button variant="secondary">Register</Button>
          </Link>
        </div>
      </div>

      <div className={styles.features}>
        <h2>Why Choose CityConnect?</h2>
        <div className={styles.cards}>
          <Card title="Report a Problem">
            <p>Submit complaints for roads, water, power, sanitation, and more with just a few clicks.</p>
          </Card>
          <Card title="Track Progress">
            <p>Citizens and officials can see issue status in one dashboard. Stay informed every step of the way.</p>
          </Card>
          <Card title="Stay Connected">
            <p>Use CityConnect to keep your neighborhood safe and clean. Build community engagement.</p>
          </Card>
        </div>
      </div>

      <div className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2>Ready to Make a Difference?</h2>
          <p>Join thousands of citizens making their cities better</p>
          <Link to="/register">
            <Button size="large">Get Started Now</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HomePage;
