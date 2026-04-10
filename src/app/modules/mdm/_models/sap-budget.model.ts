import {FormGroup} from '@angular/forms';
import {BaseModel} from '@c10t/nice-component-library';
import {Utils} from "src/app/shared/utils/utils";

export class SapBudgetModel extends BaseModel {
  name: string = '';
  code: string = '';
  description: string = '';
  organizationId: number | null = null;
  budgetAllocated: number = 0;
  currencyId: number | null = null;
  financialManagementArea: string = '';
  currencyName: string = '';
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';

  constructor(form: FormGroup | number) {
    super();
    if (form instanceof FormGroup) {
      this.id = Utils.getFormControlValue(form, 'id');
      this.name = Utils.getFormControlValue(form, 'name');
      this.code = Utils.getFormControlValue(form, 'code');
      this.description = Utils.getFormControlValue(form, 'description');
      this.financialManagementArea = Utils.getFormControlValue(form, 'financialManagementArea');
      this.status = Utils.getFormControlValue(form, 'status');
    }
  }
}
