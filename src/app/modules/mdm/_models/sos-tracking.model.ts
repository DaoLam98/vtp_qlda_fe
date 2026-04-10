import {BaseModel} from '@c10t/nice-component-library';
import {FormGroup} from '@angular/forms';
import {Utils} from "src/app/shared/utils/utils";

export class SosTrackingModel extends BaseModel {
  customerName: string = '';
  customerPhone: string = '';
  logDate: string = ''
  latitude?: string = '';
  longitude?: string = '';
  garageId: number | null | undefined = null;
  operatorId: number | null | undefined = null;
  customerLocation: string = '';
  note?: string = '';
  expertSupportTime?: string = '';
  expertSupport?: string = '';
  expectedTime?: string = '';
  operatorSupportTime?: string = '';
  operatorSupport?: string = '';
  amount?: string = '';
  overExpectedTime?: boolean;
  status: 'CUSTOMER_CLICK' | 'CUSTOMER_REQUESTED' | 'REQUESTED_GARAGE' | 'CONFIRM_CUSTOMER' | 'CUSTOMER_CANCEL' | 'GARAGE_REJECT' | string = '';
  minutes: number | null = null;

  constructor(form: FormGroup | number) {
    super();

    if (form instanceof FormGroup) {
      this.id = Utils.getFormControlValue(form, 'id');
      this.customerName = Utils.getFormControlValue(form,'customerName');
      this.customerPhone = Utils.getFormControlValue(form,'customerPhone');
      this.logDate = Utils.getFormControlValue(form,'logDate');
      this.latitude = Utils.getFormControlValue(form,'latitude');
      this.longitude = Utils.getFormControlValue(form,'longitude');
      this.garageId = Utils.getFormControlValue(form,'garageId');
      this.operatorId = Utils.getFormControlValue(form,'operatorId');
      this.expertSupportTime = Utils.getFormControlValue(form,'expertSupportTime');
      this.expertSupport = Utils.getFormControlValue(form,'expertSupport');
      this.operatorSupportTime = Utils.getFormControlValue(form,'operatorSupportTime');
      this.operatorSupport = Utils.getFormControlValue(form,'operatorSupport');
      this.expectedTime = Utils.getFormControlValue(form,'expectedTime');
      this.amount = Utils.getFormControlValue(form,'amount');
      this.note = Utils.getFormControlValue(form,'note');
      this.customerLocation = Utils.getFormControlValue(form,'customerLocation');
      this.status = Utils.getFormControlValue(form,'status');
      this.minutes = Utils.getFormControlValue(form,'minutes');
    } else {
      this.id = form;
    }
  }
}
