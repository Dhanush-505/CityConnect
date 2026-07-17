import FieldWorkerLayout from '../components/FieldWorkerLayout';
import styles from '../styles/FieldWorkerProfilePage.module.css';

function FieldWorkerProfilePage() {
  return (
    <FieldWorkerLayout>
      <section className={styles.page}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Profile</p>
            <h1>Field worker details</h1>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.avatar}>RK</div>
          <div className={styles.info}>
            <h2>Ravi Kumar</h2>
            <p>Employee ID: FW-204</p>
            <p>Department: Electricity</p>
            <p>Designation: Field Officer</p>
            <p>Phone: +91 98765 43210</p>
            <p>Email: ravi.kumar@cityconnect.gov</p>
          </div>
        </div>
      </section>
    </FieldWorkerLayout>
  );
}

export default FieldWorkerProfilePage;
