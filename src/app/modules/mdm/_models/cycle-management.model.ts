import { FormGroup } from '@angular/forms';
import { BaseModel, SelectModel } from '@c10t/nice-component-library';
import { Utils } from 'src/app/shared/utils/utils';
import { DataTypeModel } from './data-type.model';

export class CycleManagementModel extends BaseModel {
  startDate: string | null = null;
  endDate: string | null = null;
  year: number | null = null;
  periodCode: string | null = null;
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';
  cycleStatus: 'OPEN' | 'CLOSE' | null = null;
  cycleManagementProjects: CycleManagementProjectModel[] = [];

  constructor(form: FormGroup | number) {
    super();
    if (form instanceof FormGroup) {
      this.startDate = Utils.getFormControlValue(form, 'startDate');
      this.endDate = Utils.getFormControlValue(form, 'endDate');
      this.year = Utils.getFormControlValue(form, 'year');
      this.periodCode = Utils.getFormControlValue(form, 'periodCode');
      this.status = Utils.getFormControlValue(form, 'status');
      this.cycleStatus = Utils.getFormControlValue(form, 'cycleStatus');
      this.cycleManagementProjects = Utils.getFormControlValue(form, 'cycleManagementProjects', []);
    } else {
      this.id = form;
    }
  }
}

export class CycleManagementProjectModel extends BaseModel {
  cycleManagementStartDate: string | null = null;
  cycleManagementEndDate: string | null = null;
  cycleManagementId: number | null = null;
  cycleManagementYear: number | null = null;
  cycleManagementPeriodCode: string | null = null;
  cycleManagementCycleStatus: 'OPEN' | 'CLOSED' = 'OPEN';
  projectTypeId: number | null = null;
  projectTypeCode: string | null = null;
  projectTypeName: string | null = null;
  projectTypeDescription: string | null = null;
  projectTypeValues: SelectModel[] = [];
  projectStatus: 'OPEN' | 'CLOSED' = 'OPEN';
  informationTypes: DataTypeModel[] = [];
  informationTypeIds: number[] = [];
  informationTypeValues: SelectModel[] = [];
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';
  constructor(form: FormGroup | number) {
    super();
    if (form instanceof FormGroup) {
      this.cycleManagementStartDate = Utils.getFormControlValue(form, 'cycleManagementStartDate');
      this.cycleManagementEndDate = Utils.getFormControlValue(form, 'cycleManagementEndDate');
      this.cycleManagementId = Utils.getFormControlValue(form, 'cycleManagementId');
      this.cycleManagementYear = Utils.getFormControlValue(form, 'cycleManagementYear');
      this.cycleManagementPeriodCode = Utils.getFormControlValue(form, 'cycleManagementPeriodCode');
      this.cycleManagementCycleStatus = Utils.getFormControlValue(form, 'cycleManagementCycleStatus');
      this.projectTypeId = Utils.getFormControlValue(form, 'projectTypeId');
      this.projectTypeCode = Utils.getFormControlValue(form, 'projectTypeCode');
      this.projectTypeName = Utils.getFormControlValue(form, 'projectTypeName');
      this.projectTypeDescription = Utils.getFormControlValue(form, 'projectTypeDescription');
      this.projectStatus = Utils.getFormControlValue(form, 'projectStatus');
      this.informationTypes = Utils.getFormControlValue(form, 'informationTypes', []);
      this.status = Utils.getFormControlValue(form, 'status');
    } else {
      this.id = form;
    }
  }
}

export enum CycleManagementStatusEnum {
  _OPEN = 'mdm.cycle-management.status.open',
  _CLOSE = 'mdm.cycle-management.status.close',
}
