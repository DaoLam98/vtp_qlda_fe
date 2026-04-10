import {BaseModel} from "@c10t/nice-component-library";
import {FormGroup} from "@angular/forms";
import {Utils} from "src/app/shared/utils/utils";

export class JobPositionGroupDetailModel extends BaseModel {
  id: number | null = null;
  index: number | null = null;
  keyword: string | null = null;

  name: string | null = null;
  code: string | null = null;
  description: string | null = null;
  type: 'LEADER' | 'STAFF' = "STAFF";
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';

  constructor(form: FormGroup | number) {
    super();
    if (form instanceof FormGroup) {
      this.name = Utils.getFormControlValue(form,'name');
      this.code = Utils.getFormControlValue(form,'code');
      this.description = Utils.getFormControlValue(form,'description');
      this.type = Utils.getFormControlValue(form,'type');
      this.status = Utils.getFormControlValue(form,'status');
    } else {
      this.id = form;
    }
  }
}
