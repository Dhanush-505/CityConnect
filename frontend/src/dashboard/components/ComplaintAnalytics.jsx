import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import styles from '../styles/DashboardComponents.module.css';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function ComplaintAnalytics({ categoryData = [], statusData = [] }) {
  const categoryChartData = {
    labels: categoryData.map((item) => item.label),
    datasets: [
      {
        data: categoryData.map((item) => item.value),
        backgroundColor: ['#0f4c81', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'],
        borderWidth: 0,
      },
    ],
  };

  const monthlyChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Complaints',
        data: statusData.map((item) => item.value),
        backgroundColor: 'rgba(15, 76, 129, 0.8)',
        borderRadius: 12,
        maxBarThickness: 22,
      },
    ],
  };

  return (
    <div className={styles.analyticsGrid}>
      <div className={styles.chartPanel}>
        <div className={styles.chartHeader}>
          <h3>Issue Mix</h3>
          <p>Category distribution</p>
        </div>
        <div className={styles.chartCanvas}>
          <Doughnut data={categoryChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
        </div>
      </div>
      <div className={styles.chartPanel}>
        <div className={styles.chartHeader}>
          <h3>Monthly Activity</h3>
          <p>Last 6 months</p>
        </div>
        <div className={styles.chartCanvas}>
          <Bar data={monthlyChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }} />
        </div>
      </div>
    </div>
  );
}

export default ComplaintAnalytics;
