import { HttpParams } from '@angular/common/http';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlignEnum,
  ApiService,
  AuthoritiesService,
  ButtonModel,
  ColumnModel,
  DateUtilService,
  IconTypeEnum,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import { TranslateService } from '@ngx-translate/core';
import { lastValueFrom } from 'rxjs';
import { Config } from 'src/app/common/models/config.model';
import { SelectValuesService } from 'src/app/core/services/selectValues.service';

import type { CloudSearchComponent } from 'src/app/shared/components/base-search/cloud-search.component';
import { PermissionCheckingUtil } from 'src/app/shared/utils/permission-checking.util';
import { Utils } from 'src/app/shared/utils/utils';
import { environment } from 'src/environments/environment';
import { FORM_CONFIG } from './final-balance-config-search.config';
import { FinalBalanceConfigModel } from '../../models/final-balance-config.model';
import { PopupAddFinalBalanceConfigComponent } from '../popup-add-final-balance-config/popup-add-final-balance-config.component';

@Component({
  selector: 'app-final-balance-config-search',
  templateUrl: './final-balance-config-search.component.html',
  styleUrl: 'final-balance-config-search.component.scss',
  standalone: false,
})
export class FinalBalanceConfigSearchComponent implements OnInit {
  @ViewChild('cloudSearchRef', { static: true }) cloudSearchComponent!: CloudSearchComponent;
  columns: ColumnModel[] = [];
  buttons: ButtonModel[] = [];
  configForm!: Config;
  formAdvanceSearch?: FormGroup;
  targetGroupValues: SelectModel[] = [];
  dataTypeValues: SelectModel[] = [];
  projectValues: SelectModel[] = [];
  periodValues: SelectModel[] = [];
  protected readonly environment = environment;
  protected readonly Utils = Utils;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected apiService: ApiService,
    protected utilsService: UtilsService,
    protected matDialog: MatDialog,
    protected translateService: TranslateService,
    protected injector: Injector,
    protected activatedRoute: ActivatedRoute,
    protected authoritiesService: AuthoritiesService,
    protected selectValuesService: SelectValuesService,
    protected dateUtilService: DateUtilService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
  ) {
    this.configForm = FORM_CONFIG;

    this.formAdvanceSearch = formBuilder.group(
      this.configForm.filterForm!.reduce((result: any, item) => {
        result[item.name] = ['', item.validate ?? []];
        return result;
      }, {}),
    );

    this.columns.push(
      {
        columnDef: 'projectId',
        header: 'project',
        className: 'mat-column-code',
        title: (e: FinalBalanceConfigModel) => `${e.projectName || ''}`,
        cell: (e: FinalBalanceConfigModel) => `${e.projectName || ''}`,
        align: AlignEnum.LEFT,
        alignHeader: AlignEnum.CENTER
      },
      {
        columnDef: 'informationTypeId',
        header: 'dataType',
        title: (e: FinalBalanceConfigModel) => `${e.informationTypeName || ''}`,
        cell: (e: FinalBalanceConfigModel) => `${e.informationTypeName || ''}`,
        className: 'mat-column-name',
        align: AlignEnum.LEFT,
        alignHeader: AlignEnum.CENTER
      },
      {
        columnDef: 'targetGroups.targetGroupId',
        header: 'targetGroup',
        className: 'mat-column-jobPosition',
        title: (e: FinalBalanceConfigModel) => `${e.cyclePeriodCode || ''}`,
        cell: (e: FinalBalanceConfigModel) => {
          const names = e.targetGroups?.map(item => item.targetGroupName).join(', ');
          return names || ''
        },
        align: AlignEnum.LEFT,
        alignHeader: AlignEnum.CENTER
      },
      {
        columnDef: 'cycleId',
        header: 'period',
        className: 'mat-column-jobPosition',
        title: (e: FinalBalanceConfigModel) => `${e.cyclePeriodCode || ''}`,
        cell: (e: FinalBalanceConfigModel) => `${e.cyclePeriodCode || ''}`,
        align: AlignEnum.LEFT,
        alignHeader: AlignEnum.CENTER
      },
    );

    this.buttons.push(
      {
        columnDef: 'detail',
        header: 'common.table.action.title',
        color: 'warn',
        icon: 'fa fa-eye',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'viewDetail',
        className: 'primary',
        title: 'common.title.detail',
        display: (e: FinalBalanceConfigModel) => true,
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'delete',
        color: 'primary',
        icon: 'fa fa-trash',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'deleteFinalBalanceConfig',
        className: 'primary content-cell-align-center',
        title: 'common.title.delete',
        display: () => this.hasDeletePermission,
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      }
    );
  }

  get hasDeletePermission() {
    return this.permissionCheckingUtil.hasViewRejectPermission(
      this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }

  async ngOnInit() {
    this.projectValues = await lastValueFrom(
      this.selectValuesService.getAutocompleteValuesFromModulePath(`${environment.PATH_API_V1}/project/project`,
        undefined,
        undefined,
        '',
        false,
        undefined,
        true
      ));
    this.dataTypeValues = await lastValueFrom(
      this.selectValuesService.getAutocompleteValuesFromModulePath(`${environment.PATH_API_V1}/mdm/information-type`));
    this.targetGroupValues = await lastValueFrom(
      this.selectValuesService.getAutocompleteValuesFromModulePath(`${environment.PATH_API_V1}/mdm/target-group`));
    this.periodValues = await lastValueFrom(
      this.selectValuesService.getAutocompleteValuesFromModulePath(`${environment.PATH_API_V1}/mdm/cycle-management`,
        undefined,
        undefined,
        '',
        false,
        undefined,
        true));
    this.periodValues = this.periodValues.map((item: any) =>{
      return {
        ...item,
        displayValue: `${item.rawData?.periodCode || item.displayValue || ''}`,
      }
    })
  }

  addBtnFunction = () => {
    this.matDialog
      .open(PopupAddFinalBalanceConfigComponent, {
        disableClose: false,
        width: '1000px',
        maxWidth: '90vw',
        maxHeight: '90vh',
      })
      .afterClosed()
      .subscribe(async (res) => {
        if (res) {
          this.cloudSearchComponent.onSubmit();
        }
      });
  };

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }

  convertField2HttpParamFn(param: HttpParams, formGroup: FormGroup) {
    return this.formAdvanceSearch?.controls['targetGroups.targetGroupId'].value ? param.set(
      'targetGroups.targetGroupId', this.formAdvanceSearch?.controls['targetGroups.targetGroupId'].value) : param
  }
}
