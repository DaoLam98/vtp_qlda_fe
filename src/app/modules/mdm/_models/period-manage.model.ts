import {BaseModel} from '@c10t/nice-component-library';
import {FormGroup} from '@angular/forms';
import {Utils} from 'src/app/shared/utils/utils';

export class PeriodManageModel extends BaseModel {
  period: string | null = null;
  startDate: string | null = null;
  endDate: string | null = null;
  keyword: string | null = null;
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';

  constructor(form: FormGroup | number) {
    super();
    if (form instanceof FormGroup) {
      this.assignBasicFields(form);
      this.assignMetaFields(form);
    } else {
      this.id = form;
    }
  }

  private assignBasicFields(form: FormGroup): void {
    this.id = Utils.getFormControlValue(form, 'id');
    this.period = Utils.getFormControlValue(form, 'code');
    this.startDate = Utils.getFormControlValue(form, 'name');
    this.endDate = Utils.getFormControlValue(form, 'name');
    this.status = Utils.getFormControlValue(form, 'status');
  }

  private assignMetaFields(form: FormGroup): void {
    this.keyword = Utils.getFormControlValue(form, 'keyword');
  }
}
