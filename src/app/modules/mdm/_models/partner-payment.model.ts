import {BaseModel} from '@c10t/nice-component-library';
import {FormGroup} from '@angular/forms';
import {Utils} from "src/app/shared/utils/utils";

export class PartnerPaymentModel extends BaseModel {
  code: string = '';
  name: string = '';
  description: string = '';
  isIntegrated: boolean = false;
  paymentSourceId: string = '';
  isDefault: boolean = false;
  accountNo: string = '';
  type: 'BANK' | 'WALLET' | string | undefined = undefined;
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';

  constructor(form: FormGroup | number) {
    super();
    if (form instanceof FormGroup) {
      this.id = Utils.getFormControlValue(form, 'id');
      this.code = Utils.getFormControlValue(form, 'code');
      this.name = Utils.getFormControlValue(form, 'name');
      this.status = Utils.getFormControlValue(form, 'status');
      this.accountNo = Utils.getFormControlValue(form, 'accountNo');
      this.isDefault = Utils.getFormControlValue(form, 'isDefault');
      this.paymentSourceId = Utils.getFormControlValue(form, 'paymentSourceId');
      this.createdBy = Utils.getFormControlValue(form, 'createdBy');
      this.lastModifiedBy = Utils.getFormControlValue(form, 'lastModifiedBy');
      this.isIntegrated = Utils.getFormControlValue(form, 'isIntegrated');
      this.type = Utils.getFormControlValue(form, 'type');
    } else {
      this.id = form;
    }
  }
}
