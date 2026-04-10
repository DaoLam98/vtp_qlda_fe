import {BaseModel} from "@c10t/nice-component-library";

export class RankingProjectModel extends BaseModel {
  index?: number | null = null;
  projectId?: number | null = null;
  projectName?: string | null = null;
  projectCode?: string | null = null;
  amountPlanned?: number | null = null;
  amountActual?: number | null = null;
  amountAccumulated?: number | null = null;
}
