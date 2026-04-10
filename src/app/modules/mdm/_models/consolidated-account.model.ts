import { FormGroup } from '@angular/forms';
import { BaseModel, SelectModel } from '@c10t/nice-component-library';
import { Utils } from 'src/app/shared/utils/utils';

export class ConsolidatedAccountModel extends BaseModel {
  name: string | null = null;
  code: string | null = null;
  description: string | null = null;
  netoffAccounts: ConsolidatedAccountNetoffModel[] = [];
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';

  constructor(form: FormGroup | number) {
    super();
    if (form instanceof FormGroup) {
      this.code = Utils.getFormControlValue(form, 'code');
      this.name = Utils.getFormControlValue(form, 'name');
      this.status = Utils.getFormControlValue(form, 'status');
      this.description = Utils.getFormControlValue(form, 'description');
      this.netoffAccounts = Utils.getFormControlValue(form, 'netoffAccounts');
    } else {
      this.id = form;
    }
  }
}

export class ConsolidatedAccountNetoffModel extends BaseModel {
  accountingAccountId: number | null = null;
  accountingAccountName: string | null = null;
  accountingAccountAccountNumber: string | null = null;
  accountingAccountStatus: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';
  organizationId: number | null = null;
  organizationName: string | null = null;
  organizationCode: string | null = null;
  netoffAccountingAccountId: number | null = null;
  netoffAccountingAccountName: string | null = null;
  netoffAccountingAccountAccountNumber: string | null = null;
  netoffAccountingAccountStatus: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';
  netoffOrganizationId: number | null = null;
  netoffOrganizationName: string | null = null;
  netoffOrganizationCode: string | null = null;
  isCreated: boolean = false;
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';
  accountingAccountValues: SelectModel[] = [];
  organizationValues: SelectModel[] = [];
  netoffAccountingAccountValues: SelectModel[] = [];
  netoffOrganizationValues: SelectModel[] = [];

  constructor(form: FormGroup | number) {
    super();
    if (form instanceof FormGroup) {
      this.accountingAccountId = Utils.getFormControlValue(form, 'accountingAccountId');
      this.accountingAccountName = Utils.getFormControlValue(form, 'accountingAccountName');
      this.accountingAccountAccountNumber = Utils.getFormControlValue(form, 'accountingAccountAccountNumber');
      this.organizationId = Utils.getFormControlValue(form, 'organizationId');
      this.organizationName = Utils.getFormControlValue(form, 'organizationName');
      this.organizationCode = Utils.getFormControlValue(form, 'organizationCode');
      this.netoffAccountingAccountId = Utils.getFormControlValue(form, 'netoffAccountingAccountId');
      this.netoffAccountingAccountName = Utils.getFormControlValue(form, 'netoffAccountingAccountName');
      this.netoffAccountingAccountAccountNumber = Utils.getFormControlValue(
        form,
        'netoffAccountingAccountAccountNumber',
      );
      this.netoffOrganizationId = Utils.getFormControlValue(form, 'netoffOrganizationId');
      this.netoffOrganizationName = Utils.getFormControlValue(form, 'netoffOrganizationName');
      this.netoffOrganizationCode = Utils.getFormControlValue(form, 'netoffOrganizationCode');
    } else {
      this.id = form;
    }
  }
}
