import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';


ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({chartData}) => {

    const chartPieData = {
        labels: ['Critical', 'High', 'Medium', 'Low'],
        datasets: [
        {
            label: 'Vulnerabilities',
            data: chartData,
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(255, 165, 0, 0.2)',
                'rgba(135, 206, 235, 0.2)',
                'rgba(144, 238, 144, 0.2)',
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(255, 165, 0, 1)',
                'rgba(135, 206, 235, 1)',
                'rgba(144, 238, 144, 1)',
            ],
            borderWidth: 1,
        },
    ]}
    return (
        <Pie data={chartPieData} />
    )
}

export default PieChart;