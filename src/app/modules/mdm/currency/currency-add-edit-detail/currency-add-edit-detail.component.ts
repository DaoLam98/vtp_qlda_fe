import {DatePipe, Location} from '@angular/common';
import {Component} from '@angular/core';
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
  UtilsService
} from '@c10t/nice-component-library';
import {TranslateService} from '@ngx-translate/core';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {DEFAULT_REGEX, VIETNAMESE_REGEX} from 'src/app/shared/constants/regex.constants';
import {CurrencyModel, ExchangeRateModel} from '../../_models/currency.model';
import {HttpParams} from '@angular/common/http';
import {EnumUtil} from "src/app/shared/utils/enum.util";
import {environment} from "src/environments/environment";
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {Config} from "src/app/common/models/config.model";
import {FORM_CONFIG} from "src/app/modules/mdm/currency/currency-search/currency.config";
import {firstValueFrom} from "rxjs";
import {Utils} from "src/app/shared/utils/utils";

@Component({
  selector: 'app-currency-add-edit-detail',
  templateUrl: './currency-add-edit-detail.component.html',
  styleUrls: ['./currency-add-edit-detail.component.scss'],
  standalone: false,
})
export class CurrencyAddEditDetailComponent extends BaseAddEditComponent {
  exchangeRatesColumns: ColumnModel[] = []
  exchangeRatesButtons: ButtonModel[] = []

  emptyRecord = {
    toCurrencyId: null,
    exchangeRate: 0,
    amount: 0,
    fromDate: this.defaultFromDate,
    toDate: null
  }
  createdDate: string = '';
  currencyPattern: string = '^\\d{0,10}(\\.\\d{0,10})?$';

  existedCurrencyData: any[] = [];

  moduleName: string = 'mdm.currency';
  configForm: Config;
  model: any | null = null;
  isView: boolean = false;
  currencyValues: SelectModel[] = []
  checkIsActive!: boolean;

  protected readonly environment = environment;

  get defaultFromDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 1); // Add 1 day to current date
    return date;
  }

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

  get hasExchangeRateApprovePermission() {
    return this.permissionCheckingUtil.hasViewApprovePermission(
      this.configForm?.moduleName ?? '', 'exchange-rate')
  }

  get hasExchangeRateRejectPermission() {
    return this.permissionCheckingUtil.hasViewRejectPermission(
      this.configForm?.moduleName ?? '', 'exchange-rate')
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
    protected datePipe: DatePipe,
    protected selectValuesService: SelectValuesService,
    protected dateUtilService: DateUtilService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);

    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.addEditForm = this.fb.group({
      code: ['', [Validators.pattern(DEFAULT_REGEX)]],
      name: ['', [Validators.pattern(VIETNAMESE_REGEX)]],
      description: ['', [Validators.pattern(VIETNAMESE_REGEX)]],
      exchangeRates: [[]],
      status: [''],
      createdDate: [''],
      createdBy: [''],
      lastModifiedDate: [''],
      lastModifiedBy: [''],
    });

    this.isView = this.activatedRoute.routeConfig?.data?.actionType === ActionTypeEnum._VIEW;

    this.initExchangeRatesColumns();
    this.initExchangeRatesButtons();

    if(this.addEditForm.get('exchangeRates')?.value?.length === 0) {
      this.onAddRow();
    }
  }

  async ngOnInit() {
    super.ngOnInit();
    this.selectValuesService.getAutocompleteValuesFromModulePath(
      `${environment.PATH_API_V1}/mdm/currency`,
      [
        { key: 'sortDirection', value: 'asc' },
        { key: 'sortBy', value: 'code' },
      ],
      undefined,
      undefined,
      true,
      'code',
      this.isEdit
    ).subscribe((res) => {
      this.currencyValues = res
    });

    if(this.isEdit) {
      this.model = await firstValueFrom(
        this.apiService.get(
          `${environment.PATH_API_V1}/${FORM_CONFIG.moduleName}/${FORM_CONFIG.name}/` + this.id, new HttpParams())
      );
      this.createdDate = this.model.createdDate;

      const statusValue = this.isView
        ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, this.model.status || '')
        : this.model.status;

      this.checkIsActive = this.model?.status === EnumUtil.getKeysByValues(BaseStatusEnum, [BaseStatusEnum._APPROVED]);

      let exchangeRates = [...this.model.exchangeRates];
      if(this.isView) {
        exchangeRates.sort((a, b) => {
          const diff = new Date(b.toDate).getTime() - new Date(a.toDate).getTime();
          if (diff !== 0) return diff;
          return a.toCurrencyCode.localeCompare(b.toCurrencyCode);
        });
      }
      this.model = {
        ...this.model,
        exchangeRates: exchangeRates.map(item => ({
          ...item,
          exchangeRate: Utils.toPlainString(item.exchangeRate)
        })),
        status: statusValue,
        createdBy: this.model.createdBy,
        createdDate: this.dateUtilService.convertDateToDisplayServerTime(this.model.createdDate),
        lastModifiedBy: this.model.lastModifiedBy,
        lastModifiedDate: this.dateUtilService.convertDateToDisplayServerTime(this.model.lastModifiedDate),
      };

      this.existedCurrencyData = [...this.model.exchangeRates];

      // Cập nhật form
      this.addEditForm.setValue(UtilsService.reduceEntityAttributeForFormControl(this.addEditForm, this.model));
    }
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

  onRedirect(item: any) {
    this.router.navigate([`/mdm/currency/edit`, item]).then();
  }

  onDeleteTransaction(rowIndex: number | null | undefined) {
    const transactionValue = this.addEditForm.get('exchangeRates')?.value;
    if(transactionValue.length === 1) {
      return
    }
    transactionValue.splice(rowIndex, 1);
    this.addEditForm.get('exchangeRates')?.setValue(transactionValue)
  }

  acceptExchangeRate(rowIndex: number | null | undefined) {
    if (rowIndex !== null && rowIndex !== undefined) {
      const exchangeRates = this.addEditForm.get('exchangeRates')?.value;
      const item = exchangeRates[rowIndex];

      const actionUrl = `${environment.PATH_API_V1}/${this.configForm?.moduleName}/exchange-rate/${item.id}/approve`;
      const apiCall = this.apiService.post(actionUrl, '');

      this.utilsService.execute(
        apiCall,
        this.onSuccessFunc1,
        `common.approve.success`,
        `common.title.confirm`,
        [`${this.configForm?.moduleName}.`],
        `common.confirm.approve`,
        undefined,
        undefined,
        "common.button.confirm", // Nút Xác nhận
        "common.button.back" // Nút Quay lại
      );
    }
  }

  rejectExchangeRate(rowIndex: number | null | undefined) {
    if (rowIndex !== null && rowIndex !== undefined) {
      const exchangeRates = this.addEditForm.get('exchangeRates')?.value;
      const item = exchangeRates[rowIndex];

      const actionUrl = `${environment.PATH_API_V1}/${this.configForm?.moduleName}/exchange-rate/${item.id}/reject`;
      const apiCall = this.apiService.post(actionUrl, '');

      this.utilsService.execute(
        apiCall,
        this.onSuccessFunc1,
        `common.reject.success`,
        `common.title.confirm`,
        [`${this.configForm?.moduleName}.`],
        `common.confirm.reject`,
        undefined,
        undefined,
        "common.button.confirm", // Nút Xác nhận
        "common.button.back" // Nút Quay lại
      );
    }
  }

  onSuccessFunc1 = async (data: any, onSuccessMessage: string | undefined) => {
    this.utilsService.onSuccessFunc(onSuccessMessage ? onSuccessMessage : 'common.default.success');

    // Gọi API lấy detail mới
    this.model = await firstValueFrom(
      this.apiService.get(
        `${environment.PATH_API_V1}/${FORM_CONFIG.moduleName}/${FORM_CONFIG.name}/` + this.id,
        new HttpParams()
      )
    );

    this.model = {
      ...this.model,
      createdBy: this.model.createdBy,
      createdDate: this.dateUtilService.convertDateToDisplayServerTime(this.model.createdDate),
      lastModifiedBy: this.model.lastModifiedBy,
      lastModifiedDate: this.dateUtilService.convertDateToDisplayServerTime(this.model.lastModifiedDate),
    };

    // Cập nhật form
    this.addEditForm.setValue(UtilsService.reduceEntityAttributeForFormControl(this.addEditForm, this.model));
  };

  onAddRow(): void {
    const newRow = {...this.emptyRecord};
    this.addEditForm.get('exchangeRates')?.setValue([...this.addEditForm.get('exchangeRates')?.value, newRow]);
  }

  onRowButtonClick(event: ButtonClickEvent) {
    if(event.action === 'onDeleteTransaction') {
      this.onDeleteTransaction(event?.index);
    }
    if (event.action === 'acceptExchangeRate') {
      this.acceptExchangeRate(event?.index);
    }
    if (event.action === 'rejectExchangeRate') {
      this.rejectExchangeRate(event?.index);
    }
  }

  onSubmit() {
    const formData = new FormData();

    const exchangeRates = this.addEditForm.get("exchangeRates")?.value?.map((item: any) => {
      return {
        ...item,
        /** Nếu giá trị là string rỗng thì chuyển thành null để BE không báo lỗi */
        fromDate: typeof item.fromDate === "string" ? (item.fromDate || null) : this.dateUtilService.convertDateToStringCurrentGMT(item.fromDate),
        toDate: typeof item.toDate === "string" ? (item.toDate || null) : this.dateUtilService.convertDateToStringCurrentGMT(item.toDate),
      }
    });
    this.addEditForm.patchValue({ exchangeRates });

    const payload = new CurrencyModel(this.addEditForm);
    const extendedPayload = {
      ...payload,
      createdDate: this.isEdit ? this.createdDate : null,
      lastModifiedDate: this.isEdit ? this.dateUtilService.convertDateToStringCurrentGMT(new Date()) : null,
    };
    formData.append('body', this.utilsService.toBlobJon(extendedPayload));

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

  private initExchangeRatesColumns(): void {
    const getIndex = (e: ExchangeRateModel) => `${this.addEditForm.get('exchangeRates')?.value.indexOf(e) + 1}`;
    const getCurrencyDisplay = (e: ExchangeRateModel) =>
      `${this.currencyValues.find(item => item.value === e.toCurrencyId)?.displayValue ?? ''}`;
    const getFormattedNumber = (e: ExchangeRateModel) => Utils.formatNumberWithDots(Number(e.exchangeRate));
    const getDate = (date: any) => this.datePipe.transform(date, 'dd/MM/yyyy') ?? '';

    this.exchangeRatesColumns.push(...[
      {
        columnDef: 'stt',
        header: 'stt',
        headerClassName: 'mat-column-stt width-5 min-width-40',
        className: 'mat-column-stt',
        title: getIndex,
        cell: getIndex,
        isShowHeader: true,
        display: () => true,
        disabled: () => false,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'toCurrencyId',
        header: 'toCurrency',
        className: 'mat-column-toCurrency',
        title: getCurrencyDisplay,
        cell: getCurrencyDisplay,
        isShowHeader: true,
        display: () => true,
        optionValues: (e: ExchangeRateModel) => this.currencyValues.filter(currency => !currency.disabled || currency.value === e.toCurrencyId),
        disabled: () => this.isView,
        isRequired: !this.isView,
        columnType: this.isView ? ColumnTypeEnum.VIEW : ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'exchangeRate',
        header: 'exchangeRate',
        className: 'mat-column-exchangeRate',
        title: getFormattedNumber,
        cell: getFormattedNumber,
        isShowHeader: true,
        display: () => true,
        disabled: () => this.isView,
        isRequired: !this.isView,
        columnType: this.isView ? ColumnTypeEnum.VIEW : ColumnTypeEnum.INPUT_CURRENCY,
        isDecimal: true,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.RIGHT,
        patternFilter: this.currencyPattern,
      },
      {
        columnDef: 'fromDate',
        header: 'startDate',
        className: 'mat-column-fromDate',
        title: (e: ExchangeRateModel) => getDate(e.fromDate),
        cell: (e: ExchangeRateModel) => getDate(e.fromDate),
        isShowHeader: true,
        display: () => true,
        disabled: () => this.isView,
        isRequired: !this.isView,
        /**
         * Trả về ngày tối thiểu có thể chọn cho trường 'Ngày có hiệu lực'.
         * Mặc định là ngày mai (ngày hiện tại + 1).
         * Trong màn Chỉnh sửa thì cho chọn ngày nhỏ hơn ngày hôm nay
         */
        min: () => {
          const date = new Date();
          date.setUTCDate(date.getUTCDate() + 1);
          date.setHours(0, 0, 0, 0);
          return this.isEdit ? null : date;
        },
        max: (e: ExchangeRateModel) => {
          if (!e.toDate) return null;
          const date = new Date(e.toDate);
          date.setUTCDate(date.getUTCDate() - 1);
          date.setHours(23, 59, 59, 999);
          return date;
        },
        columnType: this.isView ? ColumnTypeEnum.VIEW : ColumnTypeEnum.DATE_PICKER,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'toDate',
        header: 'endDate',
        className: 'mat-column-endDate',
        title: (e: ExchangeRateModel) => getDate(e.toDate),
        cell: (e: ExchangeRateModel) => getDate(e.toDate),
        isShowHeader: true,
        display: () => true,
        disabled: () => this.isView,
        min: (e: ExchangeRateModel) => {
          const date = new Date(e.fromDate);
          date.setUTCDate(date.getUTCDate() + 1);
          date.setHours(0, 0, 0, 0);
          return date;
        },
        columnType: this.isView ? ColumnTypeEnum.VIEW : ColumnTypeEnum.DATE_PICKER,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'status',
        header: 'status',
        title: (e: ExchangeRateModel) => `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
        cell: (e: ExchangeRateModel) => `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
        className: 'mat-column-status',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
        display: (e: any) => this.isView,
        isExpandOptionColumn: () => true,
      },
    ]);
  }

  private initExchangeRatesButtons(): void {
    this.exchangeRatesButtons.push(
      {
        columnDef: 'delete',
        color: 'warn',
        icon: 'fa fa-trash',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'onDeleteTransaction',
        className: 'primary content-cell-align-center',
        title: 'common.title.delete',
        display: (e: ExchangeRateModel) => !this.isView && (this.hasAddPermission || this.hasEditPermission) && !this.existedCurrencyData.some(item => item.toCurrencyId === e.toCurrencyId),
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
        disabled: (e: ExchangeRateModel) => this.isView,
      },
      {
        columnDef: 'accept',
        color: 'primary',
        icon: 'fa fa-check',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'acceptExchangeRate',
        className: 'primary content-cell-align-center',
        title: 'common.title.accept',
        display: (e: ExchangeRateModel) =>  this.isView && this.hasExchangeRateApprovePermission, //!this.isPopup,
        disabled: (e: ExchangeRateModel) => e?.status === EnumUtil.getKeysByValues(BaseStatusEnum, [BaseStatusEnum._APPROVED]),
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'reject',
        color: 'warn',
        icon: 'fa fa-ban',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'rejectExchangeRate',
        className: 'primary content-cell-align-center',
        title: 'common.title.reject',
        display: (e: ExchangeRateModel) =>  this.isView && this.hasExchangeRateRejectPermission,
        disabled: (e: ExchangeRateModel) => e?.status === EnumUtil.getKeysByValues(BaseStatusEnum, [BaseStatusEnum._REJECTED]),
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
    );
  }
}
