import {BaseModel} from "@c10t/nice-component-library";

export class SummaryCardModel extends BaseModel{
  title: string | null = null;
  amount: number | null = null;
  unitOfMeasure: string | null = null;
}
