import {ChartOptions} from "chart.js";

export class ChartOptionsUtils {
  public static stackBarChartOptions: ChartOptions = {
    plugins: {
      legend: {
        title: {
          display: false,
          text: ""
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        beginAtZero: true,
        stacked: true,
        ticks: {
          display: true,
          autoSkip: false,
          callback(value: string | number, index: number): number | undefined {
            if (Number.isSafeInteger(value)) {
              return Number.parseInt(value.toString(), 0);
            }
            return undefined;
          }
        }
      }
    },
    datasets: {
      bar: {
        barPercentage: 0.7,      // Độ rộng bar trong group (0-1), giảm để tạo gap
        // categoryPercentage: 0.7   // Độ rộng category (0-1), giảm để tăng gap giữa các nhóm
      }
    }
  };
  public static barChartOptions: ChartOptions = {
    plugins: {
      legend: {
        title: {
          display: false,
          text: ""
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: false,
      },
      y: {
        beginAtZero: true,
        stacked: false,
        ticks: {
          display: true,
          autoSkip: false,
          callback(value: string | number, index: number): number | undefined {
            if (Number.isSafeInteger(value)) {
              return Number.parseInt(value.toString(), 0);
            }
            return undefined;
          }
        }
      }
    }
  };

  public static funnelOptions = {
    responsive: true,
    sort: 'desc',
    legend: {
      position: 'top'
    },
    title: {
      display: false,
      text: ''
    },
    animation: {
      animateScale: true,
      animateRotate: true
    },
    tooltips: {
      callbacks: {
        title: function (tooltipItem: any, data: any) {
          return '';
        },
        label: function (tooltipItem: any, data: any) {
          return data.labels[tooltipItem.index] + ': ' + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
        }
      }
    }
  };
  public static lineChartOptions: ChartOptions = {
    plugins: {
      legend: {
        display: true,
        position: 'top',
        title: {
          display: false,
          text: ""
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        // offset: true,
        stacked: false,
      },
      y: {
        beginAtZero: true,
        stacked: false,
        ticks: {
          display: true,
          autoSkip: false,
          callback(value: string | number, index: number): number | undefined {
            if (Number.isSafeInteger(value)) {
              return Number.parseInt(value.toString(), 0);
            }
            return undefined;
          }
        }
      }
    },
  };

}

