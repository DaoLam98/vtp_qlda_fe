import { Location } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { Config } from 'src/app/common/models/config.model';
import { SelectValuesService } from 'src/app/core/services/selectValues.service';
import { DEFAULT_REGEX, VIETNAMESE_REGEX } from 'src/app/shared/constants/regex.constants';
import { PermissionCheckingUtil } from 'src/app/shared/utils/permission-checking.util';
import { environment } from 'src/environments/environment';
import { ConsolidatedAccountModel, ConsolidatedAccountNetoffModel } from '../../_models/consolidated-account.model';
import { FORM_CONFIG } from '../consolidated-account-search/consolidated-account-search.config';

@Component({
  selector: 'app-consolidated-account-add-edit-detail',
  templateUrl: './consolidated-account-add-edit-detail.component.html',
  styleUrls: ['./consolidated-account-add-edit-detail.component.scss'],
  standalone: false,
})
export class ConsolidatedAccountAddEditDetailComponent extends BaseAddEditComponent implements OnInit {
  moduleName: string = 'mdm.consolidated-account';
  configForm: Config;
  model!: ConsolidatedAccountModel;
  isView: boolean = false;
  checkIsActive!: boolean;
  netoffAccountsColumns: ColumnModel[] = [];
  netoffAccountsButtons: ButtonModel[] = [];
  accountingAccountValues: SelectModel[] = [];
  organizationValues: SelectModel[] = [];
  protected readonly environment = environment;

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
      code: ['', [Validators.maxLength(255), Validators.pattern(DEFAULT_REGEX)]],
      name: ['', [Validators.maxLength(255), Validators.pattern(VIETNAMESE_REGEX)]],
      description: ['', [Validators.pattern(VIETNAMESE_REGEX)]],
      netoffAccounts: [[]],
      status: [],
      createdDate: [],
      createdBy: [],
      lastModifiedDate: [],
      lastModifiedBy: [],
    });

    this.netoffAccountsColumns.push(
      {
        columnDef: 'stt',
        header: 'stt',
        title: (e: ConsolidatedAccountNetoffModel) => {
          const values = this.addEditForm.get('netoffAccounts')?.value as ConsolidatedAccountNetoffModel[];
          const index = values.indexOf(e) + 1;
          return index.toString();
        },
        cell: (e: ConsolidatedAccountNetoffModel) => {
          const values = this.addEditForm.get('netoffAccounts')?.value as ConsolidatedAccountNetoffModel[];
          const index = values.indexOf(e) + 1;
          return index.toString();
        },
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'accountingAccountId',
        header: 'accountingAccountId',
        title: (e: ConsolidatedAccountNetoffModel) =>
          `${this.accountingAccountValues.find((item) => item.value == e.accountingAccountId)?.displayValue}`,
        cell: (e: ConsolidatedAccountNetoffModel) =>
          `${this.accountingAccountValues.find((item) => item.value == e.accountingAccountId)?.displayValue}`,
        columnType: (e: ConsolidatedAccountNetoffModel) =>
          this.isView || !e?.isCreated ? ColumnTypeEnum.VIEW : ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE,
        optionValues: (e: ConsolidatedAccountNetoffModel) => e.accountingAccountValues,
        disabled: (e: ConsolidatedAccountNetoffModel) => this.isView || !e?.isCreated,
        isRequired: !this.isView,
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'organizationId',
        header: 'organizationId',
        title: (e: ConsolidatedAccountNetoffModel) =>
          `${this.organizationValues.find((item) => item.value == e.organizationId)?.displayValue}`,
        cell: (e: ConsolidatedAccountNetoffModel) =>
          `${this.organizationValues.find((item) => item.value == e.organizationId)?.displayValue}`,
        columnType: (e: ConsolidatedAccountNetoffModel) =>
          this.isView || !e?.isCreated ? ColumnTypeEnum.VIEW : ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE,
        optionValues: (e: ConsolidatedAccountNetoffModel) => e.organizationValues,
        isRequired: !this.isView,
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'netoffAccountingAccountId',
        header: 'netoffAccountingAccountId',
        title: (e: ConsolidatedAccountNetoffModel) =>
          `${this.accountingAccountValues.find((item) => item.value == e.netoffAccountingAccountId)?.displayValue}`,
        cell: (e: ConsolidatedAccountNetoffModel) =>
          `${this.accountingAccountValues.find((item) => item.value == e.netoffAccountingAccountId)?.displayValue}`,
        columnType: (e: ConsolidatedAccountNetoffModel) =>
          this.isView || !e?.isCreated ? ColumnTypeEnum.VIEW : ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE,
        optionValues: (e: ConsolidatedAccountNetoffModel) => e.netoffAccountingAccountValues,
        isRequired: !this.isView,
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'netoffOrganizationId',
        header: 'netoffOrganizationId',
        title: (e: ConsolidatedAccountNetoffModel) =>
          `${this.organizationValues.find((item) => item.value == e.netoffOrganizationId)?.displayValue}`,
        cell: (e: ConsolidatedAccountNetoffModel) =>
          `${this.organizationValues.find((item) => item.value == e.netoffOrganizationId)?.displayValue}`,
        columnType: (e: ConsolidatedAccountNetoffModel) =>
          this.isView || !e?.isCreated ? ColumnTypeEnum.VIEW : ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE,
        optionValues: (e: ConsolidatedAccountNetoffModel) => e.netoffOrganizationValues,
        isRequired: !this.isView,
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'status',
        header: 'status',
        title: (e: ConsolidatedAccountNetoffModel) =>
          `${
            e.accountingAccountStatus == 'REJECTED' || e.netoffAccountingAccountStatus == 'REJECTED'
              ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, 'REJECTED')
              : this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status)
          }`,
        cell: (e: ConsolidatedAccountNetoffModel) =>
          `${
            e.accountingAccountStatus == 'REJECTED' || e.netoffAccountingAccountStatus == 'REJECTED'
              ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, 'REJECTED')
              : this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status)
          }`,
        align: AlignEnum.CENTER,
      },
    );

    this.netoffAccountsButtons.push(
      {
        columnDef: 'accept',
        color: 'primary',
        icon: 'fa fa-check',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'approve',
        className: 'primary content-cell-align-center',
        title: 'common.title.accept',
        display: (e: ConsolidatedAccountNetoffModel) => this.hasNetoffApprovePermission,
        disabled: (e: ConsolidatedAccountNetoffModel) =>
          e.status === 'APPROVED' ||
          e.accountingAccountStatus === 'REJECTED' ||
          e.netoffAccountingAccountStatus === 'REJECTED' ||
          !!e.isCreated,
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
        display: (e: ConsolidatedAccountNetoffModel) => this.hasNetoffRejectPermission,
        disabled: (e: ConsolidatedAccountNetoffModel) =>
          e.status === 'REJECTED' ||
          e.accountingAccountStatus === 'REJECTED' ||
          e.netoffAccountingAccountStatus === 'REJECTED' ||
          !!e.isCreated,
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'detail',
        color: 'primary',
        icon: 'fa fa-trash',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'onDeleteValue',
        className: 'primary content-cell-align-center',
        title: 'common.title.delete',
        display: (e: ConsolidatedAccountNetoffModel) => !this.isView,
        disabled: (e: ConsolidatedAccountNetoffModel) => !e.isCreated,
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
    );
  }

  async ngOnInit() {
    super.ngOnInit();

    [this.accountingAccountValues, this.organizationValues] = await Promise.all([
      lastValueFrom(
        this.selectValuesService.getAutocompleteValuesFromModulePath(
          `${environment.PATH_API_V1}/mdm/accounting-account`,
          [
            { key: 'sortBy', value: 'accountNumber,name' },
            { key: 'sortDirection', value: 'asc,asc' },
          ],
          { code: 'name', name: 'accountNumber', value: 'id' },
          'id,name,accountNumber,status',
          true,
          undefined,
          true,
        ),
      ),
      lastValueFrom(
        this.selectValuesService.getAutocompleteValuesFromModulePath(
          `${environment.PATH_API_V1}/mdm/organization`,
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
      await this.onGetDetail();
    }
  }

  async onGetDetail() {
    this.model = await firstValueFrom(
      this.apiService.get<ConsolidatedAccountModel>(
        `${environment.PATH_API_V1}/mdm/consolidated-account/` + this.id,
        new HttpParams(),
      ),
    );
    this.checkIsActive = this.model?.status === 'APPROVED';
    this.model.netoffAccounts = this.model.netoffAccounts.map((item) => ({
      ...item,
      accountingAccountValues: this.accountingAccountValues.filter(
        (i) => item.accountingAccountId === i.value || this.itemIsApproved(i),
      ),
      organizationValues: this.organizationValues.filter(
        (i) => item.organizationId === i.value || this.itemIsApproved(i),
      ),
      netoffAccountingAccountValues: this.accountingAccountValues.filter(
        (i) => item.netoffAccountingAccountId === i.value || this.itemIsApproved(i),
      ),
      netoffOrganizationValues: this.organizationValues.filter(
        (i) => item.netoffOrganizationId === i.value || this.itemIsApproved(i),
      ),
    }));
    this.addEditForm.patchValue(this.model);

    if (this.isView) {
      this.addEditForm
        .get('status')
        ?.setValue(
          this.translateService.instant(
            this.utilsService.getEnumValueTranslated(BaseStatusEnum, this.model?.status || ''),
          ),
        );
    }
  }

  onUpdateStatus(status: 'approve' | 'reject') {
    const apiCall = this.apiService.post(
      `${environment.PATH_API_V1}/mdm/consolidated-account/${this.id}/${status}`,
      '',
    );
    this.utilsService.execute(
      apiCall,
      this.onSuccessFunc,
      `common.${status}.success`,
      'common.title.confirm',
      undefined,
      `common.confirm.${status}`,
      undefined,
      undefined,
      'common.button.confirm',
      'common.button.back',
    );
  }

  onRedirect(item: ConsolidatedAccountModel) {
    this.router.navigate([`/mdm/consolidated-account/edit`, item.id]).then();
  }

  onUpdateNetoffStatus(index: number, status: 'approve' | 'reject') {
    const values = this.addEditForm.get('netoffAccounts')?.value as ConsolidatedAccountNetoffModel[];
    const apiCall = this.apiService.post(
      `${environment.PATH_API_V1}/mdm/consolidated-account-netoff-account/${values[index].id}/${status}`,
      '',
    );
    this.utilsService.execute(
      apiCall,
      (data, message) => {
        this.utilsService.onSuccessFunc(message);
        this.onGetDetail();
      },
      `common.${status}.success`,
      'common.title.confirm',
      undefined,
      `common.confirm.${status}`,
      undefined,
      undefined,
      'common.button.confirm',
      'common.button.back',
    );
  }

  onAddValue() {
    const values = this.addEditForm.get('netoffAccounts')?.value as ConsolidatedAccountNetoffModel[];
    this.addEditForm.get('netoffAccounts')?.patchValue([
      ...values,
      {
        accountingAccountId: null,
        organizationId: null,
        netoffAccountingAccountId: null,
        netoffOrganizationId: null,
        status: 'APPROVED',
        isCreated: true,
        accountingAccountValues: this.accountingAccountValues.filter((i) => this.itemIsApproved(i)),
        organizationValues: this.organizationValues.filter((i) => this.itemIsApproved(i)),
        netoffAccountingAccountValues: this.accountingAccountValues.filter((i) => this.itemIsApproved(i)),
        netoffOrganizationValues: this.organizationValues.filter((i) => this.itemIsApproved(i)),
      },
    ]);
  }

  onTableAction(event: ButtonClickEvent) {
    switch (event.action) {
      case 'onDeleteValue':
        this.onDeleteValue(event.index!);
        break;
      case 'approve':
        this.onUpdateNetoffStatus(event.index!, 'approve');
        break;
      case 'reject':
        this.onUpdateNetoffStatus(event.index!, 'reject');
        break;
    }
  }

  onDeleteValue(index: number) {
    const values = this.addEditForm.get('netoffAccounts')?.value as ConsolidatedAccountNetoffModel[];
    values.splice(index, 1);
    this.addEditForm.get('netoffAccounts')?.setValue(values);
  }

  onSubmit() {
    const formData = new FormData();
    const payload = new ConsolidatedAccountModel(this.addEditForm);
    formData.append('body', this.utilsService.toBlobJon(payload));

    const apiCall = this.isEdit
      ? this.apiService.put(`${environment.PATH_API_V1}/mdm/consolidated-account/${this.id}`, formData)
      : this.apiService.post(`${environment.PATH_API_V1}/mdm/consolidated-account`, formData);

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

  itemIsApproved(item: SelectModel): boolean {
    return item.rawData.status === 'APPROVED';
  }

  get hasNetoffApprovePermission() {
    return this.permissionCheckingUtil.hasViewApprovePermission(
      this.configForm?.moduleName ?? '',
      'consolidated-account-netoff-account',
    );
  }

  get hasNetoffRejectPermission() {
    return this.permissionCheckingUtil.hasViewRejectPermission(
      this.configForm?.moduleName ?? '',
      'consolidated-account-netoff-account',
    );
  }
}
