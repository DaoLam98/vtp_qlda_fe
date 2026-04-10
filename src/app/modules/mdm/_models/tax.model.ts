import {BaseModel} from '@c10t/nice-component-library';
import {FormGroup} from '@angular/forms';
import {Utils} from 'src/app/shared/utils/utils';

export class TaxModel extends BaseModel {
  code: string | null = null;
  name: string | null = null;
  taxAmount: string | null = null;
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
    this.taxAmount = Utils.getFormControlValue(form, 'taxAmount');
    this.description = Utils.getFormControlValue(form, 'description');
    this.status = Utils.getFormControlValue(form, 'status');
  }

  private assignMetaFields(form: FormGroup): void {
    this.keyword = Utils.getFormControlValue(form, 'keyword');
  }
}
