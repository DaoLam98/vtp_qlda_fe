import { BaseModel } from '@c10t/nice-component-library';

export class ReportItemModel extends BaseModel {
  status: string | null = null;
  targetId: number | null = null;
  targetName: string | null = null;
  targetExpressionSpel: string | null = null;
  targetDataType: string | null = null;
  plannedValueNumber: number | null = null;
  plannedValueString: string | null = null;
  actualValueNumber: number | null = null;
  actualValueString: string | null = null;
  rate: number | null = null;
  rateStr: string | null = null;
  startDate: string | null = null;
  endDate: string | null = null;
  periodList: ReportPeriodModel[] = [];
  valueGap: number | null = null;
}

export class ReportPeriodModel extends BaseModel {
  status: string | null = null;
  typeDate: string | null = null;
  plannedValueString: string | null = null;
  actualValueString: string | null = null;
  plannedValueNumber: number | null = null;
  actualValueNumber: number | null = null;
  rate: number | null = null;
  rateStr: string | null = null;
  color: string | null = null;
}
