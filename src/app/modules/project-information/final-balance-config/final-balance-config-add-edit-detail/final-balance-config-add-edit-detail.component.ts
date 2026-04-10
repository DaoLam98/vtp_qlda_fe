import { Location } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlignEnum,
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent,
  ColumnModel,
  ColumnTypeEnum,
  DateUtilService,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { Config } from 'src/app/common/models/config.model';
import { SelectValuesService } from 'src/app/core/services/selectValues.service';
import { ActionTypeEnum } from 'src/app/shared';
import { PermissionCheckingUtil } from 'src/app/shared/utils/permission-checking.util';
import { Utils } from 'src/app/shared/utils/utils';
import { environment } from 'src/environments/environment';
import { FinalBalanceConfigModel, FinalBalanceValueModel } from '../../models/final-balance-config.model';
import { FORM_CONFIG } from '../final-balance-config-search/final-balance-config-search.config';

@Component({
  selector: 'app-final-balance-config-add-edit-detail',
  templateUrl: './final-balance-config-add-edit-detail.component.html',
  styleUrls: ['./final-balance-config-add-edit-detail.component.scss'],
  standalone: false,
})
export class FinalBalanceConfigAddEditDetailComponent extends BaseAddEditComponent {
  moduleName = 'project.final-balance-config';
  configForm: Config;
  model: FinalBalanceConfigModel | null = null;
  isView = false;
  statusValues: SelectModel[] = [];
  checkIsActive!: boolean;

  targetGroupValues: SelectModel[] = [];
  dataTypeValues: SelectModel[] = [];
  projectValues: SelectModel[] = [];
  periodValues: SelectModel[] = [];
  protected readonly environment = environment;
  protected readonly Utils = Utils;
  columns: ColumnModel[] = [];

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder,
    protected location: Location,
    protected translateService: TranslateService,
    protected apiService: ApiService,
    protected utilsService: UtilsService,
    protected authoritiesService: AuthoritiesService,
    protected router: Router,
    protected dateUtilService: DateUtilService,
    protected selectValuesService: SelectValuesService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);

    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.isView = this.activatedRoute.routeConfig?.data?.actionType === ActionTypeEnum._VIEW;

    this.addEditForm = this.fb.group({
      projectId: [],
      targetGroups: [],
      informationTypeId: [],
      cycleId: [],
      finalBalanceValues: [],
      status: [],
      createdDate: [],
      createdBy: [],
      lastModifiedDate: [],
      lastModifiedBy: [],
    });

    this.columns.push(
      {
        columnDef: 'stt',
        header: 'stt',
        className: 'mat-column-stt',
        title: (e: FinalBalanceValueModel) => {
          const values = this.addEditForm.get('finalBalanceValues')?.value as FinalBalanceValueModel[];
          const index = values.indexOf(e) + 1;
          return index.toString();
        },
        cell: (e: FinalBalanceValueModel) => {
          const values = this.addEditForm.get('finalBalanceValues')?.value as FinalBalanceValueModel[];
          const index = values.indexOf(e) + 1;
          return index.toString();
        },
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'targetName',
        header: 'target',
        className: 'mat-column-name',
        title: (e: FinalBalanceValueModel) => `${e.targetName + ' (' + e.targetCode + ')' || ''}`,
        cell: (e: FinalBalanceValueModel) => `${e.targetName + ' (' + e.targetCode + ')' || ''}`,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'finalBalanceValue',
        header: 'finalBalanceValue',
        className: 'mat-column-name',
        title: (e: FinalBalanceValueModel) => `${Utils.formatCurrency(e.finalBalanceValue || 0)}`,
        cell: (e: FinalBalanceValueModel) => `${Utils.formatCurrency(e.finalBalanceValue || 0)}`,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.RIGHT,
      },
      {
        columnDef: 'uomName',
        header: 'uomCode',
        className: 'mat-column-name',
        title: (e: FinalBalanceValueModel) => `${e.uomName || ''}`,
        cell: (e: FinalBalanceValueModel) => `${e.uomName || ''}`,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
    )
  }

  async ngOnInit() {

    super.ngOnInit();
    this.projectValues = await lastValueFrom(
      this.selectValuesService.getAutocompleteValuesFromModulePath(`${environment.PATH_API_V1}/project/project`,
        undefined,
        undefined,
        '',
        true,
        undefined,
        true
      ));
    this.dataTypeValues = await lastValueFrom(
      this.selectValuesService.getAutocompleteValuesFromModulePath(`${environment.PATH_API_V1}/mdm/information-type`,
        undefined,
        undefined,
        '',
        true,
        undefined,
        true));
    this.targetGroupValues = await lastValueFrom(
      this.selectValuesService.getAutocompleteValuesFromModulePath(`${environment.PATH_API_V1}/mdm/target-group`,
        undefined,
        undefined,
        '',
        true,
        undefined,
        true));
    this.periodValues = await lastValueFrom(
      this.selectValuesService.getAutocompleteValuesFromModulePath(`${environment.PATH_API_V1}/mdm/cycle-management`,
        undefined,
        undefined,
        '',
        true,
        undefined,
        true));
    this.periodValues = this.periodValues.map((item: any) =>{
      return {
        ...item,
        displayValue: `${item.rawData?.periodCode || ''}`,
      }
    })

    if (this.isEdit) {
      this.model = await firstValueFrom(
        this.apiService.get<FinalBalanceConfigModel>(
          `${environment.PATH_API_V1}/project/final-balance-config/` + this.id,
          new HttpParams(),
        ),
      );
      this.model.targetGroups = this.model.targetGroups.map((item: any) => item.targetGroupId)
      this.addEditForm.patchValue(this.model);
    }
  }


  onUpdateStatus(status: 'approve' | 'reject') {
    const apiCall = this.apiService.post(`${environment.PATH_API_V1}/project/final-balance-config/${this.id}/${status}`, '');

    this.utilsService.execute(
      apiCall,
      this.onSuccessFunc,
      `delete.final-balance-config.success`,
      `common.title.confirm`,
      [`${this.configForm?.moduleName}.`],
      `delete.final-balance-config`,
      undefined,
      undefined,
      'common.button.confirm',
      'common.button.back'
    );
  }
  get hasRejectPermission() {
    return this.permissionCheckingUtil.hasViewRejectPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }
}
