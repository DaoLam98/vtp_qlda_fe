import {ChartConfiguration} from "chart.js";
import Chart from "chart.js/auto";
import {Config} from "src/app/common/models/config.model";
import {ModuleNameEnum} from "src/app/shared/enums/module.name.enum";
import {FieldType} from "src/app/common/models/field.model";


export const FORM_CONFIG: Config = {
  moduleName: ModuleNameEnum.PROJECT,
  name: 'dashboard',
  filterForm: [
    {
      name: 'projectTeam',
      label: 'projectTeam',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: [null],
    },
    {
      name: 'spending',
      label: 'spending',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: [null],
    },
    {
      name: 'project',
      label: 'project',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: [null],
    },
    {
      name: 'company',
      label: 'company',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: [null],
    },
  ]
};

// ==================== CHART CONFIGS ====================

export const DEFAULT_CONFIG_CHART: ChartConfiguration<'doughnut'>['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        padding: 20
      }
    }
  }
};

/**
 * Plugin tạo arrow labels cho Doughnut/Pie Chart
 * Hiển thị phần trăm với mũi tên chỉ từ mỗi slice
 */
export const createArrowLabelPlugin = (arrowLength: number = 10) => {
  return {
    id: 'arrowLabels',
    afterDatasetsDraw: (chart: Chart) => {
      const ctx = chart.ctx;
      const chartArea = chart.chartArea;
      const centerX = (chartArea.left + chartArea.right) / 2;
      const centerY = (chartArea.top + chartArea.bottom) / 2;

      chart.data.datasets.forEach((dataset, datasetIndex) => {
        const meta = chart.getDatasetMeta(datasetIndex);

        meta.data.forEach((element: any, index) => {
          const startAngle = element.startAngle;
          const endAngle = element.endAngle;
          const midAngle = (startAngle + endAngle) / 2;

          const outerRadius = element.outerRadius;
          const startX = centerX + Math.cos(midAngle) * outerRadius;
          const startY = centerY + Math.sin(midAngle) * outerRadius;
          const arrowEndX = centerX + Math.cos(midAngle) * (outerRadius + arrowLength);
          const arrowEndY = centerY + Math.sin(midAngle) * (outerRadius + arrowLength);

          ctx.save();
          ctx.strokeStyle = (dataset.backgroundColor as string[])?.[index] || '#666';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(arrowEndX, arrowEndY);
          ctx.stroke();

          const value = (dataset.data[index] as number);
          const total = (dataset.data as number[]).reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          const labelText = ` ${percentage}%`;

          const labelX = centerX + Math.cos(midAngle) * (outerRadius + arrowLength / 2);
          const labelY = centerY + Math.sin(midAngle) * (outerRadius + arrowLength / 2);

          ctx.fillStyle = '#333';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = midAngle > Math.PI / 2 && midAngle < 3 * Math.PI / 2 ? 'right' : 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(labelText, labelX, labelY);

          ctx.restore();
        });
      });
    }
  };
};


export const createLabelChart = (showLabelBar: boolean = true, showLabelLine: boolean = true) => {
  return {
    id: 'dataLabels',
    afterDatasetsDraw: (chart: { ctx: any; data: { datasets: any[]; }; getDatasetMeta: (arg0: any) => any; }) => {
      const ctx = chart.ctx;

      chart.data.datasets.forEach((dataset, datasetIndex) => {
        const meta = chart.getDatasetMeta(datasetIndex);

        meta.data.forEach((element: any, index: string | number) => {
          const data = dataset.data[index] as number;

          ctx.save();
          ctx.font = 'bold 11px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Vẽ label cho Bar Chart
          if (dataset.type === 'bar' && showLabelBar) {
            const x = element.x;
            const y = element.y;
            const barHeight = element.base - element.y;

            // Format số theo định dạng Việt Nam
            const text = new Intl.NumberFormat('vi-VN').format(data);
            const metrics = ctx.measureText(text);
            const padding = 4;
            const bgWidth = metrics.width + padding * 2;
            const bgHeight = 18;

            // Vị trí label (giữa thanh bar)
            const labelY = y + barHeight / 2;

            // Màu text trắng để dễ đọc trên nền
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';

            // Vẽ label
            ctx.fillText(text, x, labelY);
          }

          // Vẽ label cho Line Chart
          if (dataset.type === 'line' && showLabelLine) {
            const x = element.x;
            const y = element.y;

            // Format số theo định dạng Việt Nam
            const text = new Intl.NumberFormat('vi-VN').format(data);
            const metrics = ctx.measureText(text);
            const padding = 4;
            const bgWidth = metrics.width + padding * 2;
            const bgHeight = 18;

            // Vị trí label (phía trên điểm)
            const labelY = y - 15;

            ctx.fillStyle = '#333';
            ctx.fillText(text, x, labelY);
          }

          ctx.restore();
        });
      });
    }
  }
}

