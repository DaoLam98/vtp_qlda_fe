import { ChangeDetectorRef, Component, NgZone, OnInit, ViewEncapsulation } from '@angular/core';
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
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { ActionTypeEnum } from 'src/app/shared';
import { HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { VIETNAMESE_REGEX } from 'src/app/shared/constants/regex.constants';
import { debounceTime, firstValueFrom, lastValueFrom, map, Observable, of } from 'rxjs';
import { SelectValuesService } from 'src/app/core/services/selectValues.service';
import { PermissionCheckingUtil } from 'src/app/shared/utils/permission-checking.util';
import { Config } from 'src/app/common/models/config.model';
import { FORM_CONFIG } from 'src/app/modules/mdm/target/target-search/target-search.config';
import { TargetModel } from 'src/app/modules/mdm/_models/target.model';
import {
  PopupChooseOrganizationComponent,
} from 'src/app/shared/components/organization/organization-popup-choosen/organization-popup-choosen.component';
import { OrganizationModel } from 'src/app/modules/mdm/_models/organization.model';
import { MatDialog } from '@angular/material/dialog';
import {
  PopupChooseAccountComponent,
} from 'src/app/shared/components/account/account-popup-choosen/account-popup-chosen.component';
import { AccountModel } from 'src/app/modules/mdm/_models/account.model';
import { convertData, RuleOptions, RulesetCal, RulesetIf } from 'src/app/modules/mdm/target/formly-calculate/ultis';
import { TargetService } from 'src/app/core/services/target.service';
import { PopupAddColorComponent } from 'src/app/modules/mdm/target/popup-add-color/popup-add-color.component';
import { Utils } from 'src/app/shared/utils/utils';

@Component({
  selector: 'app-target-add-edit-detail',
  standalone: false,
  templateUrl: './target-add-edit-detail.component.html',
  styleUrl: 'target-add-edit-detail.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class TargetAddEditDetailComponent extends BaseAddEditComponent implements OnInit {

  moduleName = 'mdm.target';
  configForm: Config;
  model!: TargetModel;
  isView = false;

  statusValues$: Observable<SelectModel[]>;

  checkIsActive!: boolean;

  orgColumns: ColumnModel[] = [];
  orgButtons: ButtonModel[] = [];
  accColumns: ColumnModel[] = [];
  accButtons: ButtonModel[] = [];
  warningColumns: ColumnModel[] = [];
  warningButtons: ButtonModel[] = [];

  defaultOption: SelectModel = {
    value: -1,
    disabled: false,
    displayValue: this.translateService.instant('common.combobox.option.default'),
    rawData: -1,
  };

  protected readonly environment = environment;
  targetGroupValues: SelectModel[] = [];
  parentValues: SelectModel[] = [];
  unitValues: SelectModel[] = [];
  currencyValues: SelectModel[] = [];
  assetGroupValues: SelectModel[] = [];
  assetGroupApprovedValues: SelectModel[] = [];

  dataTypeValues: SelectModel[] = [
    {
      displayValue: 'String',
      value: 'STRING',
      rawData: 'STRING',
      disabled: false,
    },
    {
      displayValue: 'Number',
      value: 'NUMBER',
      rawData: 'NUMBER',
      disabled: false,
    },
  ];

  formCalculate = new FormGroup({});
  modelCalculate: RulesetCal | RulesetIf | any = {
    typeExpression: 'exp',
    condition: '|',
    rules: [],
  }
  ruleRef: any;
  valueConvert: any = ''
  ruleCalculate: RuleOptions = {
    fields: []
  }
  referenceTableOptions: SelectModel[] = [];
  referenceTableMap: Map<string, string> = new Map();

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
    protected cdr: ChangeDetectorRef,
    protected targetService: TargetService,
    private ngZone: NgZone
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);

    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.addEditForm = this.fb.group({
      parentId: ['', [Validators.required]],
      name: ['', [Validators.maxLength(255), Validators.pattern(VIETNAMESE_REGEX)]],
      description: ['', [Validators.maxLength(255)]],
      targetGroupName: [],
      dataType: [''],
      code: [],
      targetGroupId: [''],
      currencyId: ['', [Validators.required]],
      unitOfMeasureId: ['', [Validators.required]],
      isCumulative: [false],
      status: [],
      createdDate: [],
      createdBy: [],
      lastModifiedDate: [],
      lastModifiedBy: [],
      organizations: [],
      accountingAccounts: [],
      warningConfigs: [],
    },{
      validators: [this.oneOfTwoRequiredValidator()],
      updateOn: 'change'
    });

    ['unitOfMeasureId', 'currencyId'].forEach(name => {
      this.addEditForm.get(name)?.valueChanges.subscribe(() => {
        this.addEditForm.updateValueAndValidity({ emitEvent: false });
      });
    });

    this.statusValues$ = of(this.selectService.statusValues);
    this.isView = this.activatedRoute.routeConfig?.data?.actionType === ActionTypeEnum._VIEW;
    this.callAPIGetTableList()
  }

  callAPIGetTableList() {
    const headers = new HttpParams();
    this.apiService
      .get<[{ tableName: string, value: string }]>(`${environment.PATH_API_V1}/mdm/attribute/tables`, headers)
      .pipe(
        map((res: [{ tableName: string, value: string }]) => {
          const options = res.map(tableName => {
            this.referenceTableMap.set(tableName.tableName, tableName.value);
            return new SelectModel(tableName.tableName, tableName.value, false, tableName);
          });
          return options;
        }))
      .subscribe((options: SelectModel[]) => {
          this.referenceTableOptions = options;
        }
      );

  }

  async ngOnInit() {
    this.ruleRef = await lastValueFrom(
      this.selectService.getAutocompleteValuesFromModulePath(
        `${environment.PATH_API_V1}/mdm/attribute`,
        undefined,
        undefined,
        'id,datatype,name,referenceTable,length,require,allowNegative,status',
        false,
        undefined,
        true
      ),
    );
    this.ruleRef = this.ruleRef.filter((item: any) =>
      (item.rawData?.datatype === 'REFERENCE' || item.rawData?.datatype == 'NUMBER'|| item.rawData?.datatype == 'STRING'))
    this.ruleRef = await Promise.all(
      this.ruleRef.map(async (item: any) => {
        const refs = this.referenceTableOptions.filter(
          (ref: any) => ref.value === item.rawData?.referenceTable
        );

        const options = await Promise.all(
          refs.map(async (data: any) => {
            const option = await lastValueFrom(
              this.selectService.getAutocompleteValuesFromModulePath(
                `${environment.PATH_API_V1}/mdm/${data.value?.replace(/_/g, '-')}`,
                undefined,
                undefined,
                undefined,
                true,
                undefined,
                true
              ),
            );
            return option;
          })
        );
        return {
          ...item,
          options: options.flat(),
        };
      })
    );
    const refFieldsSelect = this.ruleRef
      .filter((item: any) => item.rawData?.datatype === 'REFERENCE')
      .map((item: any) => ({
        value: item.value,
        label: item.displayValue,
        valueField: {
          type: 'select',
          description: item.rawData?.status,
          templateOptions: {
            options: item.options.map((opt: any) => {
              return{
                value: opt.value.toString(),
                label: opt.displayValue,
                status: opt.rawData?.status,
              }
            }),
            disabled: this.isView,
            required: true,
            placeholder: this.translateService.instant('common.selectValue'),
          },
          className: this.isView,
        },
      }));
    const refFieldsNumber = this.ruleRef
      .filter((item: any) => item.rawData?.datatype === 'NUMBER')
      .map((item: any) => ({
        key: item.value,
        label: item.displayValue,
        value: item.value,
        type: 'input',
        fieldGroupClassName: 'NUMBER',
        templateOptions: {
          type: 'text',
          disabled: this.isView,
          required: true,
          maxLength: item.rawData?.length,
          label: item.rawData?.name,
          description: item.rawData?.status,
        },
        valueField: {
          description: item.rawData?.status,
        }
      }));

    const refFieldsString = this.ruleRef
      .filter((item: any) => item.rawData?.datatype === 'STRING')
      .map((item: any) => ({
        key: item.value, // bắt buộc
        type: 'input',
        label: item.displayValue,
        value: item.value,
        fieldGroupClassName: 'STRING',
        templateOptions: {
          type: 'text',
          disabled: this.isView,
          required: true,
          maxLength: item.rawData?.length,
          label: item.rawData?.name,
          description: item.rawData?.status,
        },
        valueField: {
          description: item.rawData?.status,
        }
      }));
    this.ruleCalculate.fields.push(...refFieldsSelect, ...refFieldsNumber, ...refFieldsString)
    this.targetService.selectOption.next(this.ruleCalculate.fields);
    super.ngOnInit();
    this.parentValues = await lastValueFrom(
      this.selectService.getAutocompleteValuesFromModulePath(
        `${environment.PATH_API_V1}/mdm/target`,
        undefined,
        undefined,
        undefined,
        false,
        undefined,
        true
      ),
    );

    this.unitValues = await lastValueFrom(
      this.selectService.getAutocompleteValuesFromModulePath(
        `${environment.PATH_API_V1}/mdm/unit-of-measure`,
        undefined,
        undefined,
        undefined,
        false,
        undefined,
        true
      ),
    );
    // this.unitValues = [this.defaultOption, ...this.unitValues]

    this.currencyValues = await lastValueFrom(
      this.selectService.getAutocompleteValuesFromModulePath(
        `${environment.PATH_API_V1}/mdm/currency`,
        undefined,
        undefined,
        undefined,
        false,
        undefined,
        true
      ),
    );
    // this.currencyValues = [this.defaultOption, ...this.currencyValues]

    this.targetGroupValues = await lastValueFrom(
      this.selectService.getAutocompleteValuesFromModulePath(
        `${environment.PATH_API_V1}/mdm/target-group`,
        undefined,
        undefined,
        undefined,
        true,
        undefined,
        true
      ),
    );
    if(!this.isEdit) {
      this.filterOption()
    }

    this.assetGroupValues = await lastValueFrom(
      this.selectService.getAutocompleteValuesFromModulePath(
        `${environment.PATH_API_V1}/mdm/asset-group`,
        undefined,
        undefined,
        undefined,
        true,
        undefined,
        true,
      ),
    );
    this.assetGroupApprovedValues = this.assetGroupValues.filter((ass)=> ass.rawData?.status === 'APPROVED')

    if (this.isEdit) {
      this.model = await firstValueFrom(
        this.apiService.get<TargetModel>(`${environment.PATH_API_V1}/mdm/target/` + this.id, new HttpParams()),
      );
      this.funcEdit()
    }

    if (this.isView) {
      this.addEditForm.get('isCumulative')?.disable();
      this.addEditForm.get('status')?.setValue(this.translateService.instant(this.utilsService.getEnumValueTranslated(BaseStatusEnum, this.model?.status || '')));
      this.addEditForm.get('createdDate')?.setValue(this.dateUtilService.convertDateToDisplayGMT0(String(this.model?.createdDate)));
      this.addEditForm.get('lastModifiedDate')?.setValue(this.dateUtilService.convertDateToDisplayGMT0(String(this.model?.lastModifiedDate)));
      const dataFinal = this.removeDeletedRules(this.modelCalculate)
      this.valueConvert = convertData(dataFinal, {}, this.targetService.selectOption.value);
    }

    this.initOrgColumns();
    this.initAccColumns();
    this.initWarningColumns();
    this.formCalculate.valueChanges.pipe(debounceTime(100)).subscribe(res => {
      const dataFinal = this.removeDeletedRules(this.modelCalculate)
      this.valueConvert = convertData(dataFinal, {}, this.targetService.selectOption.value);
      if(this.valueConvert) {
        this.valueConvert = this.replaceValuesWithDisplay(this.valueConvert)
      }
    })
    this.addEditForm.valueChanges.subscribe(res=>{
      this.oneOfTwoRequiredValidator()
    })
  }

  filterOption() {
    this.parentValues = this.parentValues.filter((item: any) => item.rawData?.status === 'APPROVED' || item.value === -1);
    this.targetGroupValues = this.targetGroupValues.filter((item: any) => item.rawData?.status === 'APPROVED');
    this.unitValues = this.unitValues.filter((item: any) => item.rawData?.status === 'APPROVED' || item.value === -1);
    this.currencyValues = this.currencyValues.filter((item: any) => item.rawData?.status === 'APPROVED' || item.value === -1);
  }

  filterOptionEdit() {
    this.targetGroupValues = this.targetGroupValues.filter((item: any) => item.rawData.status === 'APPROVED' || (item.value === this.model?.targetGroupId));
    this.unitValues = this.unitValues.filter((item: any) => item.rawData.status === 'APPROVED' || (item.value === this.model?.unitOfMeasureId) || item.value === -1);
    this.currencyValues = this.currencyValues.filter((item: any) => item.rawData.status === 'APPROVED' || (item.value === this.model?.currencyId) || item.value === -1);
    this.parentValues = this.parentValues.map(i => ({
      ...i,
      disabled: this.model?.id === i.value || i.disabled,
    })).filter((item: any) => item.rawData.status === 'APPROVED' || (item.value === this.model?.parentId) || item.value === -1);
  }

  funcEdit() {
    this.checkIsActive = this.model?.status === 'APPROVED';
    this.addEditForm.setValue(
      UtilsService.reduceEntityAttributeForFormControl(this.addEditForm, {
        ...this.model,
        parentId: Number(this.model?.parentId),
      }),
    );
    this.model.organizations = this.model.organizations.map((item) => ({
      ...item,
      assetGrOrg: this.assetGroupValues.filter(
        (i) => this.itemIsApproved(i) || item.assetGroups.find((it: any) => it.assetGroupId === i.value),
      ),
    }));
    console.log(this.model);
    const orgValue = this.model?.organizations.map(org => ({
      ...org,
      assetGr: org.assetGroups.map((ag: any) => ag.assetGroupId)
    }));
    const accValue = this.model?.accountingAccounts.map(acc => {
      const relOrgs = (acc as any).organizations || [];
      const masterOrgs = (acc as any).accountingAccountOrganizations || [];

      const organizations = relOrgs.map((o: any) => ({
        organizationId: o.organizationId ?? o.id,
        organizationName: o.organizationName ?? o.name,
        organizationCode: o.organizationCode ?? o.code,
      }));

      const organizationsValue: SelectModel[] = masterOrgs.map((o: any) => new SelectModel(
        o.organizationId ?? o.id,
        o.organizationName ?? o.name,
        false,
        {
          code: o.organizationCode ?? o.code,
          organizationId: o.organizationId ?? o.id,
          organizationName: o.organizationName ?? o.name,
          organizationCode: o.organizationCode ?? o.code,
        }
      ));

      // Selected values từ organizations đã map
      const orgGr = organizations.map((o: any) => o.organizationId);
      return {
        ...acc,
        organizationsValue,
        orgGr,
        organizations,
      };
    });
    this.addEditForm.get('organizations')?.setValue(orgValue)
    this.addEditForm.get('accountingAccounts')?.setValue(accValue)
    this.addEditForm.get('isCumulative')?.setValue(this.model?.isCumulative)
    // check value model
    this.filterOptionEdit()

    if(!this.model?.expressionTree) return
    this.modelCalculate = JSON.parse(this.model?.expressionTree)
    setTimeout(() => {
      this.modelCalculate = JSON.parse(this.model?.expressionTree)
    });
    setTimeout(() => {
      this.modelCalculate = JSON.parse(this.model?.expressionTree)
      console.log(this.modelCalculate);
    });
    this.addEditForm.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    this.addEditForm.markAllAsTouched();
    this.cdr.detectChanges();
  }

  collectAllFields(rules: any[]): any[] {
    if (!Array.isArray(rules)) return [];
    let fields: any[] = [];
    for (const r of rules) {
      if (r.field != null) fields.push(r.field);
      if (Array.isArray(r.rules)) {
        fields = fields.concat(this.collectAllFields(r.rules));
      }
    }
    return fields;
  }

  itemIsApproved(item: SelectModel): boolean {
    return item.rawData.status === 'APPROVED';
  }

  oneOfTwoRequiredValidator() {
    return (group: AbstractControl): ValidationErrors | null => {
      if (!(group instanceof FormGroup)) return null;

      const unit = group.get('unitOfMeasureId')?.value;
      const currency = group.get('currencyId')?.value;
      const dataType = group.get('dataType')?.value;

      if (dataType === 'STRING') {
        this.resetControlsForStringType(group, this.addEditForm);
        return null;
      }

      if (this.isInvalid(unit, currency)) {
        this.setErrorForInvalid(group);
        return { oneRequired: true };
      } else {
        this.clearOneRequiredError(group);
        this.cleanControlsAfterValidation(group, this.addEditForm, unit, currency);
        return null;
      }
    };
  }

// ---------- helpers ----------

  resetControlsForStringType(group: FormGroup, form: FormGroup) {
    ['unitOfMeasureId', 'currencyId'].forEach(key => group.get(key)?.setErrors(null));
    if (group.get('unitOfMeasureId')?.value) form.get('unitOfMeasureId')?.setValue('');
    if (group.get('currencyId')?.value) form.get('currencyId')?.setValue('');
  }

  isInvalid(unit: any, currency: any) {
    return (!unit || unit === -1) && (!currency || currency === -1);
  }

  setErrorForInvalid(group: FormGroup) {
    ['unitOfMeasureId', 'currencyId'].forEach(key => group.get(key)?.setErrors({ oneRequired: true }));
  }

  clearOneRequiredError(group: FormGroup) {
    ['unitOfMeasureId', 'currencyId'].forEach(key => {
      const control = group.get(key);
      if (control?.hasError('oneRequired')) {
        const errors = { ...control.errors };
        delete errors['oneRequired'];
        control.setErrors(Object.keys(errors).length ? errors : null);
      }
    });
  }

  cleanControlsAfterValidation(group: FormGroup, form: FormGroup, unit: any, currency: any) {
    ['unitOfMeasureId', 'currencyId'].forEach(key => group.get(key)?.setErrors(null));
    if (unit === -1) form.get('unitOfMeasureId')?.setValue('');
    if (currency === -1) form.get('currencyId')?.setValue('');
  }

  removeDeletedRules(obj: any): any {
    if (!obj) return obj;
    if (Array.isArray(obj)) {
      const cleaned = obj
        .filter((r) => !r.isDelete)
        .map((r) => this.removeDeletedRules(r));
      return cleaned;
    }
    const newObj: any = { ...obj };
    if (Array.isArray(newObj.rules)) {
      newObj.rules = this.removeDeletedRules(newObj.rules);
    }
    return newObj;
  }

  replaceValuesWithDisplay(expression: string): string {
    if (!expression) return '';

    let result = expression;

    for (const attr of this.referenceTableOptions) {
      const regex = new RegExp(`\\b${attr.value}\\b`, 'g');
      const equal = '=='
      result = result.replace(regex, this.translateService.instant(attr.displayValue));
      result = result.replace(equal, '=');
    }

    return result;
  }

  private initOrgColumns(): void {
    this.orgColumns.push(
      {
        columnDef: 'stt',
        header: 'stt',
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
        title: (e: OrganizationModel) => `${e.organizationCode + ' - ' + e.organizationName || ''}`,
        cell: (e: OrganizationModel) => `${e.organizationCode + ' - ' + e.organizationName || ''}`,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'assetGr',
        header: 'assetGroup',
        title: (e: OrganizationModel) => ``,
        cell: (e: OrganizationModel) => ``,
        className: 'mat-column-airline',
        columnType: ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE,
        isMultipleSelect: true,
        disabled: (e: any) => this.isView,
        optionValues: (e: any) => e.assetGrOrg || this.assetGroupApprovedValues,
        onCellValueChange: (e: any) => {
          const result = this.assetGroupValues.filter(item => e.assetGr.includes(item.value)).map(asset => {
            return {
              targetOrganizationId: asset.rawData.targetOrganizationId ?? null,
              assetGroupId: asset.value,
              assetGroupName: asset.displayValue,
              assetGroupCode: asset.rawData.code,
            }
          })
          e.assetGroups = result
        },
        alignHeader: AlignEnum.CENTER,
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

  private initAccColumns(): void {
    this.accColumns.push(
      {
        columnDef: 'stt',
        header: 'stt',
        className: 'mat-column-stt',
        title: (e: AccountModel) => {
          const values = this.addEditForm.get('accountingAccounts')?.value as AccountModel[];
          const index = values.indexOf(e) + 1;
          return index.toString();
        },
        cell: (e: AccountModel) => {
          const values = this.addEditForm.get('accountingAccounts')?.value as AccountModel[];
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
        title: (e: AccountModel) => `${e.accountingAccountAccountNumber + ' - ' + e.accountingAccountName || ''}`,
        cell: (e: AccountModel) => `${e.accountingAccountAccountNumber + ' - ' + e.accountingAccountName || ''}`,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'orgGr',
        header: 'organization',
        title: (e: AccountModel) => ``,
        cell: (e: AccountModel) => ``,
        className: 'mat-column-airline',
        columnType: ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE,
        isMultipleSelect: true,
        alignHeader: AlignEnum.CENTER,
        disabled: (e: any) => this.isView,
        optionValues: (e: any) => e.organizationsValue ?? [],
        onCellValueChange: (e: any) => {
          const result = e.organizationsValue.filter((item: SelectModel) => e.orgGr.includes(item.value)).map((org: SelectModel) => {
            return {
              targetAccountingAccountId: org.rawData.targetAccountingAccountId ?? null,
              organizationId: org.value,
              organizationName: org.displayValue,
              organizationCode: org.rawData.code,
            }
          })
          e.organizations = result
        },
      },
    );

    this.accButtons.push({
      columnDef: 'delete',
      color: 'primary',
      icon: 'fa fa-trash',
      iconType: IconTypeEnum.FONT_AWESOME,
      click: 'onRemoveAccount',
      className: 'primary content-cell-align-center',
      title: 'common.title.delete',
      display: (e: AccountModel) => this.displayPermissionCheck(),
      header: 'common.table.action.title',
      alignHeader: AlignEnum.CENTER,
    });
  }

  private displayPermissionCheck(): boolean {
    return !this.isView && (this.hasAddPermission || this.hasEditPermission);
  }

  onUpdateStatus(status: 'approve' | 'reject') {
    const apiCall = this.apiService.post(`${environment.PATH_API_V1}/mdm/target/${this.id}/${status}`, '');
    this.utilsService.execute(
      apiCall,
      this.onSuccessFunc,
      `common.${status}.success`,
      'common.title.confirm',
      [`${this.configForm?.moduleName}.`],
      `common.confirm.${status}`,
      undefined,
      undefined,
      "common.button.confirm", // Nút Xác nhận
      "common.button.back" // Nút Quay lại
    );
  }

  onRedirect(item: any) {
    this.router.navigate([`/mdm/target/edit`, item]).then();
  }

  onSubmit() {
    if (this.addEditForm.controls.dataType.value === 'STRING') {
      if (!this.validateRuleset(this.modelCalculate)) {
        return;
      }
    }

    const formData = new FormData();
    const payload = this.buildPayload();

    formData.append('body', this.utilsService.toBlobJon(payload));

    const apiCall = this.isEdit
      ? this.apiService.put(`${environment.PATH_API_V1}/mdm/target/${this.id}`, formData)
      : this.apiService.post(`${environment.PATH_API_V1}/mdm/target`, formData);

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
      "common.button.confirm",
      "common.button.back"
    );
  }

  private buildPayload(): TargetModel {
    const payload = new TargetModel(this.addEditForm);

    payload.accountingAccounts = this.mapAccountingAccounts();
    payload.organizations = this.mapOrganizations();

    const dataFinal = this.removeDeletedRules(this.modelCalculate);
    payload.expressionSpel = JSON.stringify(dataFinal);
    payload.expressionTree = JSON.stringify(dataFinal);
    payload.expressionView = JSON.stringify(this.valueConvert);

    this.normalizeIds(payload);

    if (this.isEdit) {
      payload.id = this.id;
      payload.code = this.model?.code || null;
    }

    return payload;
  }

  private mapAccountingAccounts() {
    const account = this.addEditForm.get('accountingAccounts')?.value;
    return account?.map((a: AccountModel) => {
      const organizations = (a.organizations).map((org: any) => ({
        organizationId: org.organizationId ?? org.id,
        organizationName: org.organizationName ?? org.name,
        organizationCode: org.organizationCode ?? org.code
      }));

      return {
        accountingAccountId: a.accountingAccountId,
        accountingAccountName: a.name,
        accountingAccountAccountNumber: a.accountNumber,
        organizations
      };
    });
  }

  private mapOrganizations() {
    const orgValue = this.addEditForm.get('organizations')?.value;
    return orgValue?.map((org: OrganizationModel) => ({
      organizationId: org.organizationId,
      organizationName: org.organizationName,
      organizationCode: org.organizationCode,
      assetGroups: org.assetGroups,
    }));
  }

  private normalizeIds(payload: TargetModel): void {
    if (payload.unitOfMeasureId && payload.unitOfMeasureId == -1) {
      payload.unitOfMeasureId = null;
    }
    if (payload.currencyId && payload.currencyId == -1) {
      payload.currencyId = null;
    }
    if (payload.parentId && payload.parentId == -1) {
      payload.parentId = null;
    }
  }

  private validateRuleset(ruleset: any, path: string = 'root'): boolean {
    if (!ruleset || !Array.isArray(ruleset.rules)) {
      return true;
    }

    if (ruleset.rules.length === 0) {
      this.utilsService.showErrorToarst('errorMessageTarget');
      return false;
    }

    let isValid = true;
    let hasToast = false;

    ruleset.rules.forEach((rule: any, index: number) => {
      const currentPath = `${path}.rules[${index}]`;

      if (!this.validateIfThenElseRule(rule)) {
        isValid = false;
        return false;
      }

      if (!this.validateNestedRules(rule, currentPath, hasToast)) {
        isValid = false;
        hasToast = true;
      }
    });

    return isValid;
  }

  private validateIfThenElseRule(rule: any): boolean {
    if (!rule.ifValue && !rule.elseValue && !rule.thenValue) {
      return true;
    }

    const childRules = this.getValidChildRules(rule);
    const hasRequiredFunctions = this.hasAllRequiredFunctions(childRules);

    if (!hasRequiredFunctions) {
      this.utilsService.showErrorToarst('errorMessageTarget');
      return false;
    }

    return true;
  }

  private validateNestedRules(rule: any, currentPath: string, hasToast: boolean): boolean {
    if (!('rules' in rule)) {
      return true;
    }

    const validChildren = this.getValidChildRules(rule);

    if (validChildren.length === 0) {
      if (!hasToast) {
        this.utilsService.showErrorToarst('errorMessageTarget');
      }
      return false;
    }

    return this.validateRuleset(rule, currentPath);
  }

  private getValidChildRules(rule: any): any[] {
    return Array.isArray(rule.rules)
      ? rule.rules.filter((r: any) => !r.isDelete)
      : [];
  }

  private hasAllRequiredFunctions(childRules: any[]): boolean {
    const hasIf = childRules.some((r: any) => r.funcType === 'if');
    const hasThen = childRules.some((r: any) => r.funcType === 'then');
    const hasElse = childRules.some((r: any) => r.funcType === 'else');

    return hasIf && hasThen && hasElse;
  }



  onRowButtonClick(event: ButtonClickEvent) {
    switch (event.action) {
      case 'onRemoveOrg':
        this.onRemoveOrg(event?.index);
        break;
      case 'onRemoveAccount':
        this.onRemoveAccount(event?.index);
        break;
      case 'onRemoveWarning':
        this.onRemoveWarning(event?.index);
        break;
      case 'onEditWarning':
        this.onAddEditWarning(true, event);
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
          trackBy: "organizationId"
        },
      })
      .afterClosed()
      .subscribe((organizations: OrganizationModel[]) => {
        if (organizations) {
          const mapped = organizations.map(org => {
            const orgId = org.organizationId ?? org.id ?? null;
            const orgName = org.name ?? org.organizationName ?? null;
            const orgCode = org.code ?? org.organizationCode ?? null;
            return {
              ...org,
              organizationId: orgId,
              organizationName: orgName,
              organizationCode: orgCode,
              assetGroups: org.assetGroups ?? [],
              assetGr: org.assetGr ?? [],
            };
          });
          this.addEditForm.get('organizations')?.patchValue(mapped);
        }
      });
  }

  onAddAccount() {
    const dialogRef = this.matDialog.open(PopupChooseAccountComponent, {
      disableClose: false,
      width: '1500px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: {
        selected: this.addEditForm.get('accountingAccounts')?.value,
        trackBy: "accountingAccountId"
      },
    });
    dialogRef.componentInstance.title = 'target.table.header.chooseAccount';
    dialogRef
      .afterClosed()
      .subscribe((accounts: AccountModel[]) => {
        if (accounts && accounts.length > 0) {
          const mapped = accounts.map(a => {
            const org = a.accountingAccountOrganizations || a.organizations
            const organizationsValue = org?.map((org: any): SelectModel => {
              return new SelectModel(org.id || org.organizationId, org.name || org.organizationName, false, org)
            })
            return {
              ...a,
              accountingAccountId: a.accountingAccountId ?? null,
              accountingAccountName: a.name || a.accountingAccountName,
              accountingAccountAccountNumber: a.accountNumber || a.accountingAccountAccountNumber,
              organizationsValue: organizationsValue ?? null,
              orgGr: a.orgGr ?? [],
            }
          });
          this.addEditForm.get('accountingAccounts')?.patchValue(mapped);
        }
      });
  }

  // Bo qua nhung control co isDelete = true
  isFormCalculateValid(): boolean {
    if (!this.formCalculate || !this.modelCalculate) return true;
    return this.validateNode(this.formCalculate, this.modelCalculate);
  }

  private validateNode(form: AbstractControl, model: any): boolean {
    if (!form || !model) return true;
    if (model.isDelete) return true;

    for (const key of Object.keys((form as FormGroup).controls)) {
      const control = form.get(key);
      const value = model[key];

      if (!control) continue;

      if (!this.validateControlNode(control, value)) return false;
    }

    return true;
  }

  private validateControlNode(control: AbstractControl, value: any): boolean {
    if (control instanceof FormGroup) {
      return this.validateNode(control, value);
    } else if (control instanceof FormArray) {
      const arrValue = Array.isArray(value) ? value : [];
      for (let i = 0; i < control.length; i++) {
        const childForm = control.at(i);
        const childModel = arrValue[i];
        if (!this.validateNode(childForm, childModel)) return false;
      }
      return true;
    } else {
      return !(control.invalid && !(value && value.isDelete));
    }
  }


  private initWarningColumns(): void {
    this.warningColumns.push(
      {
        columnDef: 'stt',
        header: 'stt',
        className: 'mat-column-stt',
        title: (e: AccountModel) => {
          const values = this.addEditForm.get('warningConfigs')?.value as AccountModel[];
          const index = values.indexOf(e) + 1;
          return index.toString();
        },
        cell: (e: AccountModel) => {
          const values = this.addEditForm.get('warningConfigs')?.value as AccountModel[];
          const index = values.indexOf(e) + 1;
          return index.toString();
        },
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'fromValue',
        header: 'from',
        className: 'mat-column-name',
        title: (e: any) => `${Utils.formatCurrency(Number(e.fromValue)) || 0}`,
        cell: (e: any) => `${Utils.formatCurrency(Number(e.fromValue)) || 0}`,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'toValue',
        header: 'to',
        className: 'mat-column-name',
        title: (e: any) => `${Utils.formatCurrency(Number(e.toValue)) || 0}`,
        cell: (e: any) => `${Utils.formatCurrency(Number(e.toValue)) || 0}`,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'color',
        header: 'color',
        title: (e: any) => ``,
        cell: (e: any) => {
          return this.generateColorBase64(e.color);
        },
        alignHeader: AlignEnum.CENTER,
        columnType: ColumnTypeEnum.BASE64,
      },
    );

    this.warningButtons.push({
      columnDef: 'edit',
      color: 'primary',
      icon: 'fa fa-pen',
      iconType: IconTypeEnum.FONT_AWESOME,
      click: 'onEditWarning',
      className: 'primary content-cell-align-center',
      title: 'common.title.edit',
      display: (e: AccountModel) => this.displayPermissionCheck(),
      header: 'common.table.action.title',
      alignHeader: AlignEnum.CENTER,
    },{
      columnDef: 'delete',
      color: 'primary',
      icon: 'fa fa-trash',
      iconType: IconTypeEnum.FONT_AWESOME,
      click: 'onRemoveWarning',
      className: 'primary content-cell-align-center',
      title: 'common.title.delete',
      display: (e: AccountModel) => this.displayPermissionCheck(),
      header: 'common.table.action.title',
      alignHeader: AlignEnum.CENTER,
    })
  }

  onRemoveWarning(index: number | null | undefined) {
    const warningConfigs = this.addEditForm.get('warningConfigs')?.value;
    warningConfigs.splice(index, 1);
    this.addEditForm.get('warningConfigs')?.setValue(warningConfigs);
  }

  generateColorBase64(colorCode: string): string {
    const boxSize = 24;
    const fontSize = 14;
    const padding = 8;
    const text = colorCode?.toUpperCase();

    const textWidth = text.length * fontSize * 0.6;
    const canvasWidth = boxSize + padding + textWidth + padding;
    const canvasHeight = boxSize + padding * 2;

    const ratio = window.devicePixelRatio || 1;

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth * ratio;
    canvas.height = canvasHeight * ratio;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    const ctx = canvas.getContext('2d')!;
    ctx.scale(ratio, ratio);

    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const borderR = 4;
    const colorY = (canvasHeight - boxSize) / 2;
    ctx.beginPath();
    ctx.moveTo(borderR, colorY);
    ctx.lineTo(boxSize - borderR, colorY);
    ctx.quadraticCurveTo(boxSize, colorY, boxSize, colorY + borderR);
    ctx.lineTo(boxSize, colorY + boxSize - borderR);
    ctx.quadraticCurveTo(boxSize, colorY + boxSize, boxSize - borderR, colorY + boxSize);
    ctx.lineTo(borderR, colorY + boxSize);
    ctx.quadraticCurveTo(0, colorY + boxSize, 0, colorY + boxSize - borderR);
    ctx.lineTo(0, colorY + borderR);
    ctx.quadraticCurveTo(0, colorY, borderR, colorY);
    ctx.closePath();
    ctx.fillStyle = colorCode;
    ctx.fill();

    ctx.font = `bold ${fontSize}px Arial, Helvetica, sans-serif`;
    ctx.fillStyle = "#24292F";
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    const textY = colorY + boxSize / 2 + 2; // giữa ô màu
    ctx.fillText(text, boxSize + padding, textY);

    // Trả về Base64 (bỏ prefix)
    const base64 = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    return base64;
  }

  onAddEditWarning(isEdit: boolean = false, data?: any) {
    const dialogRef = this.matDialog.open(PopupAddColorComponent, {
      disableClose: false,
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: {
        warning: data
      },
    });
    if (isEdit) {
      dialogRef.componentInstance.title = 'mdm.target.form.edit-waring';
    } else {
      dialogRef.componentInstance.title = 'mdm.target.form.add-warning';
    }
    dialogRef
      .afterClosed()
      .subscribe((data: any) => {
        if(!data) return
        if(isEdit) {
          const warningsArray = this.addEditForm.get('warningConfigs')?.value;
          const index = warningsArray.findIndex(
            (item: any) => item.id === data.id || item.warningId === data.warningId
          );
          if (index !== -1) {
            warningsArray[index] = { ...warningsArray[index], ...data };
          }
          this.addEditForm.get('warningConfigs')?.patchValue(warningsArray);
        } else {
          const warning = this.addEditForm.get('warningConfigs')?.value || []
          warning.push(data)
          this.addEditForm.get('warningConfigs')?.patchValue(warning);
        }
      });
  }

  onRemoveAccount(index: number | null | undefined) {
    const accountingAccounts = this.addEditForm.get('accountingAccounts')?.value;
    accountingAccounts.splice(index, 1);
    this.addEditForm.get('accountingAccounts')?.setValue(accountingAccounts);
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

  checkRequired(controlName: string): boolean {
    if (this.isView) return false;

    const unitValue = this.addEditForm.get('unitOfMeasureId')?.value;
    const currencyValue = this.addEditForm.get('currencyId')?.value;


    if (controlName === 'unitOfMeasureId') {
      return !currencyValue || currencyValue === -1;
    }

    if (controlName === 'currencyId') {
      return !unitValue || unitValue === -1;
    }
    return false;
  }
}
