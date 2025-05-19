import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface RecordsByDepartment {
  name: string;
  count: number;
}

interface ChartsProps {
  recordsPerDepartment: RecordsByDepartment[];
  departments: string[];
}

const Charts: React.FC<ChartsProps> = ({ recordsPerDepartment, departments }) => {
  const pieChartRef = useRef<HTMLCanvasElement | null>(null);
  const barChartRef = useRef<HTMLCanvasElement | null>(null);
  
  useEffect(() => {
    let pieChart: Chart | null = null;
    let barChart: Chart | null = null;
    
    if (pieChartRef.current && barChartRef.current) {
      // Destroy previous charts if they exist
      if (pieChart) pieChart.destroy();
      if (barChart) barChart.destroy();
      
      // Prepare data for charts
      const labels = recordsPerDepartment.map(d => d.name.charAt(0).toUpperCase() + d.name.slice(1));
      const data = recordsPerDepartment.map(d => d.count);
      
      // Define colors for departments
      const getBackgroundColors = () => {
        return recordsPerDepartment.map(d => {
          switch (d.name.toLowerCase()) {
            case 'accounting':
              return 'rgba(34, 197, 94, 0.7)'; // green
            case 'engineering':
              return 'rgba(59, 130, 246, 0.7)'; // blue
            case 'technology':
              return 'rgba(168, 85, 247, 0.7)'; // purple
            default:
              return 'rgba(156, 163, 175, 0.7)'; // gray
          }
        });
      };
      
      // Create pie chart
      pieChart = new Chart(pieChartRef.current, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: getBackgroundColors(),
            borderColor: 'white',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
            },
            title: {
              display: true,
              text: 'Records by Department',
              padding: {
                top: 10,
                bottom: 10
              }
            }
          }
        }
      });
      
      // Create bar chart
      barChart = new Chart(barChartRef.current, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Number of Records',
            data: data,
            backgroundColor: getBackgroundColors(),
            borderColor: getBackgroundColors().map(color => color.replace('0.7', '1')),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Records Distribution',
              padding: {
                top: 10,
                bottom: 10
              }
            }
          }
        }
      });
    }
    
    // Cleanup on unmount
    return () => {
      if (pieChart) pieChart.destroy();
      if (barChart) barChart.destroy();
    };
  }, [recordsPerDepartment, departments]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <canvas ref={pieChartRef}></canvas>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <canvas ref={barChartRef}></canvas>
      </div>
    </div>
  );
};

export default Charts;