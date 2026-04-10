import {BaseModel} from '@c10t/nice-component-library';
import {FormGroup} from '@angular/forms';
import {Utils} from 'src/app/shared/utils/utils';

export class InvestmentLimitModel extends BaseModel {
  code: string | null = null;
  name: string | null = null;
  limitAmount: string | null = null;
  currencyName: string | null = null;
  currencyId: string | null = null;
  description: string | null = null;
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
    this.code = Utils.getFormControlValue(form, 'code');
    this.name = Utils.getFormControlValue(form, 'name');
    this.currencyId = Utils.getFormControlValue(form, 'currencyId');
    this.limitAmount = Utils.getFormControlValue(form, 'limitAmount');
    this.description = Utils.getFormControlValue(form, 'description');
    this.status = Utils.getFormControlValue(form, 'status');
  }

  private assignMetaFields(form: FormGroup): void {
    this.keyword = Utils.getFormControlValue(form, 'keyword');
  }
}
