import { Location } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent, SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import { TranslateService } from '@ngx-translate/core';
import { Config } from 'src/app/common/models/config.model';
import { SelectValuesService } from 'src/app/core/services/selectValues.service';
import { PermissionCheckingUtil } from 'src/app/shared/utils/permission-checking.util';
import { Utils } from 'src/app/shared/utils/utils';
import { environment } from 'src/environments/environment';
import { lastValueFrom } from 'rxjs';
import { FORM_CONFIG } from '../final-balance-config-search/final-balance-config-search.config';

@Component({
  selector: 'app-popup-add-final-balance-config',
  templateUrl: './popup-add-final-balance-config.component.html',
  standalone: false,
})
export class PopupAddFinalBalanceConfigComponent extends BaseAddEditComponent {
  configForm!: Config;
  targetGroupValues: SelectModel[] = [];
  dataTypeValues: SelectModel[] = [];
  projectValues: SelectModel[] = [];
  periodValues: SelectModel[] = [];
  protected readonly environment = environment;
  protected readonly Utils = Utils;

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected location: Location,
    protected translateService: TranslateService,
    protected utilsService: UtilsService,
    protected authoritiesService: AuthoritiesService,
    protected fb: FormBuilder,
    protected router: Router,
    protected apiService: ApiService,
    protected selectValuesService: SelectValuesService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
    @Optional() protected matDialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) protected data: any,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);
    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));
    this.addEditForm = this.fb.group({
      targetGroups: ['', [Validators.required]],
      projects: ['', [Validators.required]],
      cycleId: ['', [Validators.required]],
      informationTypeId: ['', [Validators.required]],
    });
  }
  async ngOnInit() {
    this.projectValues = await lastValueFrom(
      this.selectValuesService.getAutocompleteValuesFromModulePath(`${environment.PATH_API_V1}/project/project`,
        undefined,
        undefined,
        '',
        true,
        undefined,
        false
      ));
    this.dataTypeValues = await lastValueFrom(
      this.selectValuesService.getAutocompleteValuesFromModulePath(`${environment.PATH_API_V1}/mdm/information-type`,
        undefined,
        undefined,
        undefined,
        true,
        undefined,
        false));
    this.targetGroupValues = await lastValueFrom(
      this.selectValuesService.getAutocompleteValuesFromModulePath(`${environment.PATH_API_V1}/mdm/target-group`,
        undefined,
        undefined,
        undefined,
        true,
        undefined,
        false));
    this.periodValues = await lastValueFrom(
      this.selectValuesService.getAutocompleteValuesFromModulePath(`${environment.PATH_API_V1}/mdm/cycle-management`,
        undefined,
        undefined,
        '',
        true,
        undefined,
        false));
    this.periodValues = this.periodValues.map((item: any) =>{
      return {
        ...item,
        displayValue: `${item.rawData?.periodCode || ''}`,
      }
    })
  }

  onSubmit() {
    const targetGroups = this.targetGroupValues.filter(x => this.addEditForm.controls.targetGroups.value.includes(x.value))
    const payload = this.addEditForm.controls.projects?.value.map((data: any) => {
      return {
        projectId: data,
        projectName: this.projectValues.find(x => x.value === data)?.displayValue,
        cycleId: this.addEditForm.controls.cycleId.value,
        cycleStartDate: this.periodValues.find((item: any) => item.value
          === this.addEditForm.controls.cycleId.value)?.rawData?.startDate,
        cycleEndDate: this.periodValues.find((item: any) => item.value
          === this.addEditForm.controls.cycleId.value)?.rawData?.endDate,
        cyclePeriodCode: this.periodValues.find((item: any) => item.value
          === this.addEditForm.controls.cycleId.value)?.rawData?.periodCode,
        informationTypeId: this.addEditForm.controls.informationTypeId.value,
        informationTypeCode: this.dataTypeValues.find((item: any) => item.value
          === this.addEditForm.controls.informationTypeId.value)?.rawData?.code,
        informationTypeName: this.dataTypeValues.find((item: any) => item.value
          === this.addEditForm.controls.informationTypeId.value)?.rawData?.name,
        targetGroups: targetGroups.map((item: any) =>{
          return {
            targetGroupId: item.rawData?.id || '',
            targetGroupCode: item.rawData?.code || '',
            targetGroupName: item.rawData?.name || '',
          }
        })
      }
    })

    const formData = new FormData();
    formData.append('body', this.utilsService.toBlobJon(payload));

    const apiCall = this.apiService.post(`${environment.PATH_API_V1}/project/final-balance-config`, formData);

    this.utilsService.execute(
      apiCall,
      (data, message) => {
        this.utilsService.onSuccessFunc(message);
        this.matDialogRef.close(data);
      },
      `common.add.success`,
      'common.title.confirm',
      undefined,
      `common.confirm.add`,
      undefined,
      undefined,
      'common.button.confirm',
      'common.button.back',
    );
  }
}
