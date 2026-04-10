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
  ButtonClickEvent,
  ButtonModel,
  ColumnModel,
  ColumnTypeEnum,
  DateUtilService,
  IconTypeEnum,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { Config } from 'src/app/common/models/config.model';
import { SelectValuesService } from 'src/app/core/services/selectValues.service';
import { FORM_CONFIG } from 'src/app/modules/mdm/cycle-management/cycle-management-search/cycle-management-search.config';
import { ActionTypeEnum } from 'src/app/shared';
import { EnumUtil } from 'src/app/shared/utils/enum.util';
import { PermissionCheckingUtil } from 'src/app/shared/utils/permission-checking.util';
import { Utils } from 'src/app/shared/utils/utils';
import { environment } from 'src/environments/environment';
import {
  CycleManagementModel,
  CycleManagementProjectModel,
  CycleManagementStatusEnum,
} from '../../_models/cycle-management.model';

@Component({
  selector: 'app-cycle-management-add-edit-detail',
  templateUrl: './cycle-management-add-edit-detail.component.html',
  styleUrls: ['./cycle-management-add-edit-detail.component.scss'],
  standalone: false,
})
export class CycleManagementAddEditDetailComponent extends BaseAddEditComponent {
  moduleName = 'mdm.cycle-management';
  configForm: Config;
  model: CycleManagementModel | null = null;
  isView = false;
  statusValues: SelectModel[] = [];
  projectTypeValues: SelectModel[] = [];
  informationTypeValues: SelectModel[] = [];
  checkIsActive!: boolean;
  cycleManagementProjectColumns: ColumnModel[] = [];
  cycleManagementProjectButtons: ButtonModel[] = [];
  protected readonly environment = environment;

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
      year: [],
      periodCode: [],
      cycleStatus: [],
      startDate: [],
      endDate: [],
      cycleManagementProjects: [[]],
      status: [],
      createdDate: [],
      createdBy: [],
      lastModifiedDate: [],
      lastModifiedBy: [],
    });

    this.cycleManagementProjectColumns.push(
      {
        columnDef: 'stt',
        header: 'stt',
        title: (e: CycleManagementProjectModel) => {
          const values = this.addEditForm.get('cycleManagementProjects')?.value as CycleManagementProjectModel[];
          const index = values.indexOf(e) + 1;
          return index.toString();
        },
        cell: (e: CycleManagementProjectModel) => {
          const values = this.addEditForm.get('cycleManagementProjects')?.value as CycleManagementProjectModel[];
          const index = values.indexOf(e) + 1;
          return index.toString();
        },
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'projectTypeId',
        header: 'projectType',
        title: (e: CycleManagementProjectModel) =>
          `${this.projectTypeValues.find((i) => i.value == e.projectTypeId)?.displayValue || ''}`,
        cell: (e: CycleManagementProjectModel) =>
          `${this.projectTypeValues.find((i) => i.value == e.projectTypeId)?.displayValue || ''}`,
        optionValues: (e: CycleManagementProjectModel) => e.projectTypeValues,
        disabled: (e: CycleManagementProjectModel) => this.isView,
        columnType: this.isView ? ColumnTypeEnum.VIEW : ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE,
        isRequired: !this.isView,
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'informationTypeIds',
        header: 'informationType',
        title: (e: CycleManagementProjectModel) =>
          e.informationTypes
            .map((i) => this.informationTypeValues.find((j) => j.value == i.id)?.displayValue)
            .join(', '),
        cell: (e: CycleManagementProjectModel) =>
          e.informationTypes
            .map((i) => this.informationTypeValues.find((j) => j.value == i.id)?.displayValue)
            .join(', '),
        disabled: (e: CycleManagementProjectModel) => this.isView,
        optionValues: (e: CycleManagementProjectModel) => e.informationTypeValues,
        onCellValueChange: (e: CycleManagementProjectModel) => {
          e.informationTypes = e.informationTypeIds.map(
            (i) => this.informationTypeValues.find((it) => it.value === i)?.rawData,
          );
        },
        columnType: this.isView ? ColumnTypeEnum.VIEW : ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE,
        isRequired: !this.isView,
        alignHeader: AlignEnum.CENTER,
        isMultipleSelect: true,
      },
      {
        columnDef: 'projectStatus',
        header: 'projectStatus',
        title: (e: CycleManagementProjectModel) =>
          `${
            e.projectStatus ? this.utilsService.getEnumValueTranslated(CycleManagementStatusEnum, e.projectStatus) : ''
          }`,
        cell: (e: CycleManagementProjectModel) =>
          `${
            e.projectStatus ? this.utilsService.getEnumValueTranslated(CycleManagementStatusEnum, e.projectStatus) : ''
          }`,
        optionValues: (e: CycleManagementProjectModel) => this.statusValues,
        columnType: this.isView ? ColumnTypeEnum.VIEW : ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE,
        isRequired: !this.isView,
        align: AlignEnum.CENTER,
      },
    );

    this.cycleManagementProjectButtons.push({
      columnDef: 'detail',
      color: 'primary',
      icon: 'fa fa-trash',
      iconType: IconTypeEnum.FONT_AWESOME,
      click: 'onDeleteValue',
      className: 'primary content-cell-align-center',
      title: 'common.title.delete',
      display: (e: CycleManagementProjectModel) => !this.isView,
      header: 'common.table.action.title',
      alignHeader: AlignEnum.CENTER,
    });

    EnumUtil.enum2SelectModel(CycleManagementStatusEnum, this.statusValues, 'EDIT');
  }

  async ngOnInit() {
    super.ngOnInit();

    [this.projectTypeValues, this.informationTypeValues] = await Promise.all([
      lastValueFrom(
        this.selectValuesService.getAutocompleteValuesFromModulePath(
          `${environment.PATH_API_V1}/mdm/project-type`,
          [
            { key: 'sortBy', value: 'name' },
            { key: 'sortDirection', value: 'asc' },
          ],
          undefined,
          undefined,
          true,
          undefined,
          true,
        ),
      ),
      lastValueFrom(
        this.selectValuesService.getAutocompleteValuesFromModulePath(
          `${environment.PATH_API_V1}/mdm/information-type`,
          [
            { key: 'sortBy', value: 'name' },
            { key: 'sortDirection', value: 'asc' },
          ],
          undefined,
          undefined,
          true,
          undefined,
          true,
        ),
      ),
    ]);

    if (this.isEdit) {
      this.model = await firstValueFrom(
        this.apiService.get<CycleManagementModel>(
          `${environment.PATH_API_V1}/mdm/cycle-management/` + this.id,
          new HttpParams(),
        ),
      );

      this.checkIsActive = this.model?.cycleStatus === 'OPEN';
      this.model.cycleManagementProjects = this.model.cycleManagementProjects.map((item) => ({
        ...item,
        informationTypeIds: item.informationTypes.map((i) => i.id!) || [],
        informationTypeValues: this.informationTypeValues.filter(
          (i) => this.itemIsApproved(i) || item.informationTypes.find((it) => it.id === i.value),
        ),
        projectTypeValues: this.projectTypeValues.filter(
          (i) => this.itemIsApproved(i) || i.value === item.projectTypeId,
        ),
      }));
      this.addEditForm.patchValue(this.model);
    }
  }

  onUpdateStatus(status: 'open' | 'close') {
    const formData = new FormData();
    formData.append('body', this.utilsService.toBlobJon({ ...this.model, cycleStatus: status.toUpperCase() }));
    const apiCall = this.apiService.put(`${environment.PATH_API_V1}/mdm/cycle-management/${this.id}`, formData);
    this.utilsService.execute(
      apiCall,
      this.onSuccessFunc,
      `mdm.cycle-management.${status}.success`,
      'common.title.confirm',
      undefined,
      `mdm.cycle-management.confirm.${status}`,
      undefined,
      undefined,
      'common.button.confirm',
      'common.button.back',
    );
  }

  onRedirect(item: any) {
    this.router.navigate([`/mdm/cycle-management/edit`, item]).then();
  }

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '');
  }

  get hasEditPermission() {
    return this.permissionCheckingUtil.hasViewEditPermission(
      this.configForm?.moduleName ?? '',
      this.configForm?.name ?? '',
    );
  }

  get hasApprovePermission() {
    return this.permissionCheckingUtil.hasViewApprovePermission(
      this.configForm?.moduleName ?? '',
      this.configForm?.name ?? '',
    );
  }

  get hasRejectPermission() {
    return this.permissionCheckingUtil.hasViewRejectPermission(
      this.configForm?.moduleName ?? '',
      this.configForm?.name ?? '',
    );
  }

  onSubmit() {
    const formData = new FormData();
    const payload = new CycleManagementModel(this.addEditForm);
    formData.append('body', this.utilsService.toBlobJon(payload));
    const apiCall = this.apiService.put(`${environment.PATH_API_V1}/mdm/cycle-management/${this.id}`, formData);

    const action = this.isEdit ? 'edit' : 'add';
    this.utilsService.execute(
      apiCall,
      this.onSuccessFunc,
      `common.${action}.success`,
      'common.title.confirm',
      undefined,
      `common.confirm.${action}`,
      undefined,
      undefined,
      'common.button.confirm',
      'common.button.back',
    );
  }

  onTableAction(event: ButtonClickEvent) {
    if (event.action === 'onDeleteValue') this.onDeleteValue(event.index!);
  }

  onDeleteValue(index: number) {
    const cycleManagementProjects = this.addEditForm.get('cycleManagementProjects')
      ?.value as CycleManagementProjectModel[];
    cycleManagementProjects.splice(index, 1);
    this.addEditForm.get('cycleManagementProjects')?.setValue(cycleManagementProjects);
  }

  onAddValue() {
    const values = this.addEditForm.get('cycleManagementProjects')?.value as CycleManagementProjectModel[];
    this.addEditForm.get('cycleManagementProjects')?.patchValue([
      ...values,
      {
        projectTypeId: null,
        projectStatus: null,
        informationTypeIds: [],
        informationTypes: [],
        informationTypeValues: this.informationTypeValues.filter((i) => this.itemIsApproved(i)),
        projectTypeValues: this.projectTypeValues.filter((i) => this.itemIsApproved(i)),
      },
    ]);
  }

  protected readonly Utils = Utils;

  itemIsApproved(item: SelectModel): boolean {
    return item.rawData.status === 'APPROVED';
  }
}
