import {BaseModel} from '@c10t/nice-component-library';
import {FormGroup} from '@angular/forms';
import {Utils} from 'src/app/shared/utils/utils';

export class ScheduleModel extends BaseModel {
  name: string | null = null;
  cron: string | null = null;
  isOneTime = false;
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';
  maximumLock: string | null = null;
  keyword: string | null = null;
  service: string | null = null;

  constructor(form: FormGroup | number) {
    super();
    if (form instanceof FormGroup) {
      this.assignBasicFields(form);
      this.assignUsageFlags(form);
    } else {
      this.id = form;
    }
  }

  private assignBasicFields(form: FormGroup): void {
    this.id = Utils.getFormControlValue(form, 'id');
    this.name = Utils.getFormControlValue(form, 'name');
    this.cron = Utils.getFormControlValue(form, 'cron');
    this.keyword = Utils.getFormControlValue(form, 'keyword');
    this.service = Utils.getFormControlValue(form, 'service');
    this.maximumLock = Utils.getFormControlValue(form, 'maximumLock');
    this.status = Utils.getFormControlValue(form, 'status');
  }

  private assignUsageFlags(form: FormGroup): void {
    this.isOneTime = Utils.getFormControlValue(form, 'isOneTime', false);
  }
}
