import {FormGroup} from '@angular/forms';
import {BaseModel} from '@c10t/nice-component-library';
import {TranslationValueModel} from './translation-value.model';
import {Utils} from "src/app/shared/utils/utils";

export class TranslationKeyModel extends BaseModel {
  id: number | null = null;
  index: number | null = null;
  keyword: string | null = null;

  key: string = '';
  module: string = '';
  description: string = '';
  translationValues: TranslationValueModel[] = [];
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';

  constructor(form: FormGroup | number) {
    super();

    if(form instanceof FormGroup) {
      this.key = Utils.getFormControlValue(form, 'key');
      this.module = Utils.getFormControlValue(form, 'module');
      this.description = Utils.getFormControlValue(form, 'description');
      this.translationValues = Utils.getFormControlValue(form, 'translationValues');
      this.status = Utils.getFormControlValue(form, 'status');
    } else {
      this.id = form;
    }
  }
}
