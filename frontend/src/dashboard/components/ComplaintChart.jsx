import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import styles from '../styles/DashboardComponents.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function ComplaintChart({ data = [] }) {
  const chartData = {
    labels: data.map((item) => item.category),
    datasets: [
      {
        label: 'Complaints',
        data: data.map((item) => item.count),
        backgroundColor: 'rgba(15, 76, 129, 0.75)',
        borderRadius: 14,
        maxBarThickness: 36,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f4c81',
        titleColor: '#fff',
        bodyColor: '#fff',
      },
    },
    scales: {
      x: {
        ticks: { color: '#33415b', font: { size: 12 } },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#33415b', font: { size: 12 }, precision: 0 },
        grid: { color: 'rgba(15, 76, 129, 0.08)' },
      },
    },
  };

  return (
    <div className={styles.chartCard}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

export default ComplaintChart;
