import {Component, Inject, Injector, Optional} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {
  AlignEnum,
  ApiService,
  AuthoritiesService,
  BaseStatusEnum,
  ButtonModel,
  ColumnModel,
  ColumnTypeEnum,
  FormStateService,
  IconTypeEnum,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Config} from 'src/app/common/models/config.model';
import {FORM_CONFIG} from './external-user.config';
import {EmployeeModel} from 'src/app/shared/components/internal-user/internal-user.model';
import {Utils} from 'src/app/shared/utils/utils';
import {Observable} from 'rxjs';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {DatePipe} from "@angular/common";
import {ExternalUserDetailModel} from "src/app/modules/mdm/_models/external-user.model";
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {environment} from "src/environments/environment";

@Component({
  selector:'app-external-user',
  standalone: false,
  templateUrl: './external-user.component.html',
})
export class ExternalUserComponent {
  moduleName?: string;

  columns: ColumnModel[] = [];
  buttons: ButtonModel[] = [];
  configForm: Config;
  formAdvanceSearch?: FormGroup;
  selectedEmployee: ExternalUserDetailModel[] = []

  statusValues$: Observable<SelectModel[]>;
  statusOptions$: Observable<SelectModel[]> = this.selectService.getStatus();

  organizationValues$: Observable<SelectModel[]>;
  typeValues: SelectModel[] = [
    {
      value: -1,
      disabled: false,
      displayValue: this.translateService.instant("common.combobox.option.default"),
      rawData: -1,
    },
    {
      value: 'COLLABORATOR',
      disabled: false,
      displayValue: this.translateService.instant('external-user.type.collaborator'),
      rawData: 'COLLABORATOR'
    },
    {
      value: 'PARTNER',
      disabled: false,
      displayValue: this.translateService.instant('external-user.type.partner'),
      rawData: 'PARTNER'
    }
  ];

  genderValue: SelectModel[] = [
    {
      value: 'MALE',
      disabled: false,
      displayValue: this.translateService.instant('common.gender.male'),
      rawData: 'MALE',
    },
    {
      value: 'FEMALE',
      disabled: false,
      displayValue: this.translateService.instant('common.gender.female'),
      rawData: 'FEMALE',
    },
  ];

  isPopup: boolean;
  trackBy: string = '';

  Utils= Utils;
  protected readonly environment = environment;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected apiService: ApiService,
    protected utilsService: UtilsService,
    protected uiStateService: FormStateService,
    protected translateService: TranslateService,
    protected injector: Injector,
    protected activatedRoute: ActivatedRoute,
    protected authoritiesService: AuthoritiesService,
    protected selectValuesService: SelectValuesService,
    protected selectService: SelectValuesService,
    protected datePipe: DatePipe,
    protected permissionCheckingUtil: PermissionCheckingUtil,
    @Optional() public matDialogRef: MatDialogRef<EmployeeModel>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.moduleName = this.configForm?.name

    this.formAdvanceSearch = formBuilder.group(this.configForm.filterForm!.reduce((result: any, item) => {
      result[item.name] = item.validate;
      return result;
    }, {}));

    this.isPopup = data;

    if(data) {
      this.isPopup = true;
      this.selectedEmployee = [...data.selected || []];
      this.trackBy = data.trackBy || 'id';
    }

    this.columns.push(
      {
        columnDef: 'code',
        header: 'code',
        className: 'mat-column-code',
        title: (e: ExternalUserDetailModel) => `${e.code || ''}`,
        cell: (e: ExternalUserDetailModel) => `${e.code || ''}`,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'fullName',
        header: 'name',
        className: 'mat-column-name',
        title: (e: ExternalUserDetailModel) => `${e.fullName || ''}`,
        cell: (e: ExternalUserDetailModel) => `${e.fullName || ''}`,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'type',
        header: 'type',
        className: 'mat-column-name',
        title: (e: ExternalUserDetailModel) => `${e.type === "COLLABORATOR" ?
          this.translateService.instant('mdm.external-user.type.collaborator') :
          this.translateService.instant('mdm.external-user.type.partner')}`,
        cell: (e: ExternalUserDetailModel) => `${e.type === "COLLABORATOR" ?
          this.translateService.instant('mdm.external-user.type.collaborator') :
          this.translateService.instant('mdm.external-user.type.partner')}`,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'organization',
        header: 'organization',
        className: 'mat-column-organization',
        title: (e: ExternalUserDetailModel) => `${e.organizationName || ''}`,
        cell: (e: ExternalUserDetailModel) => `${e.organizationName || ''}`,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'email',
        header: 'email',
        className: 'mat-column-email',
        title: (e: ExternalUserDetailModel) => `${e.email || ''}`,
        cell: (e: ExternalUserDetailModel) => `${e.email || ''}`,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'phoneNumber',
        header: 'phoneNumber',
        className: 'mat-column-phoneNumber',
        title: (e: ExternalUserDetailModel) => `${e.phoneNumber || ''}`,
        cell: (e: ExternalUserDetailModel) => `${e.phoneNumber || ''}`,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'gender',
        header: 'gender',
        className: 'mat-column-gender',
        title: (e: ExternalUserDetailModel) => `${e.gender === 'MALE' ? this.translateService.instant('common.gender.male') : this.translateService.instant('common.gender.female')}`,
        cell: (e: ExternalUserDetailModel) => `${e.gender === 'MALE' ? this.translateService.instant('common.gender.male') : this.translateService.instant('common.gender.female')}`,
        isExpandOptionColumn: () => true,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'dob',
        header: 'dob',
        className: 'mat-column-dob',
        title: (e: ExternalUserDetailModel) => `${this.datePipe.transform(e.dob, 'dd/MM/yyyy') || ''}`,
        cell: (e: ExternalUserDetailModel) => `${this.datePipe.transform(e.dob, 'dd/MM/yyyy') || ''}`,
        isExpandOptionColumn: () => true,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'status',
        header: 'status',
        title: (e: ExternalUserDetailModel) => `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
        cell: (e: ExternalUserDetailModel) => `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
        className: 'mat-column-status',
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      }
    );

    if(this.isPopup) {
      this.columns.unshift({
        columnDef: 'checked',
        header: () => '',
        className: 'mat-column-name',
        title: (e: ExternalUserDetailModel) => `${e.checked}`,
        cell: (e: ExternalUserDetailModel) => `${e.checked}`,
        columnType: (e: EmployeeModel) => ColumnTypeEnum.CHECKBOX,
        disabled: () => false,
        display: (e: ExternalUserDetailModel) => this.isPopup,
        onCellValueChange: (e: ExternalUserDetailModel) => this.onChooseEmployee(e),
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      })
    }

    this.buttons.push(
      {
        columnDef: 'detail',
        color: 'warn',
        icon: 'fa fa-eye',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'viewDetail',
        className: 'primary content-cell-align-center',
        title: 'common.title.detail',
        display: (e: ExternalUserDetailModel) => !this.isPopup,
        header: "common.table.action.title",
        alignHeader: AlignEnum.CENTER
      },
      {
        columnDef: 'edit',
        color: 'warn',
        icon: 'fa fa-pen',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'addOrEdit',
        className: 'primary content-cell-align-center',
        title: 'common.title.edit',
        display: (e: ExternalUserDetailModel) => !this.isPopup,
        header: "common.table.action.title",
        alignHeader: AlignEnum.CENTER
      },
      {
        columnDef: 'accept',
        color: 'primary',
        icon: 'fa fa-check',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'accept',
        className: 'primary content-cell-align-center',
        title: 'common.title.accept',
        display: (e: ExternalUserDetailModel) => !this.isPopup,
        disabled: (e: ExternalUserDetailModel) => e?.status === 'APPROVED',
        header: "common.table.action.title",
        alignHeader: AlignEnum.CENTER
      },
      {
        columnDef: 'reject',
        color: 'warn',
        icon: 'fa fa-ban',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'reject',
        className: 'primary content-cell-align-center',
        title: 'common.title.reject',
        display: (e: ExternalUserDetailModel) => !this.isPopup,
        disabled: (e: ExternalUserDetailModel) => e?.status === 'REJECTED',
        header: "common.table.action.title",
        alignHeader: AlignEnum.CENTER
      },
    );

    this.organizationValues$ = this.selectValuesService.getAutocompleteValuesFromModulePath(`${environment.PATH_API_V1}/mdm/organization`)
    this.statusValues$ = this.selectValuesService.getStatus()
  }

  onChooseEmployee(e: ExternalUserDetailModel) {
    if(!this.selectedEmployee && e.checked){
      this.selectedEmployee = [];
      this.selectedEmployee.push(e);
    }
    if(this.selectedEmployee){
      const findIndex = this.selectedEmployee.findIndex((item: any) => item[this.trackBy] == e.id);

      if(e.checked) {
        if (findIndex < 0) {
          this.selectedEmployee.push({
            ...e,
            [this.trackBy]: e.id
          });
        } else {
          Object.assign(this.selectedEmployee[findIndex], e);
        }
      } else if(!e.checked && findIndex > -1) {
        this.selectedEmployee.splice(findIndex, 1);
      }
    }
  }

  chooseEmployee() {
    this.matDialogRef.close(this.selectedEmployee);
  }

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }
}
