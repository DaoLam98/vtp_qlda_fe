import {BaseModel} from "@c10t/nice-component-library";
import {FormGroup} from "@angular/forms";
import {Utils} from "src/app/shared/utils/utils";


export class DataTypeModel extends BaseModel {
  id: number | null = null;
  name: string | null = null;
  code: string | null = null;
  isPeriodControl: boolean | null = false
  sortOrder: number | null = 0;
  description: string | null = null;
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';

  constructor(form: FormGroup | number) {
    super();
    if (form instanceof FormGroup) {
      this.code = Utils.getFormControlValue(form, 'code');
      this.name = Utils.getFormControlValue(form, 'name');
      this.status = Utils.getFormControlValue(form, 'status');
      this.isPeriodControl = Utils.getFormControlValue(form, 'isPeriodControl');
      this.sortOrder = Utils.getFormControlValue(form, 'sortOrder');
      this.description = Utils.getFormControlValue(form, 'description');
    } else {
      this.id = form;
    }
  }
}
