import React from "react";
import { Bar } from "react-chartjs-2";
import PropTypes from "prop-types";
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend 
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ProgressChart = ({ tasks }) => {
  const data = {
    labels: ['To Do', 'In Progress', 'Done'],
    datasets: [
      {
        label: 'Number of Tasks',
        data: [
          tasks.todo.length, 
          tasks.inProgress.length, 
          tasks.done.length
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)'
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(75, 192, 192)'
        ],
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Task Progress'
      }
    }
  };

  const totalTasks = tasks.todo.length + tasks.inProgress.length + tasks.done.length;
  const completionPercentage = totalTasks > 0 
    ? Math.round((tasks.done.length / totalTasks) * 100) 
    : 0;

  return (
    <div className="progress-chart">
      <div className="chart-container">
        <Bar data={data} options={options} />
      </div>
      <div className="completion-percentage">
        <h3>Project Completion</h3>
        <div className="percentage-bar">
          <div 
            className="percentage-fill" 
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p>{completionPercentage}% Complete</p>
      </div>
    </div>
  );
};

ProgressChart.propTypes = {
  tasks: PropTypes.shape({
    todo: PropTypes.array.isRequired,
    inProgress: PropTypes.array.isRequired,
    done: PropTypes.array.isRequired
  }).isRequired
};

export default ProgressChart; 