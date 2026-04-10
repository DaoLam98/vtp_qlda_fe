import { BaseModel, SelectModel } from '@c10t/nice-component-library';
import {FormGroup} from '@angular/forms';
import {Utils} from 'src/app/shared/utils/utils';

export class AccountModel extends BaseModel {
  accountNumber: string | null = null;
  name: string | null = null;
  parentId: number | null = null;
  parentName: string | null = null;
  targetId: string | null = null;
  accountingAccountId: number | null = null;
  accountingAccountName: string | null = null;
  accountingAccountAccountNumber: string | null = null;
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';
  organizations: [] = [];
  organizationsValue: SelectModel[] = [];
  orgGr: [] = [];
  accountingAccountOrganizations: any

  constructor(form: FormGroup | number) {
    super();
    if (form instanceof FormGroup) {
      this.id = Utils.getFormControlValue(form, 'id');
      this.name = Utils.getFormControlValue(form, 'name');
      this.status = Utils.getFormControlValue(form, 'status');
      this.parentName = Utils.getFormControlValue(form, 'parentName');
      this.accountingAccountName = Utils.getFormControlValue(form, 'name');
      this.targetId = Utils.getFormControlValue(form, 'targetId');
      this.accountingAccountAccountNumber = Utils.getFormControlValue(form, 'accountNumber');
      this.accountingAccountId = Utils.getFormControlValue(form, 'id');
      this.organizations = Utils.getFormControlValue(form, 'organizations');
    } else {
      this.id = form;
    }
  }
}
