import {Component, OnInit} from '@angular/core';
import {
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
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, Validators} from '@angular/forms';
import {Location} from '@angular/common';
import {TranslateService} from '@ngx-translate/core';
import {ActionTypeEnum} from 'src/app/shared';
import {HttpParams} from '@angular/common/http';
import {
  EmployeeModel,
  UserDelegation,
  UserPosition,
  UserRole,
} from 'src/app/shared/components/internal-user/internal-user.model';
import {firstValueFrom, lastValueFrom, Observable, of} from 'rxjs';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {MatDialog} from '@angular/material/dialog';
import {
  PopupChooseUserComponent,
} from 'src/app/shared/components/internal-user/popup-choose-user/popup-choose-user.component';
import {environment} from 'src/environments/environment';
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {Config} from "src/app/common/models/config.model";
import {FORM_CONFIG} from "src/app/modules/mdm/user/internal/internal-user.config";
import {VIETNAMESE_REGEX} from "src/app/shared/constants/regex.constants";
import { Utils } from 'src/app/shared/utils/utils';

@Component({
  selector: 'app-internal-user-add-edit-detail',
  standalone: false,
  templateUrl: './internal-user-add-edit-detail.component.html',
  styleUrls: ['./internal-user-add-edit-detail.component.scss'],
})
export class InternalUserAddEditDetailComponent extends BaseAddEditComponent implements OnInit {
  moduleName: string = 'mdm.internal-user';
  configForm: Config;

  model: EmployeeModel | null = null;
  isView: boolean = false;
  checkIsActive!: boolean;
  roleColumns: ColumnModel[] = [];
  roleButtons: ButtonModel[] = [];
  internalUserPositionsButtons: ButtonModel[] = [];
  internalUserPositionsColumns: ColumnModel[] = [];
  internalUserDelegationsButtons: ButtonModel[] = [];
  internalUserDelegationsColumns: ColumnModel[] = [];
  roleValues: SelectModel[] = [];
  organizationValues: SelectModel[] = [];
  moduleValue: SelectModel[] = [];
  positionValue: SelectModel[] = [];
  statusValues$: Observable<SelectModel[]> = of([]);

  // Map to hold filtered options
  rolesMap = new Map<number, SelectModel[]>();
  modulesMap = new Map<number, SelectModel[]>();
  jobPositionsMap = new Map<number, SelectModel[]>();

  limitAmountRegex = /^(0|[1-9]\d{0,21})$/;

  protected readonly environment = environment;

  get voAuthentication() {
    return !!this.authoritiesService.me ? this.authoritiesService.me?.userAuthentication?.principal?.voAuthentication : '';
  }

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }

  get hasEditPermission() {
    return this.permissionCheckingUtil.hasViewEditPermission(
      this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }

  get defaultFromDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 1); // Add 1 day to current date
    return date;
  }

  get internalUserDelegationsButtonsVisible() {
    return !this.isView && this.hasEditPermission;
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
    protected selectValuesService: SelectValuesService,
    protected matDialog: MatDialog,
    protected dateUtilService: DateUtilService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);

    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.initializeForm();
    this.initializeRoleColumns();
    this.initializeInternalUserDelegationsColumns();
    this.initializeInternalUserPositionsColumns();
  }

  async ngOnInit() {
    super.ngOnInit();
    this.roleValues = await lastValueFrom(
      this.selectValuesService.getAutocompleteValuesFromModulePath(
        `${environment.PATH_API_V1}/mdm/role`,
        undefined,
        undefined,
        undefined,
        true,
      ),
    );

    this.organizationValues = await lastValueFrom(
      this.selectValuesService.getAutocompleteValuesFromModulePath(
        `${environment.PATH_API_V1}/mdm/organization`,
        undefined,
        undefined,
        undefined,
        true,
      ),
    );

    this.positionValue = await lastValueFrom(
      this.selectValuesService.getAutocompleteValuesFromModulePath(
        `${environment.PATH_API_V1}/mdm/job-position`,
        undefined,
        undefined,
        undefined,
        true,
      ),
    );

    this.moduleValue = await lastValueFrom(
      this.selectValuesService.getAutocompleteValuesFromModulePath(
        `${environment.PATH_API_V1}/mdm/module`,
        undefined,
        undefined,
        undefined,
        true,
      ),
    );

    if(this.isEdit) {
      this.model = await firstValueFrom(
        this.apiService.get<EmployeeModel>(`${environment.PATH_API_V1}/mdm/internal-user/` + this.id, new HttpParams())
      );
      const clonedMModel = structuredClone(this.model);

      this.addEditForm.setValue(
        UtilsService.reduceEntityAttributeForFormControl(this.addEditForm, clonedMModel)
      );

      // Fill map with rejected role items
      const userRolesItems = structuredClone(this.model?.userRoles || []);
      const rejectedUserRoles = userRolesItems.filter((item: any) => !this.roleValues.some(x => x.value === item.roleId));
      rejectedUserRoles.forEach((item) => {
         this.rolesMap.set(Number(item.id), [new SelectModel(item.roleId,
          `${item.roleName ?? ''} (${this.translateService.instant('common.inactive')})`,
          true),
          ...this.roleValues]);
      })

      // Fill map with rejected module items
      const moduleItems = structuredClone(this.model?.internalUserDelegations || []);
      const rejectedModuleRoles = moduleItems.filter((item: any) => !this.moduleValue.some(x => x.value === item.moduleId));
      rejectedModuleRoles.forEach((item) => {
         this.modulesMap.set(Number(item.id), [new SelectModel(item.moduleId,
          `${item.moduleName ?? ''} (${this.translateService.instant('common.inactive')})`,
          true),
          ...this.moduleValue]);
      })

      // Fill map with rejected job position items
      const jobPositionItems = structuredClone(this.model?.internalUserPositions || []);
      const rejectedJobPositionRoles = jobPositionItems.filter((item: any) => !this.positionValue.some(x => x.value === item.positionId));
      rejectedJobPositionRoles.forEach((item) => {
         this.jobPositionsMap.set(Number(item.id), [new SelectModel(item.positionId,
          `${item.positionName ?? ''} (${this.translateService.instant('common.inactive')})`,
          true),
          ...this.positionValue]);
      })

    }

    if(this.isView) {
      this.viewFormInit();
    }
  }

  viewFormInit() {
    this.addEditForm.patchValue({
      gender: this.model?.gender === 'MALE' ? this.translateService.instant(
      'common.gender.male') : this.translateService.instant('common.gender.female'),
      dob: this.dateUtilService.convertDateToDisplayServerTime(this.model?.dob || "") || "",
      status: this.translateService.instant(
      this.utilsService.getEnumValueTranslated(BaseStatusEnum, this.model?.status || '')),
      createdDate: this.dateUtilService.convertDateToDisplayServerTime(this.model?.createdDate || "") || "",
      lastModifiedDate: this.dateUtilService.convertDateToDisplayServerTime(this.model?.lastModifiedDate || "") || "",
    })
  }

  onSubmit() {
    const formData = new FormData();
    const internalUserDelegations = this.addEditForm.get("internalUserDelegations")?.value?.map((item: any) => {
      return {
        ...item,
        startDate: typeof item.startDate === "string" ? (item.startDate || null) : this.dateUtilService.convertDateToStringCurrentGMT(item.startDate),
      }
    });
    this.addEditForm.patchValue({ internalUserDelegations });
    const employeeModel = new EmployeeModel(this.addEditForm);
    const mergedPayload = this.deepMerge(this.model || {}, employeeModel);
    formData.append('body', this.utilsService.toBlobJon(mergedPayload));

    const apiCall = this.apiService.put(`${environment.PATH_API_V1}/mdm/internal-user/${this.id}`, formData);

    let action = 'edit';
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

  deepMerge(target: any, source: any): any {
    const result = {...target};

    for(const key in source) {
      if(source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  onRedirect(item: any) {
    this.router.navigate([`/mdm/internal-user/edit`, item]).then();
  }

  onAddRole() {
    const values = this.addEditForm.get('userRoles')?.value as UserRole[];
    this.addEditForm.get('userRoles')?.patchValue([
      ...values,
      {
        roleId: '',
        organizationId: '',
      },
    ]);
  }

  onDeleteRole(index: number) {
    const userRoles = this.addEditForm.get('userRoles')?.value;
    userRoles.splice(index, 1);
    this.addEditForm.get('userRoles')?.setValue(userRoles);
  }

  onAddUserPosition() {
    const values = this.addEditForm.get('internalUserPositions')?.value as UserPosition[];
    this.addEditForm.get('internalUserPositions')?.patchValue([
      ...values,
      {
        name: '',
        code: '',
      },
    ]);
  }

  onDeleteUserPositions(index: number) {
    const internalUserPositions = this.addEditForm.get('internalUserPositions')?.value;
    internalUserPositions.splice(index, 1);
    this.addEditForm.get('internalUserPositions')?.setValue(internalUserPositions);
  }

  onDeleteUserDelegations(index: number | null | undefined) {
    const internalUserDelegations = this.addEditForm.get('internalUserDelegations')?.value;
    internalUserDelegations.splice(index, 1);
    this.addEditForm.get('internalUserDelegations')?.setValue(internalUserDelegations);
  }

  onRowButtonClick(event: ButtonClickEvent) {
    switch(event.action) {
      case 'onDeleteUserPositions':
        this.onDeleteUserPositions(event?.index as number);
        break;
      case 'onDeleteUserDelegations':
        this.onDeleteUserDelegations(event?.index);
        break;
      default:
        this.onDeleteRole(event?.index as number);
        break;
    }
  }

  onOpenPopup() {
    this.matDialog.open(
      PopupChooseUserComponent,
      {
        disableClose: false,
        width: '1500px',
        maxWidth: '100vw',
        maxHeight: '90vh',
        data: {
          title: "common.popup.title.select-individual",
          selected: this.addEditForm.get('internalUserDelegations')?.value,
          trackBy: "assignerId"
        },
      }
    ).afterClosed().subscribe((selectedUsers: any[]) => {
        if(selectedUsers) {
          const mappedData = selectedUsers.map(user => ({
            id: this.model?.internalUserDelegations.find(item => item.assignerId === user.id)?.id || null,
            assignerId: user.assignerId || user.id,
            assignerFullName: user.assignerFullName || user.fullName,
            assignerCode: user.assignerCode || user.code,
            moduleId: user.moduleId,
            moduleName: user.moduleName,
            limitAmount: user.limitAmount,
            startDate: user.startDate ? user.startDate : this.defaultFromDate,
            endDate: user.endDate
          }));
          this.addEditForm.get('internalUserDelegations')?.patchValue(mappedData);
        }
      }
    );
  }

  private initializeForm() {
    this.addEditForm = this.fb.group({
      id: [''],
      code: [''],
      fullName: [''],
      userName: [''],
      organizationId: [],
      organizationName: [''],
      jobPositionId: [''],
      jobPositionName: [''],
      email: [],
      phoneNumber: [],
      gender: [],
      dob: [],
      description: ['', [Validators.pattern(VIETNAMESE_REGEX)]],
      status: [],
      createdDate: [],
      createdBy: [],
      lastModifiedDate: [],
      lastModifiedBy: [],
      userRoles: [],
      internalUserPositions: [],
      internalUserDelegations: [],
      voAuthentication: []
    });

    this.isView = this.activatedRoute.routeConfig?.data?.actionType === ActionTypeEnum._VIEW;
    this.statusValues$ = of(this.selectValuesService.statusValues);
    this.addEditForm.get('voAuthentication')?.setValue(this.voAuthentication);
  }

  private initializeRoleColumns() {
    this.roleColumns.push(
      {
        columnDef: 'stt',
        header: 'stt',
        headerClassName: 'mat-column-stt width-5 min-width-40',
        className: 'mat-column-stt',
        title: (e: UserRole) => `${this.addEditForm.get('userRoles')?.value.indexOf(e) + 1}`,
        cell: (e: UserRole) => `${this.addEditForm.get('userRoles')?.value.indexOf(e) + 1}`,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'roleId',
        header: 'roleName',
        className: 'mat-column-roleId',
        title: (e: UserRole) => `${e.roleName}`,
        cell: (e: UserRole) => `${e.roleName}`,
        optionValues: (e: UserRole) => this.rolesMap.get(Number(e.id)) || this.roleValues,
        isRequired: !this.isView,
        columnType: this.isView ? ColumnTypeEnum.VIEW : ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT
      },
      {
        columnDef: 'organizationId',
        header: 'organizationName',
        className: 'mat-column-organizationId',
        title: (e: UserRole) => `${e.organizationName}`,
        cell: (e: UserRole) => `${e.organizationName}`,
        optionValues: () => this.organizationValues,
        isRequired: !this.isView,
        columnType: this.isView ? ColumnTypeEnum.VIEW : ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT
      }
    );

    this.roleButtons.push({
      columnDef: 'delete',
      color: 'primary',
      icon: 'fa fa-trash',
      iconType: IconTypeEnum.FONT_AWESOME,
      click: 'onDeleteRole',
      className: 'primary content-cell-align-center',
      title: 'common.title.delete',
      display: () => !this.isView && this.hasEditPermission,
      header: 'common.table.action.title',
      alignHeader: AlignEnum.CENTER,
    });
  }

  private isStartDatePassed(delegation: UserDelegation): boolean {
    if (!delegation || !delegation.startDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(delegation.startDate);
    startDate.setHours(0, 0, 0, 0);
    return today >= startDate;
  }

  private initializeInternalUserDelegationsColumns() {
    const getValue = (listName: string, e: any) => `${this.addEditForm.get(listName)?.value.indexOf(e) + 1}`;

    this.internalUserDelegationsColumns.push(
      this.createSttColumn(getValue),
      this.createAssignerColumn(),
      this.createModuleColumn(),
      this.createLimitAmountColumn(),
      this.createStartDateColumn(),
      this.createEndDateColumn()
    );

    this.internalUserDelegationsButtons.push(this.createDeleteButton());
  }

  private createSttColumn(getValue: (listName: string, e: any) => string) {
    return {
      columnDef: 'stt',
      header: 'stt',
      headerClassName: 'mat-column-stt width-5 min-width-40',
      className: 'mat-column-stt',
      title: (e: UserDelegation) => getValue('internalUserDelegations', e),
      cell: (e: UserDelegation) => getValue('internalUserDelegations', e),
      columnType: ColumnTypeEnum.VIEW,
      alignHeader: AlignEnum.CENTER,
      align: AlignEnum.CENTER,
    };
  }

  private createAssignerColumn() {
    return {
      columnDef: 'assignerId',
      header: 'assignerFullName',
      className: 'mat-column-assignerId',
      title: (e: UserDelegation) => `${e.assignerFullName} (${e.assignerCode})`,
      cell: (e: UserDelegation) => `${e.assignerFullName} (${e.assignerCode})`,
      isRequired: !this.isView,
      columnType: ColumnTypeEnum.VIEW,
      alignHeader: AlignEnum.CENTER,
      align: AlignEnum.LEFT
    };
  }

  private createModuleColumn() {
    return {
      columnDef: 'moduleId',
      header: 'moduleName',
      className: 'mat-column-moduleId',
      title: (e: UserDelegation) => this.getModuleDisplayValue(e),
      cell: (e: UserDelegation) => this.getModuleDisplayValue(e),
      optionValues: (e: UserDelegation) => this.modulesMap.get(Number(e.id)) || this.moduleValue,
      isRequired: !this.isView,
      columnType: (e: UserDelegation) => this.getModuleColumnType(e),
      alignHeader: AlignEnum.CENTER,
      align: AlignEnum.LEFT
    };
  }

  private createLimitAmountColumn() {
    return {
      columnDef: 'limitAmount',
      header: 'limitAmount',
      className: 'mat-column-limitAmount',
      title: (e: UserDelegation) => this.formatLimitAmount(e),
      cell: (e: UserDelegation) => this.formatLimitAmount(e),
      columnType: (e: UserDelegation) => this.getLimitAmountColumnType(e),
      alignHeader: AlignEnum.CENTER,
      align: AlignEnum.RIGHT,
      patternFilter: this.limitAmountRegex.source
    };
  }

  private createStartDateColumn() {
    return {
      columnDef: 'startDate',
      header: 'startDate',
      className: 'mat-column-startDate',
      title: (e: UserDelegation) => this.formatDate(e.startDate),
      cell: (e: UserDelegation) => this.formatDate(e.startDate),
      isRequired: !this.isView,
      columnType: (e: UserDelegation) => this.getStartDateColumnType(e),
      alignHeader: AlignEnum.CENTER,
      align: AlignEnum.CENTER,
      min: () => this.getTomorrowDate()
    };
  }

  private createEndDateColumn() {
    return {
      columnDef: 'endDate',
      header: 'endDate',
      className: 'mat-column-endDate',
      title: (e: UserDelegation) => this.formatDate(e.endDate),
      cell: (e: UserDelegation) => this.formatDate(e.endDate),
      columnType: this.isView ? ColumnTypeEnum.VIEW : ColumnTypeEnum.DATE_PICKER,
      alignHeader: AlignEnum.CENTER,
      align: AlignEnum.CENTER,
      min: (e: UserDelegation) => this.getNextDay(e.startDate)
    };
  }

  private createDeleteButton() {
    return {
      columnDef: 'delete',
      color: 'primary',
      icon: 'fa fa-trash',
      iconType: IconTypeEnum.FONT_AWESOME,
      click: 'onDeleteUserDelegations',
      className: 'primary content-cell-align-center',
      title: 'common.title.delete',
      display: () => this.internalUserDelegationsButtonsVisible,
      header: 'common.table.action.title',
      alignHeader: AlignEnum.CENTER,
    };
  }

  private getModuleDisplayValue(e: UserDelegation): string {
    return this.modulesMap.get(Number(e.id))?.find(x => x.value === e.moduleId)?.displayValue ?? `${e.moduleName}`;
  }

  private getModuleColumnType(e: UserDelegation): ColumnTypeEnum {
    if (this.isView || this.isStartDatePassed(e)) return ColumnTypeEnum.VIEW;
    return ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE;
  }

  private formatLimitAmount(e: UserDelegation): string {
    return e.limitAmount ? `${Utils.formatCurrencyWithComma(e.limitAmount)}` : '';
  }

  private getLimitAmountColumnType(e: UserDelegation): ColumnTypeEnum {
    if (this.isView || this.isStartDatePassed(e)) return ColumnTypeEnum.VIEW;
    return ColumnTypeEnum.INPUT_CURRENCY;
  }

  private formatDate(date: any): string {
    return date ? String(this.dateUtilService.convertDateToDisplayServerTime(date)) : '';
  }

  private getStartDateColumnType(e: UserDelegation): ColumnTypeEnum {
    if (this.isView || this.isStartDatePassed(e)) return ColumnTypeEnum.VIEW;
    return ColumnTypeEnum.DATE_PICKER;
  }

  private getTomorrowDate(): Date {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow;
  }

  private getNextDay(startDate: any): Date {
    const date = new Date(startDate);
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    return nextDay;
  }

  private initializeInternalUserPositionsColumns() {
    const getValue = (listName: string, e: any) => `${this.addEditForm.get(listName)?.value.indexOf(e) + 1}`;

    this.internalUserPositionsColumns.push(
      {
        columnDef: 'stt',
        header: 'stt',
        headerClassName: 'mat-column-stt width-5 min-width-40',
        className: 'mat-column-stt',
        title: (e: UserPosition) => getValue('internalUserPositions', e),
        cell: (e: UserPosition) => getValue('internalUserPositions', e),
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'positionId',
        header: 'positionName',
        className: 'mat-column-positionId',
        title: (e: UserPosition) => `${e.positionName}`,
        cell: (e: UserPosition) => `${e.positionName}`,
        optionValues: (e: UserPosition) => this.jobPositionsMap.get(Number(e.id)) || this.positionValue,
        isRequired: !this.isView,
        columnType: this.isView ? ColumnTypeEnum.VIEW : ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT
      },
      {
        columnDef: 'organizationId',
        header: 'organizationName',
        className: 'mat-column-organizationId',
        title: (e: UserPosition) => `${e.organizationName}`,
        cell: (e: UserPosition) => `${e.organizationName}`,
        optionValues: () => this.organizationValues,
        isRequired: !this.isView,
        columnType: this.isView ? ColumnTypeEnum.VIEW : ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT
      },
    );

    this.internalUserPositionsButtons.push({
      columnDef: 'delete',
      color: 'primary',
      icon: 'fa fa-trash',
      iconType: IconTypeEnum.FONT_AWESOME,
      click: 'onDeleteUserPositions',
      className: 'primary content-cell-align-center',
      title: 'common.title.delete',
      display: () => !this.isView && this.hasEditPermission,
      header: 'common.table.action.title',
      alignHeader: AlignEnum.CENTER,
    });
  }
}
