import { Component, Inject, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  AlignEnum,
  ApiService,
  AuthoritiesService, BaseStatusEnum,
  ButtonModel,
  ColumnModel,
  ColumnTypeEnum,
  FlatTreeNodeModel,
  IconTypeEnum,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import { HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EnumUtil } from '../../../utils/enum.util';
import { Config } from 'src/app/common/models/config.model';
import { FORM_CONFIG } from './account-tree.config';
import type { CloudSearchComponent } from 'src/app/shared/components/base-search/cloud-search.component';
import { Utils } from 'src/app/shared/utils/utils';
import { PermissionCheckingUtil } from 'src/app/shared/utils/permission-checking.util';
import { SelectValuesService } from 'src/app/core/services/selectValues.service';
import { SuperStatusEnum } from '../../../enums/super.status.enum';
import { AccountingAccountModel } from 'src/app/modules/mdm/_models/accounting-account.model';
import { OrganizationModel } from 'src/app/modules/mdm/_models/organization.model';

@Component({
  selector: 'app-account-tree',
  standalone: false,
  templateUrl: './account-tree.component.html',
  styleUrl: './account-tree.component.scss',
})
export class AccountTreeComponent implements OnInit {
  moduleName = 'mdm.account';

  @ViewChild('cloudSearchRef', { static: true }) cloudSearchComponent!: CloudSearchComponent;

  Utils = Utils;

  columns: ColumnModel[] = [];
  buttons: ButtonModel[] = [];
  configForm: Config;
  formAdvanceSearch?: FormGroup;

  accountTree: FlatTreeNodeModel[] = [];
  statusValues: SelectModel[] = [];

  selectedOrganization: AccountingAccountModel[] = [];
  originalSelectedOrgList: AccountingAccountModel[] = [];

  isAdvancedSearch: boolean = false;
  isPopup: boolean = false;
  trackBy: string = '';
  selectedTreeNode!: FlatTreeNodeModel;
  orgOptions: SelectModel[] = [];

  protected readonly environment = environment;
  parentValues: SelectModel[] = [];

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected apiService: ApiService,
    protected utilsService: UtilsService,
    protected translateService: TranslateService,
    protected injector: Injector,
    protected activatedRoute: ActivatedRoute,
    protected authoritiesService: AuthoritiesService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
    protected selectValuesService: SelectValuesService,
    @Optional() public matDialogRef: MatDialogRef<AccountingAccountModel>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.formAdvanceSearch = formBuilder.group(this.configForm.filterForm!.reduce((result: any, item) => {
      result[item.name] = item.validate;
      return result;
    }, {}));

    if (data) {
      this.isPopup = true;
      this.isAdvancedSearch = true;
      this.selectedOrganization = [...data.selected || []];
      this.originalSelectedOrgList = [...data.selected || []];
      this.trackBy = data.trackBy || 'id';
    }
    if(this.isPopup) {
      this.columns.unshift(
        {
          columnDef: 'checked',
          header: () => '',
          className: 'mat-column-checked',
          title: (e: AccountingAccountModel) => `${e.checked}`,
          cell: (e: AccountingAccountModel) => `${e.checked}`,
          columnType: (e) => ColumnTypeEnum.CHECKBOX,
          disabled: () => false,
          display: (e: AccountingAccountModel) => this.isPopup,
          onCellValueChange: (e: AccountingAccountModel) => this.onChooseAccount(e),
          alignHeader: AlignEnum.CENTER,
          align: AlignEnum.CENTER,
        },
      );
    }

    this.columns.push(
      {
        columnDef: 'accountNumber',
        header: 'accountNumber',
        className: 'mat-column-accountNumber',
        title: (e: AccountingAccountModel) => this.displayCellValue(e.accountNumber),
        cell: (e: AccountingAccountModel) => this.displayCellValue(e.accountNumber),
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'name',
        header: 'name',
        headerClassName: 'mat-header-stt width-15',
        className: 'mat-column-code',
        title: (e: AccountingAccountModel) => this.displayCellValue(e.name),
        cell: (e: AccountingAccountModel) => this.displayCellValue(e.name),
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'parentId',
        header: 'parentName',
        headerClassName: 'width-35',
        className: 'mat-column-parentName',
        title: (e: AccountingAccountModel) => `${e.parentName || ''}`,
        cell: (e: AccountingAccountModel) => `${e.parentAccountNumber ? e.parentAccountNumber + ' (' + e.parentName + ')' : ''}`,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'status',
        header: 'status',
        title: (e: AccountingAccountModel) => `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
        cell: (e: AccountingAccountModel) => `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
        className: 'mat-column-status',
        isExpandOptionColumn: () => false,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
    );

    this.buttons.push(
      {
        columnDef: 'detail',
        color: 'warn',
        icon: 'fa fa-eye',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'viewDetail',
        className: 'primary content-cell-align-center',
        title: 'common.title.detail',
        display: (e: AccountingAccountModel) => !this.isPopup,
      },
      {
        columnDef: 'edit',
        color: 'warn',
        icon: 'fa fa-pen',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'addOrEdit',
        className: 'primary content-cell-align-center',
        title: 'common.title.edit',
        display: (e: AccountingAccountModel) => !this.isPopup,
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'accept',
        color: 'primary',
        icon: 'fa fa-check',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'accept',
        className: 'primary content-cell-align-center',
        title: 'common.title.accept',
        display: (e: AccountingAccountModel) => !this.isPopup,
        disabled: (e: AccountingAccountModel) => e?.status === 'APPROVED',
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'reject',
        color: 'warn',
        icon: 'fa fa-ban',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'reject',
        className: 'primary content-cell-align-center',
        title: 'common.title.reject',
        display: (e: AccountingAccountModel) => !this.isPopup,
        disabled: (e: AccountingAccountModel) => e?.status === 'REJECTED',
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
    );
  }

  async ngOnInit() {
    EnumUtil.enum2SelectModel(SuperStatusEnum, this.statusValues, 'SEARCH');
    const temp = await firstValueFrom(
      this.apiService.get<FlatTreeNodeModel[]>(
        environment.PATH_API_V1 + '/mdm/accounting-account/flat-tree-node',
        new HttpParams(), environment.BASE_URL,
      ));
    temp.forEach(t => {
      t.expandable = true;
      t.isExpanded = true;
      t.isFilterExpanded = true;
    });
    this.accountTree = temp;
    this.selectedTreeNode = this.accountTree?.[0] || [];
    this.cloudSearchComponent?.onSubmit();

    this.parentValues = await lastValueFrom(
      this.selectValuesService.getAutocompleteValuesFromModulePath(
        `${environment.PATH_API_V1}/mdm/accounting-account`,
        undefined,
        {
          code: 'name',
          name: 'accountNumber'
        },
        'id,accountNumber,name',
        true,
      ),
    );

    this.callAPIGetOrgOptionList();
  }

  callAPIGetOrgOptionList() {
    this.selectValuesService.getAutocompleteValuesFromModulePath(
      `${environment.PATH_API_V1}/mdm/accounting-account`
    ).subscribe(options => {
      this.orgOptions = options;
    });
  }

  onChooseAccount(e: AccountingAccountModel) {
    if (!this.selectedOrganization && e.checked) {
      this.selectedOrganization = [];
      this.selectedOrganization.push(e);
    }
    if (this.selectedOrganization) {
      const findIndex = this.selectedOrganization.findIndex((item: any) => item[this.trackBy] == e.id);

      if (e.checked) {
        if (findIndex < 0) {
          this.selectedOrganization.push({
            ...e,
            [this.trackBy]: e.id,
          });
        } else {
          Object.assign(this.selectedOrganization[findIndex], e);
        }
      } else if (!e.checked && findIndex > -1) {
        this.selectedOrganization.splice(findIndex, 1);
      }
    }
  }

  getSelectedNodes(treeData: FlatTreeNodeModel[]): string[] {
    const selectedValues: string[] = [];
    for (const treeDataNode of treeData) {
      if (treeDataNode.checked) {
        selectedValues.push(treeDataNode.value);
        continue;
      }
      if (treeDataNode.children && treeDataNode.children.length > 0) {
        selectedValues.push(...this.getSelectedNodes(treeDataNode.children));
      }
    }
    return selectedValues;
  }

  onSelectChangeAcc(event: FlatTreeNodeModel) {
    event && (this.selectedTreeNode = event);
    event.expandable = true;
    event.isExpanded = true;
    event.isFilterExpanded = true;
    this.formAdvanceSearch?.get('path')?.setValue(event.value);
    this.cloudSearchComponent.onSubmit();
  }

  convertField2HttpParamFn(param: HttpParams, formGroup: FormGroup) {
    return this.selectedTreeNode?.value ? param.set('isIncludeItself', this.selectedTreeNode.value || '') : param;
  }

  chooseAccount() {
    this.matDialogRef.close(this.selectedOrganization);
  }

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }

  private displayCellValue(value: string | null): string {
    return value ? value : '';
  }
}
