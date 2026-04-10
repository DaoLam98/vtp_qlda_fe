import {Location} from '@angular/common';
import {HttpParams} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {
  ActionTypeEnum,
  AlignEnum,
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent,
  BaseStatusEnum,
  ButtonClickEvent,
  ButtonModel,
  ColumnModel,
  ColumnTypeEnum,
  DateUtilService,
  IconTypeEnum,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import {TranslateService} from '@ngx-translate/core';
import {firstValueFrom, lastValueFrom} from 'rxjs';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {JobPositionModel} from 'src/app/modules/mdm/_models/job-position.model';
import {OrganizationModel} from 'src/app/modules/mdm/_models/organization.model';
import {RoleDetailModel} from 'src/app/modules/mdm/_models/role.model';
import {
  PopupChooseOrganizationComponent
} from 'src/app/shared/components/organization/organization-popup-choosen/organization-popup-choosen.component';
import {environment} from 'src/environments/environment';
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {Config} from "src/app/common/models/config.model";
import {FORM_CONFIG} from "src/app/modules/mdm/job-position/job-position-search/job-position-search.config";
import {VIETNAMESE_REGEX} from "src/app/shared/constants/regex.constants";

@Component({
  selector: 'app-job-position-add-edit-detail',
  templateUrl: './job-position-add-edit-detail.component.html',
  styleUrls: ['./job-position-add-edit-detail.component.scss'],
  standalone: false,
})
export class JobPositionAddEditDetailComponent extends BaseAddEditComponent implements OnInit {
  moduleName: string = 'mdm.job-position';
  configForm: Config;
  model!: JobPositionModel;
  isView: boolean = false;
  organizationColumns: ColumnModel[] = [];
  organizationButtons: ButtonModel[] = [];
  roleColumns: ColumnModel[] = [];
  roleButtons: ButtonModel[] = [];
  roleValues: SelectModel[] = [];
  jobPositionGroupValues: SelectModel[] = [];

  // Map to hold options for rejected roles
  map = new Map<number, SelectModel[]>();

  orgFormValues: SelectModel[] = [
    {
      displayValue: this.translateService.instant('common.organization.dependent'),
      value: 'DEPENDENT',
      rawData: 'DEPENDENT',
      disabled: false
    },
    {
      displayValue: this.translateService.instant('common.organization.independent'),
      value: 'INDEPENDENT',
      rawData: 'INDEPENDENT',
      disabled: false
    },
    {
      displayValue: this.translateService.instant('common.organization.unknown'),
      value: 'UNKNOWN',
      rawData: 'UNKNOWN',
      disabled: false
    }
  ];

  protected readonly environment = environment;

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }

  get hasEditPermission() {
    return this.permissionCheckingUtil.hasViewEditPermission(
      this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }

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
    protected matDialog: MatDialog,
    protected permissionCheckingUtil: PermissionCheckingUtil,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);

    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.isView = this.activatedRoute.routeConfig?.data?.actionType === ActionTypeEnum._VIEW;

    this.addEditForm = this.fb.group({
      code: ['', [Validators.maxLength(255)]],
      name: ['', [Validators.maxLength(255)]],
      description: ['', [Validators.pattern(VIETNAMESE_REGEX)]],
      jobPositionGroupId: [''],
      organizations: [[]],
      roles: [[]],
      status: [],
      statusDisplay: [],
      createdDate: [],
      createdBy: [],
      lastModifiedDate: [],
      lastModifiedBy: [],
    });

    this.organizationColumns.push(
      {
        columnDef: 'stt',
        header: 'stt',
        headerClassName: 'mat-column-stt width-5 min-width-40',
        className: 'mat-column-stt',
        title: (e: OrganizationModel) => {
          const values = this.addEditForm.get('organizations')?.value as OrganizationModel[];
          const index = values.indexOf(e) + 1;
          return index.toString();
        },
        cell: (e: OrganizationModel) => {
          const values = this.addEditForm.get('organizations')?.value as OrganizationModel[];
          const index = values.indexOf(e) + 1;
          return index.toString();
        },
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'name',
        header: 'name',
        className: 'mat-column-name',
        title: (e: OrganizationModel) => `${e.name}`,
        cell: (e: OrganizationModel) => `${e.name}`,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'orgForm',
        header: 'orgForm',
        className: 'mat-column-orgForm',
        title: (e: OrganizationModel) => `${this.orgFormValues.find(
          item => item.value === e.orgForm)?.displayValue || ''}`,
        cell: (e: OrganizationModel) => `${this.orgFormValues.find(
          item => item.value === e.orgForm)?.displayValue || ''}`,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
    );

    this.organizationButtons.push({
      columnDef: 'delete',
      color: 'primary',
      icon: 'fa fa-trash',
      iconType: IconTypeEnum.FONT_AWESOME,
      click: 'onDeleteOrganization',
      className: 'primary content-cell-align-center',
      title: 'common.title.delete',
      display: (e: RoleDetailModel) => !this.isView && (this.hasAddPermission || this.hasEditPermission),
      header: 'common.table.action.title',
      alignHeader: AlignEnum.CENTER,
    });

    this.roleColumns.push(
      {
        columnDef: 'stt',
        header: 'stt',
        headerClassName: 'mat-column-stt width-5 min-width-40',
        className: 'mat-column-stt',
        title: (e: RoleDetailModel) => {
          const values = this.addEditForm.get('roles')?.value as RoleDetailModel[];
          const index = values.indexOf(e) + 1;
          return index.toString();
        },
        cell: (e: RoleDetailModel) => {
          const values = this.addEditForm.get('roles')?.value as RoleDetailModel[];
          const index = values.indexOf(e) + 1;
          return index.toString();
        },
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'id',
        header: 'name',
        title: (e: RoleDetailModel) => `${e.name || ''}`,
        cell: (e: RoleDetailModel) => `${e.name || ''}` + `${e.status === 'REJECTED' ? ' (' + this.translateService.instant('common.inactive') + ')' : ''}`,
        className: 'mat-column-name',
        columnType: this.isView ? ColumnTypeEnum.VIEW : ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE,
        optionValues: (e: RoleDetailModel) => this.map.get(Number(e.id)) || this.roleValues,
        isRequired: true,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'code',
        header: 'code',
        className: 'mat-column-code',
        title: (e: RoleDetailModel) => {
          return this.roleValues.find((item) => item.value == e.id)?.rawData.code;
        },
        cell: (e: RoleDetailModel) => {
          return this.roleValues.find((item) => item.value == e.id)?.rawData.code ?? e.code ?? '';
        },
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'description',
        header: 'description',
        className: 'mat-column-description',
        title: (e: RoleDetailModel) => {
          return this.roleValues.find((item) => item.value == e.id)?.rawData.description;
        },
        cell: (e: RoleDetailModel) => {
          return this.roleValues.find((item) => item.value == e.id)?.rawData.description ?? e.description ?? '';
        },
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
    );

    this.roleButtons.push({
      columnDef: 'delete',
      color: 'primary',
      icon: 'fa fa-trash',
      iconType: IconTypeEnum.FONT_AWESOME,
      click: 'onDeleteRole',
      className: 'primary content-cell-align-center',
      title: 'common.title.delete',
      display: (e: RoleDetailModel) => !this.isView && (this.hasAddPermission || this.hasEditPermission),
      header: 'common.table.action.title',
      alignHeader: AlignEnum.CENTER,
    });

    this.addEditForm.valueChanges.subscribe(() => {
      const values = this.addEditForm.value.roles as RoleDetailModel[];
      this.roleValues = this.roleValues.map(i => ({
        ...i,
        disabled: !!values.find(j => j.id == i.value)
      }));
    });
  }

  async ngOnInit() {
    super.ngOnInit();
    this.model = await firstValueFrom(
        this.apiService.get<JobPositionModel>(
          `${environment.PATH_API_V1}/mdm/job-position/` + this.id, new HttpParams())
      );

      this.model.createdDate = this.dateUtilService.convertDateToDisplayServerTime(this.model.createdDate || '') || '';
      this.model.lastModifiedDate = this.dateUtilService.convertDateToDisplayServerTime(
        this.model.lastModifiedDate || '') || '';

      this.addEditForm.setValue({
        ...UtilsService.reduceEntityAttributeForFormControl(this.addEditForm, this.model),
        statusDisplay: this.model.status
          ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, this.model.status)
          : '',
      });

      const jobPositionGroupValuesRes = await lastValueFrom(
        this.selectValuesService.getAutocompleteValuesFromModulePath(
          `${environment.PATH_API_V1}/mdm/job-position-group`,
          [
            { key: 'sortDirection', value: 'asc' },
            { key: 'sortBy', value: 'name' },
          ],
          undefined,
          undefined,
          true,
          undefined,
          true
        )
      );

      this.roleValues = await lastValueFrom(
        this.selectValuesService.getAutocompleteValuesFromModulePath(
          `${environment.PATH_API_V1}/mdm/role`,
          [
            { key: 'sortDirection', value: 'asc' },
            { key: 'sortBy', value: 'name' },
          ],
          undefined,
          'id,code,name,description,status',
          true,
        )
      );

      this.jobPositionGroupValues = jobPositionGroupValuesRes.filter(item => !item.disabled || item.value === this.model.jobPositionGroupId);

      // Fill map with rejected roles
      const dataItems = structuredClone(this.addEditForm.get('roles')?.value || []);
      const rejectedItems = dataItems.filter((item: RoleDetailModel) => item.status === 'REJECTED');
      rejectedItems.forEach((item: any) => {
        this.map.set(item.id, [new SelectModel(item.id,
        `${item.name ?? ''} (${this.translateService.instant('common.inactive')})`,
        true),
        ...this.roleValues]);
      });
    }

  onSubmit() {
    const formData = new FormData();
    const model = new JobPositionModel(this.addEditForm);

    formData.append('body', this.utilsService.toBlobJon(model));

    const apiCall = this.isEdit
      ? this.apiService.put(`${environment.PATH_API_V1}/mdm/job-position/${this.id}`, formData)
      : this.apiService.post(`${environment.PATH_API_V1}/mdm/job-position`, formData);

    const action = this.isEdit ? 'edit' : 'add';
    this.utilsService.execute(
      apiCall,
      this.onSuccessFunc,
      `common.${action}.success`,
      'common.title.confirm',
      [`${this.configForm?.moduleName}.`],
      `common.confirm.${action}`,
      undefined,
      undefined,
      "common.button.confirm", // Nút Xác nhận
      "common.button.back" // Nút Quay lại
    );
  }

  onRedirect(item: any) {
    this.router.navigate([`/mdm/job-position/edit`, item]).then();
  }

  addRoleValue() {
    const values = this.addEditForm.get('roles')?.value as RoleDetailModel[];
    this.addEditForm.get('roles')?.patchValue([
      ...values,
      {
        id: null,
        code: '',
        description: '',
      },
    ]);
  }

  onRolesTableAction(event: ButtonClickEvent) {
    if(event.action == 'onDeleteRole') this.onDeleteRole(event.index as number);
  }

  onDeleteRole(index: number) {
    const roles = this.addEditForm.get('roles')?.value;
    roles.splice(index, 1);
    this.addEditForm.get('roles')?.setValue(roles);
  }

  onOrganizationsTableAction(event: ButtonClickEvent) {
    if(event.action == 'onDeleteOrganization') this.onDeleteOrganization(event.index);
  }

  onDeleteOrganization(index: number | null | undefined) {
    const organizations = this.addEditForm.get('organizations')?.value;
    organizations.splice(index, 1);
    this.addEditForm.get('organizations')?.setValue(organizations);
  }

  onOpenOrgDialog() {
    this.matDialog
      .open(PopupChooseOrganizationComponent, {
        disableClose: false,
        width: '1500px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        data: {
          selected: this.addEditForm.get('organizations')?.value,
        },
      })
      .afterClosed()
      .subscribe((organizations: OrganizationModel[]) => {
        if(organizations) {
          this.addEditForm.get('organizations')?.patchValue(organizations);
        }
      });
  }
}
