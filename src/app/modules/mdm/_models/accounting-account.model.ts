import {BaseModel} from '@c10t/nice-component-library';
import {FormGroup} from '@angular/forms';
import {Utils} from 'src/app/shared/utils/utils';
import { OrganizationModel } from 'src/app/modules/mdm/_models/organization.model';

export class AccountingAccountModel extends BaseModel {
  id: number | null = null;
  accountNumber: string | null = null;
  name: string | null = null;
  parentName: string | null = null;
  parentId: string | null = null;
  parentAccountNumber: string | null = null;
  keyword: string | null = null;
  description: string | null = null;
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';
  organizations: OrganizationModel[] = [];
  accountingAccountOrganizations: [] = [];

  constructor(form: FormGroup | number) {
    super();
    if (form instanceof FormGroup) {
      this.accountNumber = Utils.getFormControlValue(form, 'accountNumber');
      this.name = Utils.getFormControlValue(form, 'name');
      this.parentName = Utils.getFormControlValue(form, 'parentName');
      this.parentId = Utils.getFormControlValue(form, 'parentId');
      this.parentAccountNumber = Utils.getFormControlValue(form, 'parentAccountNumber');
      this.description = Utils.getFormControlValue(form, 'description');
      this.status = Utils.getFormControlValue(form, 'status');
      this.organizations = Utils.getFormControlValue(form, 'organizations') || [];
    } else {
      this.id = form;
    }
  }
}
