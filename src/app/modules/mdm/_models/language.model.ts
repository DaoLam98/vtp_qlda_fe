import {BaseModel} from '@c10t/nice-component-library';
import {FormGroup} from '@angular/forms';
import {Utils} from "src/app/shared/utils/utils";

export class LanguageModel extends BaseModel {
  id: number | null = null;
  index: number | null = null;
  keyword: string | null = null;

  code: string = '';
  name: string = '';
  description: string = '';
  icon: string = '';
  iconName: string = '';
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';

  constructor(form: FormGroup | number) {
    super();

    if(form instanceof FormGroup) {
      this.id = Utils.getFormControlValue(form, 'id');
      this.code = Utils.getFormControlValue(form, 'code');
      this.name = Utils.getFormControlValue(form, 'name');
      this.description = Utils.getFormControlValue(form, 'description');
      this.icon = Utils.getFormControlValue(form, 'icon');
      this.iconName = Utils.getFormControlValue(form, 'iconName');
      this.status = Utils.getFormControlValue(form, 'status');
    } else {
      this.id = form;
    }
  }
}
