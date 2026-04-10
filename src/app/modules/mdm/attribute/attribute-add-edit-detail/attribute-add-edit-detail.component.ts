import {Component, OnInit} from '@angular/core';
import {
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent,
  BaseStatusEnum,
  DateUtilService,
  SelectModel,
  UtilsService
} from '@c10t/nice-component-library';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {Location} from '@angular/common';
import {TranslateService} from '@ngx-translate/core';
import {HttpParams} from '@angular/common/http';
import {catchError, delay, distinctUntilChanged, EMPTY, filter, map, skip} from "rxjs";
import {
  attributeDatatypeEnum,
  FORM_CONFIG,
  getDatatypeOptions
} from "src/app/modules/mdm/attribute/attribute-search/attribute-search.config";
import {EnumUtil} from "src/app/shared/utils/enum.util";
import {environment} from "src/environments/environment";
import {ActionTypeEnum} from "src/app/shared";
import {ONLY_NUMBER_ORDER_REGEX, VIETNAMESE_REGEX} from "src/app/shared/constants/regex.constants";
import {AttributeDetailModel} from "src/app/modules/mdm/_models/attribute.model";
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {Config} from "src/app/common/models/config.model";

@Component({
  selector: 'app-attribute-add-edit-detail',
  standalone: false,
  templateUrl: './attribute-add-edit-detail.component.html',
})
export class AttributeAddEditDetailComponent extends BaseAddEditComponent implements OnInit {
  moduleName: string = 'mdm.attribute';
  configForm: Config;
  model: AttributeDetailModel | null = null;
  isView: boolean = false;
  checkIsActive: boolean = false;
  status: BaseStatusEnum = BaseStatusEnum._APPROVED;
  readonly BaseStatusEnum = BaseStatusEnum
  actionType: ActionTypeEnum = ActionTypeEnum._ADD;
  dataTypeOptions: SelectModel[] = getDatatypeOptions();
  tableOptions: SelectModel[] = [];

  // length pattern
  lengthPattern = ONLY_NUMBER_ORDER_REGEX.source;

  errorMessages: Map<string, () => string> = new Map([
    ['min', () => 'mdm.expression.error.min-attribute-length'],
  ]);

  protected readonly EnumUtil = EnumUtil;
  protected readonly attributeDatatypeEnum = attributeDatatypeEnum;
  protected readonly environment = environment;

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }

  get hasEditPermission() {
    return this.permissionCheckingUtil.hasViewEditPermission(
      this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }

  get hasApprovePermission() {
    return this.permissionCheckingUtil.hasViewApprovePermission(
      this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }

  get hasRejectPermission() {
    return this.permissionCheckingUtil.hasViewRejectPermission(
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
    protected permissionCheckingUtil: PermissionCheckingUtil,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);

    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.addEditForm = this.fb.group({
      name: ['', [Validators.pattern(VIETNAMESE_REGEX)]],
      datatype: [''],
      description: ['', [Validators.pattern(VIETNAMESE_REGEX)]],
      require: [false],
      allowNegative: [false],
      length: [''],
      referenceTable: [''],
      status: ['APPROVED'],
      createdBy: [''],
      createdDate: [''],
      lastModifiedBy: [''],
      lastModifiedDate: [''],
    });

    this.actionType = this.activatedRoute.routeConfig?.data?.actionType
    this.isView = this.actionType === ActionTypeEnum._VIEW;
    this.isEdit = this.actionType === ActionTypeEnum._EDIT;
  }

  ngOnInit() {
    super.ngOnInit();

    this.callAPIGetTableList();

    if(this.actionType !== ActionTypeEnum._ADD) {
      this.callAPIGetDetail();
    }

    if(this.isView) {
      this.addEditForm.get("require")?.disable();
      this.addEditForm.get("allowNegative")?.disable();
    }

    this.addEditForm.get('datatype')!.valueChanges.pipe(
      filter(value => !!value),
      distinctUntilChanged(),
      this.isEdit ? skip(1) : map(value => value)
    ).subscribe(
      (datatype: attributeDatatypeEnum) => {
        switch(datatype) {
          case attributeDatatypeEnum.STRING:
          case attributeDatatypeEnum.NUMBER:
            const prevValue = this.addEditForm.get('length')?.value;
            this.addEditForm.addControl('require', new FormControl(false));
            this.addEditForm.addControl('length', new FormControl('', [Validators.required]));
            this.addEditForm.get('length')?.setValue("");
            this.addEditForm.get('length')?.markAsUntouched();
            this.addEditForm.get('length')?.markAsPristine();
            this.addEditForm.get('length')?.setValue(prevValue);
            this.addEditForm.removeControl('referenceTable');
            break;
          case attributeDatatypeEnum.REFERENCE:
            this.addEditForm.addControl('require', new FormControl(false));
            this.addEditForm.addControl('referenceTable', new FormControl('', [Validators.required]));
            this.addEditForm.removeControl('length');
            break;
          case attributeDatatypeEnum.DATE:
            this.addEditForm.addControl('require', new FormControl(false));
            this.addEditForm.removeControl('length');
            this.addEditForm.removeControl('referenceTable');
            break;
          default:
            this.addEditForm.removeControl('require');
            this.addEditForm.removeControl('length');
            this.addEditForm.removeControl('referenceTable');
        }
      })
    
    this.addEditForm.get('datatype')!.valueChanges.subscribe(type => {
      type === attributeDatatypeEnum.STRING && this.addEditForm.get('length')?.setValidators([Validators.min(1), Validators.max(255)]);
      type === attributeDatatypeEnum.NUMBER && this.addEditForm.get('length')?.setValidators([Validators.min(1), Validators.max(10)]);
      this.addEditForm.get('length')?.updateValueAndValidity();
    });

    this.addEditForm.get('length')!.valueChanges
    .pipe(
      delay(0)
    )
    .subscribe(length => {
      if (length < 0) {
        this.addEditForm.get('length')!.patchValue("0", { emitEvent: false });
      }
    });
  }

  callAPIGetTableList() {
    const headers = new HttpParams();
    this.apiService
      .get<[{ tableName: string, value: string }]>(
        `${environment.PATH_API_V1}/${FORM_CONFIG.moduleName}/${FORM_CONFIG.name}/tables`, headers)
      .pipe(map((res: [{ tableName: string, value: string }]) => {
        return res.map(tableName => new SelectModel(tableName.tableName, tableName.value, false, tableName));
      }))
      .subscribe((options: SelectModel[]) => {
          this.tableOptions = options;
        }
      );
  }

  callAPIGetDetail() {
    this.apiService.get<AttributeDetailModel>(
      `${environment.PATH_API_V1}/${FORM_CONFIG.moduleName}/${FORM_CONFIG.name}/${this.id}`, new HttpParams())
      .pipe(catchError(error => {
        return EMPTY
      }))
      .subscribe(res => {
        this.model = {...res};
        this.status = this.model.status as BaseStatusEnum;
        this.model.datatype === attributeDatatypeEnum.NUMBER && this.addEditForm.get('length')?.setValidators([Validators.min(1), Validators.max(10)])
        this.model.datatype === attributeDatatypeEnum.STRING && this.addEditForm.get('length')?.setValidators([Validators.min(1), Validators.max(255)])

        this.initForm(this.model)
      })
  }

  initForm(model: AttributeDetailModel) {
    const statusValue = this.isView ?
      this.translateService.instant(this.utilsService.getEnumValueTranslated(BaseStatusEnum, model.status || ''))
      : model.status;
    this.checkIsActive = model?.status === "APPROVED";

    const formValue = {
      name: model.name,
      datatype: model.datatype,
      require: model.require,
      length: model.length,
      description: model.description,
      referenceTable: model.referenceTable,
      allowNegative: model.allowNegative,
      status: statusValue,
      createdBy: model.createdBy,
      createdDate: this.dateUtilService.convertDateToDisplayServerTime(model.createdDate || "") || "",
      lastModifiedBy: model.lastModifiedBy,
      lastModifiedDate: this.dateUtilService.convertDateToDisplayServerTime(model.lastModifiedDate || "") || "",
    }

    this.addEditForm.patchValue(formValue, {emitEvent: false});
  }

  onRedirect(item: any) {
    this.router.navigate([`/mdm/attribute/edit`, item]).then();
  }

  onUpdateStatus(status: 'approve' | 'reject') {
    const apiCall = this.apiService.post(
      `${environment.PATH_API_V1}/${FORM_CONFIG.moduleName}/${FORM_CONFIG.name}/${this.id}/${status}`, '');

    this.utilsService.execute(
      apiCall,
      this.onSuccessFunc,
      `common.${status}.success`,
      `common.title.confirm`,
      [`${this.configForm?.moduleName}.`],
      `common.confirm.${status}`,
      undefined,
      undefined,
      "common.button.confirm", // Nút Xác nhận
      "common.button.back" // Nút Quay lại
    );
  }

  onSubmit() {
    const formData = new FormData();
    const payload = new AttributeDetailModel(this.addEditForm);
    formData.append('body', this.utilsService.toBlobJon(payload));

    const apiCall = this.isEdit
      ? this.apiService.put(
        `${environment.PATH_API_V1}/${FORM_CONFIG.moduleName}/${FORM_CONFIG.name}/${this.id}`, formData)
      : this.apiService.post(`${environment.PATH_API_V1}/${FORM_CONFIG.moduleName}/${FORM_CONFIG.name}`, formData);

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
}
