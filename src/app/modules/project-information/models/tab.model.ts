import {BaseModel} from "@c10t/nice-component-library";
export class TabModel extends BaseModel {
  status?: string | null = 'APPROVED';
  name?: string;
  tabIndex?: number;
  targetId?: number;
  targetName?: string;
  targetCode?: string;
  chartType?: string;
  plannedChartType?: string;
  actualChartType?: string;
  chartOder?: number;
}
