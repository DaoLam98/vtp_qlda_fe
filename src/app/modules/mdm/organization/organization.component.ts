import { Component, Inject, Injector, Optional } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  AlignEnum,
  ApiService,
  AuthoritiesService,
  ButtonModel,
  ColumnModel,
  FormStateService,
  IconTypeEnum,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import { environment } from 'src/environments/environment';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Config } from 'src/app/common/models/config.model';
import { FORM_CONFIG } from './organization.config';
import { EmployeeModel } from 'src/app/shared/components/internal-user/internal-user.model';
import { GenderEnum } from 'src/app/shared/enums/gender.enum';
import { SuperStatusEnum } from 'src/app/shared';
import { Utils } from 'src/app/shared/utils/utils';

@Component({
  templateUrl: './organization.component.html',
  standalone: false
})
export class OrganizationComponent {

  moduleName?: string;

  columns: ColumnModel[] = [];
  buttons: ButtonModel[] = [];
  configForm: Config;
  formAdvanceSearch?: FormGroup;

  genderValues: SelectModel[] = [];
  statusValues: SelectModel[] = [];

  isPopup: boolean;
  Utils= Utils;

  get expandHeaderButton() {
    return environment.EXPAND_HEADER_BUTTON;
  }

  constructor(protected formBuilder: FormBuilder,
              protected router: Router,
              protected apiService: ApiService,
              protected utilsService: UtilsService,
              protected uiStateService: FormStateService,
              protected translateService: TranslateService,
              protected injector: Injector,
              protected activatedRoute: ActivatedRoute,
              protected authoritiesService: AuthoritiesService,
              @Optional() public matDialogRef: MatDialogRef<EmployeeModel>,
              @Optional() @Inject(MAT_DIALOG_DATA) public data: boolean) {
    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));
    this.moduleName = this.configForm?.name
    this.formAdvanceSearch = formBuilder.group(this.configForm.filterForm!.reduce((result: any, item) => {
      result[item.name] = item.validate;
      return result;
    }, {}));
    this.isPopup = data;
    this.columns.push(
      {
        columnDef: 'code', header: 'code',
        title: (e: EmployeeModel) => `${e.code}`,
        cell: (e: EmployeeModel) => `${e.code}`,
        className: 'mat-column-code',
      },
      {
        columnDef: 'name', header: 'name',
        title: (e: EmployeeModel) => `${e.name}`,
        cell: (e: EmployeeModel) => `${e.name}`,
        className: 'mat-column-name',
      },
      {
        columnDef: 'email', header: 'email',
        title: (e: EmployeeModel) => `${e.email}`,
        cell: (e: EmployeeModel) => `${e.email}`,
        className: 'mat-column-email',
      },
      {
        columnDef: 'phoneNumber', header: 'phoneNumber',
        title: (e: EmployeeModel) => `${e.phoneNumber}`,
        cell: (e: EmployeeModel) => `${e.phoneNumber}`,
        className: 'mat-column-phoneNumber',
      },
      {
        columnDef: 'gender',
        header: 'gender',
        title: (e: EmployeeModel) => this.utilsService.getEnumValueTranslated(GenderEnum, String(e.gender)),
        cell: (e: EmployeeModel) => this.utilsService.getEnumValueTranslated(GenderEnum, String(e.gender)),
        className: 'mat-column-gender',
        isExpandOptionColumn: () => true,
      },
      {
        columnDef: 'organization', header: 'organization',
        title: (e: EmployeeModel) => `${e.organizationName}`,
        cell: (e: EmployeeModel) => `${e.organizationName}`,
        className: 'mat-column-organization',
      },
      {
        columnDef: 'status',
        header: 'status',
        title: (e: EmployeeModel) => this.utilsService.getEnumValueTranslated(SuperStatusEnum, String(e.status)),
        cell: (e: EmployeeModel) => this.utilsService.getEnumValueTranslated(SuperStatusEnum, String(e.status)),
        className: 'mat-column-status',
        isExpandOptionColumn: () => true,
      });

    this.buttons.push(
      {
        columnDef: 'edit',
        color: 'warn',
        icon: 'fa fa-pen',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'addOrEdit',
        className: 'primary',
        title: 'common.title.edit',
        display: (e: EmployeeModel) => !this.isPopup,
        header: "common.table.action.title",
        alignHeader: AlignEnum.CENTER
      },
      {
        columnDef: 'detail',
        color: 'warn',
        icon: 'fa fa-eye',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'viewDetail',
        className: 'primary',
        title: 'common.title.detail',
        display: (e: EmployeeModel) => !this.isPopup,
        header: "common.table.action.title",
        alignHeader: AlignEnum.CENTER
      },
      {
        columnDef: 'accept',
        color: 'primary',
        icon: 'fa fa-check',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'accept',
        className: 'primary',
        title: 'common.title.accept',
        display: (e: EmployeeModel) => !this.isPopup,
        disabled: (e: EmployeeModel) => true,
        header: "common.table.action.title",
        alignHeader: AlignEnum.CENTER
      },
      {
        columnDef: 'reject',
        color: 'warn',
        icon: 'fa fa-ban',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'reject',
        className: 'danger',
        title: 'common.title.reject',
        display: (e: EmployeeModel) => true,
        disabled: (e: EmployeeModel) => true,
        header: "common.table.action.title",
        alignHeader: AlignEnum.CENTER
      },
      {
        columnDef: 'chooseEmployee',
        color: 'primary',
        icon: 'fa fa-check',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'chooseEmployee',
        className: 'primary',
        title: 'employee.table.header.btnChooseEmployee',
        display: (e: EmployeeModel) => this.isPopup,
        header: "common.table.action.title",
        alignHeader: AlignEnum.CENTER
      },
    );
  }

}
