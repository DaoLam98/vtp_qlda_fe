import { Component, OnInit } from '@angular/core';
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
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { ActionTypeEnum } from 'src/app/shared';
import { HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { DEFAULT_REGEX, VIETNAMESE_REGEX } from 'src/app/shared/constants/regex.constants';
import { firstValueFrom, lastValueFrom, Observable, of, skip } from 'rxjs';
import { SelectValuesService } from 'src/app/core/services/selectValues.service';
import { PermissionCheckingUtil } from 'src/app/shared/utils/permission-checking.util';
import { Config } from 'src/app/common/models/config.model';
import {
  FORM_CONFIG,
} from 'src/app/modules/mdm/acounting-account/accounting-account-search/accounting-account-search.config';
import {
  PopupChooseOrganizationComponent,
} from 'src/app/shared/components/organization/organization-popup-choosen/organization-popup-choosen.component';
import { OrganizationModel } from 'src/app/modules/mdm/_models/organization.model';
import { MatDialog } from '@angular/material/dialog';
import { AccountingAccountModel } from 'src/app/modules/mdm/_models/accounting-account.model';

@Component({
  selector: 'app-accounting-account-add-edit-detail',
  standalone: false,
  templateUrl: './accounting-account-add-edit-detail.component.html',
})
export class AccountingAccountAddEditDetailComponent extends BaseAddEditComponent implements OnInit {

  moduleName = 'mdm.accounting-account';
  configForm: Config;
  model: AccountingAccountModel | null = null;
  isView = false;
  statusValues$: Observable<SelectModel[]>;
  checkIsActive!: boolean;

  orgColumns: ColumnModel[] = [];
  orgButtons: ButtonModel[] = [];

  protected readonly environment = environment;
  parentValues: SelectModel[] = [];

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
    protected selectService: SelectValuesService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
    protected matDialog: MatDialog,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);

    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.addEditForm = this.fb.group({
      accountNumber: ['', [Validators.maxLength(255), Validators.pattern(DEFAULT_REGEX)]],
      name: ['', [Validators.maxLength(255), Validators.pattern(VIETNAMESE_REGEX)]],
      description: ['', [Validators.pattern(VIETNAMESE_REGEX)]],
      parentName: [],
      parentId: [],
      unit: [],
      status: [],
      createdDate: [],
      createdBy: [],
      lastModifiedDate: [],
      lastModifiedBy: [],
      organizations: [],
    });

    this.statusValues$ = of(this.selectService.statusValues);
    this.isView = this.activatedRoute.routeConfig?.data?.actionType === ActionTypeEnum._VIEW;
  }

  async ngOnInit() {
    super.ngOnInit();
    if(!this.isEdit) {
      this.parentValues = await lastValueFrom(
        this.selectService.getAutocompleteValuesFromModulePath(
          `${environment.PATH_API_V1}/mdm/accounting-account`,
          undefined,
          {
            code: 'name',
            name: 'accountNumber'
          },
          'id,accountNumber,name,status',
          true,
        ),
      );    
    }
    
    if(this.isEdit) {
      this.model = await firstValueFrom(
        this.apiService.get<AccountingAccountModel>(`${environment.PATH_API_V1}/mdm/accounting-account/` + this.id, new HttpParams()),
      );

      this.checkIsActive = this.model?.status === 'APPROVED';
      this.addEditForm.setValue(
        UtilsService.reduceEntityAttributeForFormControl(this.addEditForm, {
          ...this.model,
          parentId: Number(this.model?.parentId),
        }),
      );
      this.parentValues = this.parentValues.map(i => ({
        ...i,
        disabled: this.model?.id === i.value || i.disabled,
      }));
      const accountingOptions = await lastValueFrom(
        this.selectService.getAutocompleteValuesFromModulePath(
          `${environment.PATH_API_V1}/mdm/accounting-account`,
          undefined,
          {
            code: 'name',
            name: 'accountNumber'
          },
          'id,accountNumber,name,status',
          true,
          undefined, 
          true
        ),
      );  
      this.parentValues = accountingOptions.filter(i => !i.disabled || i.value === this.model?.parentId);
    }

    if (this.isView) {
      this.addEditForm.get('status')?.setValue(
        this.translateService.instant(this.utilsService.getEnumValueTranslated(BaseStatusEnum, this.model?.status || '')),
      );
      this.addEditForm.get('createdDate')?.setValue(this.dateUtilService.convertDateToDisplayGMT0(String(this.model?.createdDate)));
      this.addEditForm.get('lastModifiedDate')?.setValue(
        this.dateUtilService.convertDateToDisplayGMT0(String(this.model?.lastModifiedDate)),
      );
    }
    this.initOrgColumns();
  }

  private initOrgColumns(): void {
    this.orgColumns.push(
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
        title: (e: OrganizationModel) => `${e.name || ''}`,
        cell: (e: OrganizationModel) => `${e.name || ''}`,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'parentName',
        header: 'parentName',
        title: (e: OrganizationModel) => `${e.parentName || ''}`,
        cell: (e: OrganizationModel) => `${e.parentName || ''}`,
        className: 'mat-column-form',
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
    );

    this.orgButtons.push({
      columnDef: 'delete',
      color: 'primary',
      icon: 'fa fa-trash',
      iconType: IconTypeEnum.FONT_AWESOME,
      click: 'onRemoveOrg',
      className: 'primary content-cell-align-center',
      title: 'common.title.delete',
      display: (e: OrganizationModel) => this.displayPermissionCheck(),
      header: 'common.table.action.title',
      alignHeader: AlignEnum.CENTER,
    });
  }

  private displayPermissionCheck(): boolean {
    return !this.isView && (this.hasAddPermission || this.hasEditPermission);
  }

  onUpdateStatus(status: 'approve' | 'reject') {
    const apiCall = this.apiService.post(`${environment.PATH_API_V1}/mdm/accounting-account/${this.id}/${status}`, '');
    this.utilsService.execute(
      apiCall,
      this.onSuccessFunc,
      `common.${status}.success`,
      'common.title.confirm',
      [`${this.configForm?.moduleName}.`],
      `common.confirm.${status}`,
      undefined,
      undefined,
      'common.button.confirm', // Nút Xác nhận
      'common.button.back' // Nút Quay lại
    );
  }

  onRedirect(item: any) {
    this.router.navigate([`/mdm/accounting-account/edit`, item]).then();
  }

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '');
  }

  get hasEditPermission() {
    return this.permissionCheckingUtil.hasViewEditPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '');
  }

  get hasApprovePermission() {
    return this.permissionCheckingUtil.hasViewApprovePermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '');
  }

  get hasRejectPermission() {
    return this.permissionCheckingUtil.hasViewRejectPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '');
  }

  onSubmit() {
    const formData = new FormData();
    const payload = new AccountingAccountModel(this.addEditForm);
    formData.append('body', this.utilsService.toBlobJon(payload));

    const apiCall = this.isEdit
      ? this.apiService.put(`${environment.PATH_API_V1}/mdm/accounting-account/${this.id}`, formData)
      : this.apiService.post(`${environment.PATH_API_V1}/mdm/accounting-account`, formData);

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
      'common.button.confirm', // Nút Xác nhận
      'common.button.back' // Nút Quay lại
    );
  }

  onRowButtonClick(event: ButtonClickEvent) {
    switch (event.action) {
      case 'onRemoveOrg':
        this.onRemoveOrg(event?.index);
        break;
    }
  }

  onRemoveOrg(index: number | null | undefined) {
    const organizations = this.addEditForm.get('organizations')?.value;
    organizations.splice(index, 1);
    this.addEditForm.get('organizations')?.setValue(organizations);
  }

  onAddOrg() {
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
        console.log(organizations);
        if (organizations) {
          this.addEditForm.get('organizations')?.patchValue(organizations);
        }
      });
  }
}
