import {BaseModel} from '@c10t/nice-component-library';
import {FormGroup} from '@angular/forms';
import {Utils} from 'src/app/shared/utils/utils';

export class FinalBalanceConfigModel extends BaseModel {
  projectName: string | null = null;
  projectId: number | null = null;
  cyclePeriodCode: string | null = null;
  cycleId: number | null = null;
  informationTypeCode: string | null = null;
  informationTypeName: string | null = null;
  informationTypeId: number | null = null;
  targetGroups: any[] = [];
  finalBalanceValues: any[] = [];

  constructor(form: FormGroup | number) {
    super();
    if (form instanceof FormGroup) {
      this.projectId = Utils.getFormControlValue(form, 'projectId');
      this.cyclePeriodCode = Utils.getFormControlValue(form, 'cyclePeriodCode');
      this.cycleId = Utils.getFormControlValue(form, 'cycleId');
      this.informationTypeCode = Utils.getFormControlValue(form, 'informationTypeCode');
      this.informationTypeId = Utils.getFormControlValue(form, 'informationTypeId');
      this.targetGroups = Utils.getFormControlValue(form, 'targetGroups', []);
      this.finalBalanceValues = Utils.getFormControlValue(form, 'finalBalanceValues', []);
    } else {
      this.id = form;
    }
  }
}

export class FinalBalanceValueModel extends BaseModel {
  targetName: string | null = null;
  targetCode: string | null = null;
  finalBalanceValue: number | null = null;
  uomName: string | null = null;
  uomCode: string | null = null;

  constructor(form: FormGroup | number) {
    super();
  }
}
