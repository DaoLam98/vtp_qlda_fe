import {BaseModel} from '@c10t/nice-component-library';
import {FormGroup} from '@angular/forms';
import {Utils} from "src/app/shared/utils/utils";

export class MenuModel extends BaseModel {
  code: string | null = null;
  name: string | null = null;
  url: string | null = null;
  keyword: string | null = null;
  useForWebsite: boolean = false;
  useForMobile: boolean = false;
  useForBpmn: boolean = false;
  moduleId: string | null = null;
  moduleName: string | null = null;
  description: string | null = null;
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';

  constructor(form: FormGroup | number) {
    super();
    if (form instanceof FormGroup) {
      this.assignBasicFields(form);
      this.assignUsageFlags(form);
      this.assignMetaFields(form);
    } else {
      this.id = form;
    }
  }

  private assignBasicFields(form: FormGroup): void {
    this.id = Utils.getFormControlValue(form, 'id');
    this.code = Utils.getFormControlValue(form, 'code');
    this.name = Utils.getFormControlValue(form, 'name');
    this.status = Utils.getFormControlValue(form, 'status');
    this.url = Utils.getFormControlValue(form, 'url');
  }

  private assignUsageFlags(form: FormGroup): void {
    this.useForWebsite = Utils.getFormControlValue(form, 'useForWebsite', false);
    this.useForMobile = Utils.getFormControlValue(form, 'useForMobile', false);
    this.useForBpmn = Utils.getFormControlValue(form, 'useForBpmn', false);
  }

  private assignMetaFields(form: FormGroup): void {
    this.keyword = Utils.getFormControlValue(form, 'keyword');
    this.moduleId = Utils.getFormControlValue(form, 'moduleId');
    this.description = Utils.getFormControlValue(form, 'description');
  }
}
