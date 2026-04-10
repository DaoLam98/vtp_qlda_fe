import {Location} from '@angular/common';
import {HttpParams} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
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
import {firstValueFrom, lastValueFrom, map} from 'rxjs';
import {TranslationKeyModel} from 'src/app/modules/mdm/_models/translation-key.model';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {TranslationValueModel} from 'src/app/modules/mdm/_models/translation-value.model';
import {environment} from 'src/environments/environment';
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {Config} from "src/app/common/models/config.model";
import {FORM_CONFIG} from "src/app/modules/mdm/translate-key/translation-key-search/translation-key-search.config";
import {VIETNAMESE_REGEX} from "src/app/shared/constants/regex.constants";

@Component({
  selector: 'app-translation-key-add-edit-detail',
  standalone: false,
  templateUrl: './translation-key-add-edit-detail.component.html',
  styleUrls: ['./translation-key-add-edit-detail.component.scss'],
})
export class TranslationKeyAddEditDetailComponent extends BaseAddEditComponent implements OnInit {
  moduleName: string = 'mdm.translation-key';
  configForm: Config;
  model!: TranslationKeyModel;
  isView: boolean = false;
  checkIsActive!: boolean;
  translationValueColumns: ColumnModel[] = [];
  translationValueButtons: ButtonModel[] = [];
  languageOriginValues: SelectModel[] = [];
  languageValues: SelectModel[] = [];
  moduleValues: SelectModel[] = [];

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
    protected selectValuesService: SelectValuesService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);

    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.isView = this.activatedRoute.routeConfig?.data?.actionType === ActionTypeEnum._VIEW;

    this.addEditForm = this.fb.group({
      key: [''],
      module: [''],
      description: ['', [Validators.pattern(VIETNAMESE_REGEX)]],
      translationValues: [[]],
      status: [],
      statusDisplay: [],
      createdDate: [],
      createdBy: [],
      lastModifiedDate: [],
      lastModifiedBy: [],
    });

    this.translationValueColumns.push(
      {
        columnDef: 'stt',
        header: 'stt',
        headerClassName: 'mat-column-stt width-5 min-width-40',
        className: 'mat-column-stt',
        title: (e: TranslationValueModel) => {
          const values = this.addEditForm.get('translationValues')?.value as TranslationValueModel[];
          const index = values.indexOf(e) + 1;
          return index.toString();
        },
        cell: (e: TranslationValueModel) => {
          const values = this.addEditForm.get('translationValues')?.value as TranslationValueModel[];
          const index = values.indexOf(e) + 1;
          return index.toString();
        },
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'languageId',
        header: 'language',
        className: 'mat-column-language',
        title: (e: TranslationValueModel) => `${e.languageEntity.name}`,
        cell: (e: TranslationValueModel) => `${e.languageEntity.name}`,
        columnType: this.isView ? ColumnTypeEnum.VIEW : ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE,
        optionValues: (e: TranslationValueModel) => this.languageValues,
        isRequired: !this.isView,
        onCellValueChange: (e: TranslationValueModel) => {
        },
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'value',
        header: 'value',
        className: 'mat-column-value',
        title: (e: TranslationValueModel) => `${e.value}`,
        cell: (e: TranslationValueModel) => `${e.value}`,
        columnType: this.isView ? ColumnTypeEnum.VIEW : ColumnTypeEnum.INPUT,
        isRequired: !this.isView,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
    );

    this.translationValueButtons.push({
      columnDef: 'delete',
      color: 'primary',
      icon: 'fa fa-trash',
      iconType: IconTypeEnum.FONT_AWESOME,
      click: 'onDeleteTranslationValue',
      className: 'primary content-cell-align-center',
      title: 'common.title.delete',
      display: (e: TranslationValueModel) => !this.isView,
      header: 'common.table.action.title',
      alignHeader: AlignEnum.CENTER,
    });

    this.addEditForm.valueChanges.subscribe(() => {
      const values = this.addEditForm.value.translationValues as TranslationValueModel[];
      this.languageValues = this.languageOriginValues.map(i => ({
        ...i,
        disabled: !!values.find(j => j.languageId == i.value)
      }));
    });
  }

  async ngOnInit() {
    super.ngOnInit();

    this.languageOriginValues = await lastValueFrom(
      this.selectValuesService.getAutocompleteValuesFromModulePath(
        `${environment.PATH_API_V1}/mdm/language`,
        undefined,
        undefined,
        undefined,
        true,
      ),
    );

    this.moduleValues = await lastValueFrom(
      this.selectValuesService
        .getAutocompleteValuesFromModulePath(
          `${environment.PATH_API_V1}/mdm/module`,
          undefined,
          undefined,
          undefined,
          true,
        )
        .pipe(
          map((values) =>
            values.map(
              (value) => new SelectModel(value.rawData.code, value.rawData.name, false, value),
            ),
          ),
        ),
    );

    if(this.isEdit) {
      this.model = await firstValueFrom(
        this.apiService.get<TranslationKeyModel>(
          `${environment.PATH_API_V1}/mdm/translation-key/` + this.id, new HttpParams())
      );

      this.model.createdDate = this.dateUtilService.convertDateToDisplayServerTime(this.model.createdDate || '') || '';
      this.model.lastModifiedDate = this.dateUtilService.convertDateToDisplayServerTime(
        this.model.lastModifiedDate || '') || '';
      this.checkIsActive = this.model?.status === 'APPROVED';

      this.addEditForm.setValue({
        ...UtilsService.reduceEntityAttributeForFormControl(this.addEditForm, this.model),
        statusDisplay: this.model.status
          ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, this.model.status)
          : '',
      });
    }

    if(!this.isView) {
      const values = this.addEditForm.get('translationValues')?.value;
      if(Array.isArray(values) && values.length === 0) {
        this.addTranslationValue();
      }
    }
  }

  onUpdateStatus(status: 'approve' | 'reject') {
    const apiCall = this.apiService.post(`${environment.PATH_API_V1}/mdm/translation-key/${this.id}/${status}`, '');

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

  onRedirect(item: TranslationKeyModel) {
    this.router.navigate([`/mdm/translation-key/edit`, item.id]).then();
  }

  addTranslationValue() {
    const values = this.addEditForm.get('translationValues')?.value as TranslationValueModel[];
    this.addEditForm.get('translationValues')?.patchValue([
      ...values,
      {
        languageId: null,
        value: '',
        translationKeyId: this.model?.id,
      },
    ]);
  }

  onTranslationValuesTableAction(event: ButtonClickEvent) {
    if(event.action == 'onDeleteTranslationValue') this.onDeleteTranslationValue(event.index);
  }

  onDeleteTranslationValue(index: number | null | undefined) {
    const translationValues = this.addEditForm.get('translationValues')?.value;
    if(translationValues.length == 1) {
      return;
    }
    translationValues.splice(index, 1);
    this.addEditForm.get('translationValues')?.setValue(translationValues);
  }

  onSubmit() {
    const formData = new FormData();
    const payload = new TranslationKeyModel(this.addEditForm);
    formData.append('body', this.utilsService.toBlobJon(payload));

    const apiCall = this.isEdit
      ? this.apiService.put(`${environment.PATH_API_V1}/mdm/translation-key/${this.id}`, formData)
      : this.apiService.post(`${environment.PATH_API_V1}/mdm/translation-key`, formData);

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
