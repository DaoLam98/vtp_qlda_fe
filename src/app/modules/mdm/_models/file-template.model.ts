import {BaseModel} from '@c10t/nice-component-library';
import {FormGroup} from '@angular/forms';
import {Utils} from "src/app/shared/utils/utils";

export class FileTemplateModel extends BaseModel {
  code : string | null = null;
  name : string | null = null;
  description : string | null = null;
  fileName : string | null = null;
  pathFile : string | null = null;
  type: 'IMPORT' | 'EXPORT' = 'IMPORT';
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';

  constructor(form: FormGroup | number) {
    super();

    if (form instanceof FormGroup) {
      this.code = Utils.getFormControlValue(form,'code');
      this.name = Utils.getFormControlValue(form,'name');
      this.description = Utils.getFormControlValue(form,'description');
      this.fileName = Utils.getFormControlValue(form,'fileName');
      this.pathFile = Utils.getFormControlValue(form,'pathFile');
      this.type = Utils.getFormControlValue(form,'type');
      this.status = Utils.getFormControlValue(form,'status');
    } else {
      this.id = form;
    }
  }
}
