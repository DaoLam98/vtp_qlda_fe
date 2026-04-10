import {BaseModel} from '@c10t/nice-component-library';
import {FormGroup} from '@angular/forms';
import {Utils} from "src/app/shared/utils/utils";

export class CurrencyModel extends BaseModel {
  id: number | null = null;
  index: number | null = null;
  keyword: string | null = null;

  name: string | null = null;
  code: string | null = null;
  description: string | null = null;
  exchangeRates: string = '';
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';

  constructor(form: FormGroup | number) {
    super();
    if (form instanceof FormGroup) {
      this.code = Utils.getFormControlValue(form, 'code');
      this.name = Utils.getFormControlValue(form, 'name');
      this.status = Utils.getFormControlValue(form, 'status');
      this.description = Utils.getFormControlValue(form, 'description');
      this.exchangeRates = Utils.getFormControlValue(form, 'exchangeRates');
    } else {
      this.id = form;
    }
  }
}

export class ExchangeRateModel extends BaseModel {
  code: string = '';
  name: string = '';
  toCurrencyId: number = 0;
  description: string = '';
  createdDate: string = '';
  createdBy: string = '';
  lastModifiedDate: string = '';
  lastModifiedBy: string = '';
  fromDate: string = '';
  toDate: string = '';
  exchangeRate: number = 0;
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';

  constructor(form: FormGroup | number) {
    super();
    if (form instanceof FormGroup) {
      this.code = Utils.getFormControlValue(form, 'code');
      this.name = Utils.getFormControlValue(form, 'name');
      this.status = Utils.getFormControlValue(form, 'status');
      this.description = Utils.getFormControlValue(form, 'description');
      this.createdDate = Utils.getFormControlValue(form, 'createdDate');
      this.lastModifiedDate = Utils.getFormControlValue(form, 'lastModifiedDate');
      this.createdBy = Utils.getFormControlValue(form, 'createdBy');
      this.lastModifiedBy = Utils.getFormControlValue(form, 'lastModifiedBy');
      this.fromDate = Utils.getFormControlValue(form, 'fromDate');
      this.toDate = Utils.getFormControlValue(form, 'toDate');
      this.exchangeRate = Utils.getFormControlValue(form, 'exchangeRate');
      this.toCurrencyId = Utils.getFormControlValue(form, 'toCurrencyId');
    } else {
      this.id = form;
    }
  }
}
