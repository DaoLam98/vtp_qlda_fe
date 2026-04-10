import {BaseModel} from "@c10t/nice-component-library";
import {RankingProjectModel} from "src/app/modules/project-information/models/ranking-project.model";



export class RankingCardModel extends BaseModel {
  title?: string | null = null;
  dataTables?: RankingProjectModel[] | null = null;
}
