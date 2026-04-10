import {BaseModel} from "@c10t/nice-component-library";
import {FormGroup} from "@angular/forms";
import {Utils} from "src/app/shared/utils/utils";

export class AttributeDetailModel extends BaseModel {
  id: number | null = null;
  index: number | null = null;
  keyword: string | null = null;

  name: string | null = null;
  datatype: 'STRING' | 'NUMBER' | 'DATE' | 'BOOLEAN' | "REFERENCE" = "STRING";
  description: string | null = null;
  require: boolean = false;
  referenceTable: string | null = null;
  length: number | null = null;
  allowNegative: boolean = false;
  status: 'APPROVED' | 'REJECTED' = 'APPROVED';

  constructor(form: FormGroup | number) {
    super();

    if (form instanceof FormGroup) {
      this.name = Utils.getFormControlValue(form,'name');
      this.datatype = Utils.getFormControlValue(form,'datatype');
      this.description = Utils.getFormControlValue(form,'description');
      this.require = Utils.getFormControlValue(form,'require', false);
      this.referenceTable = Utils.getFormControlValue(form,'referenceTable');
      this.length = Utils.getFormControlValue(form,'length');
      this.allowNegative = Utils.getFormControlValue(form,'allowNegative', false);
      this.status = Utils.getFormControlValue(form,'status');
    } else {
      this.id = form;
    }
  }
}
