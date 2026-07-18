import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// 1. Pie Chart - Complaint Status Distribution
export function StatusPieChart({ data = [] }) {
  const chartData = {
    labels: data.map((d) => d.status || d.label),
    datasets: [
      {
        data: data.map((d) => d.count || d.value),
        backgroundColor: [
          '#6366f1', // Submitted
          '#f59e0b', // Under Review / Assigned
          '#3b82f6', // In Progress
          '#10b981', // Completed
          '#059669', // Closed
          '#ef4444'  // Rejected
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 12 } } },
      tooltip: { cornerRadius: 8 }
    }
  };

  return <Pie data={chartData} options={options} />;
}

// 2. Bar Chart - Complaints by Department
export function DepartmentBarChart({ data = [] }) {
  const chartData = {
    labels: data.map((d) => d.department || d.label),
    datasets: [
      {
        label: 'Total Complaints',
        data: data.map((d) => d.totalComplaints || d.count || 0),
        backgroundColor: 'rgba(15, 76, 129, 0.85)',
        borderRadius: 8,
        maxBarThickness: 45
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }
    }
  };

  return <Bar data={chartData} options={options} />;
}

// 3. Line Chart - Monthly Trend (Created vs Closed)
export function MonthlyTrendLineChart({ data = [] }) {
  const chartData = {
    labels: data.map((d) => d.month),
    datasets: [
      {
        label: 'Complaints Created',
        data: data.map((d) => d.created || 0),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.3,
        fill: true,
        pointRadius: 4
      },
      {
        label: 'Complaints Closed',
        data: data.map((d) => d.closed || 0),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3,
        fill: true,
        pointRadius: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }
    }
  };

  return <Line data={chartData} options={options} />;
}

// 4. Area Chart - Daily Complaint Activity (30 Days)
export function DailyActivityAreaChart({ data = [] }) {
  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: 'Daily Submissions',
        data: data.map((d) => d.count || 0),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 3
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }
    }
  };

  return <Line data={chartData} options={options} />;
}

// 5. Doughnut Chart - Priority Distribution
export function PriorityDoughnutChart({ data = {} }) {
  const chartData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [
      {
        data: [data.Critical || 0, data.High || 0, data.Medium || 0, data.Low || 0],
        backgroundColor: ['#dc2626', '#f97316', '#3b82f6', '#10b981'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } }
  };

  return <Doughnut data={chartData} options={options} />;
}

// 6. Horizontal Bar Chart - Top Complaint Categories
export function CategoryHorizontalBarChart({ data = [] }) {
  const chartData = {
    labels: data.map((d) => d.category),
    datasets: [
      {
        label: 'Count',
        data: data.map((d) => d.count),
        backgroundColor: '#0f4c81',
        borderRadius: 6,
        maxBarThickness: 28
      }
    ]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
      y: { grid: { display: false } }
    }
  };

  return <Bar data={chartData} options={options} />;
}

// 7. Stacked Bar Chart - Department Performance Breakdown
export function DepartmentStackedBarChart({ data = [] }) {
  const chartData = {
    labels: data.map((d) => d.department),
    datasets: [
      {
        label: 'Completed',
        data: data.map((d) => d.completed || 0),
        backgroundColor: '#10b981',
        borderRadius: 4
      },
      {
        label: 'Pending',
        data: data.map((d) => d.pending || 0),
        backgroundColor: '#f59e0b',
        borderRadius: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: {
      x: { stacked: true, grid: { display: false } },
      y: { stacked: true, beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }
    }
  };

  return <Bar data={chartData} options={options} />;
}
