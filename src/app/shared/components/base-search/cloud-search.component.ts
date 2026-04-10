import {
  AfterContentInit,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnInit,
  Output,
  QueryList,
  Renderer2,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {
  AlignEnum,
  ApiService,
  AuthoritiesService,
  BaseModel,
  BaseSearchComponent,
  ButtonModel,
  ColumnModel,
  CvaTableComponent,
  DateUtilService,
  FormStateService,
  SelectModel,
  TablePagingResponseModel,
  UtilsService,
} from '@c10t/nice-component-library';
import {HttpParams} from '@angular/common/http';
import {environment} from 'src/environments/environment';
import {AppTemplateDirective} from 'src/app/shared/directives/app-template.directive';
import {Config} from 'src/app/common/models/config.model';
import {FieldModel, FieldType} from 'src/app/common/models/field.model';
import {ActionType} from 'src/app/shared';
import {Utils} from '../../utils/utils';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {MatTableDataSource} from '@angular/material/table';
import {PermissionCheckingUtil} from '../../utils/permission-checking.util';

const LIST_FIELD_CONSTANT = [
  {
    name: 'createdDate',
    label: 'createdDate',
    type: FieldType.DATE_RANGE,
    required: false,
    isHidden: false,
    validate: [''],
  },
  {
    name: 'createdBy',
    label: 'createdBy',
    type: FieldType.COMBOBOX,
    required: false,
    isHidden: false,
    validate: [''],
  },
  {
    name: 'lastModifiedDate',
    label: 'lastModifiedDate',
    type: FieldType.DATE_RANGE,
    required: false,
    isHidden: false,
    validate: [''],
  },
  {
    name: 'lastModifiedBy',
    label: 'lastModifiedBy',
    type: FieldType.COMBOBOX,
    required: false,
    isHidden: false,
    validate: [''],
  },
]


// Helper interface
interface SearchContext {
  params: HttpParams;
  queryString: string;
  dateQueryString: string;
}

@Component({
  selector: 'cloud-search',
  standalone: false,
  templateUrl: './cloud-search.component.html',
  styleUrl: './cloud-search.component.scss',
})
export class CloudSearchComponent extends BaseSearchComponent implements OnInit, OnChanges, AfterContentInit {
  @ViewChild('table') table!: CvaTableComponent;
  @Input() addBtnEnabled = true;

  @Input() exportBtnEnabled = false;
  @Input() viewBtnEnabled = false;
  @Input() downloadBtnEnabled = false;
  @Input() uploadBtnEnabled = false;

  @ContentChildren(AppTemplateDirective) templates!: QueryList<AppTemplateDirective>;

  filterTemplate: TemplateRef<any> | undefined;
  toolbarTemplate: TemplateRef<any> | undefined;
  quickFilterTemplate: TemplateRef<any> | undefined;

  moduleName = '';

  @Input() configForm: Config | undefined;
  @Input() formAdvanceSearch?: FormGroup;

  @Input() columns: ColumnModel[] = [];
  @Input() buttons: ButtonModel[] = [];
  @Input() superHeaders: ColumnModel[][] = [];
  @Input() convertField2HttpParamFn?: ((params: HttpParams, formGroup: FormGroup) => HttpParams);
  @Input() paramAdditionalForQuickSearch?: ((params: HttpParams, formGroup?: FormGroup) => HttpParams);
  @Input() afterSearchFn?: ((data: TablePagingResponseModel) => TablePagingResponseModel);
  @Input() showPopupViewEdit?: ((data: any, action?: 'VIEW' | 'UPDATE') => void);
  @Input() isShowBreadcrum: boolean = true;
  @Input() addBtnFunction!: Function
  @Input() isAdvancedSearch = false;
  @Input() selected: any[] = [];
  @Input() trackBy: string = 'id';
  @Input() mapBy: string = 'id';
  @Input() isShowQuickSearch = true;
  @Input() isShowAuditField = true;
  @Output() onChangeDisplayColumn = new EventEmitter<any>();
  @Output() viewProcess = new EventEmitter<any>();
  @Output() deleteItemOnTable = new EventEmitter<any>();
  @Output() downloadItemOnTable = new EventEmitter<any>();
  @Output() onOpenPreviewPopup = new EventEmitter<any>();
  @Output() handleExport = new EventEmitter<any>();
  @Output() handleUpload = new EventEmitter<void>();
  @Output() handleDownload = new EventEmitter<void>();

  fields: FieldModel[] = [];
  checkboxColumn: ColumnModel | undefined = undefined;

  isPopup: boolean;
  listUser: SelectModel[] = []
  smartTableControl: FormControl = new FormControl([]);
  Utils = Utils;
  protected readonly FieldType = FieldType;

  get expandHeaderButton() {
    return environment.EXPAND_HEADER_BUTTON;
  }

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
    protected dateUtilService: DateUtilService,
    protected selectValuesService: SelectValuesService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
    protected el: ElementRef, private renderer: Renderer2
  ) {
    super(
      router, apiService, utilsService, uiStateService, translateService, injector, activatedRoute,
      authoritiesService, new FormGroup({})
    );
    this.isPopup = false;
    this.isAdvancedSearch = false;
  }

  ngOnInit() {
    if(this.isShowAuditField) {
      this.selectValuesService.getAutocompleteValuesFromModulePath(
        `${environment.PATH_API_V1}/mdm/internal-user`,
        undefined,
        {
          code: 'code',
          name: 'fullName',
          value: 'userName'
        },
        'id,code,fullName,userName'
      ).subscribe(options => {
        this.listUser = options;
      });
    }
    this.initializeSearchFormControls();

    if (this.configForm?.filterForm) {
      this.configureModuleAndTable();
      this.configureButtonPermissions();
      this.setupAdvancedSearchForm();
    }

    this.search();
  }

  private initializeSearchFormControls(): void {
    LIST_FIELD_CONSTANT.forEach(field => {
      if (field.type === FieldType.DATE_RANGE) {
        this.addDateRangeControls(field.name);
      }
      this.searchForm?.addControl(field.name, new FormControl(""));
    });
  }

  private addDateRangeControls(fieldName: string): void {
    const fromName = 'from' + fieldName.replace(/^\w/, (c) => c.toUpperCase());
    const toName = 'to' + fieldName.replace(/^\w/, (c) => c.toUpperCase());
    this.searchForm?.addControl(fromName, new FormControl());
    this.searchForm?.addControl(toName, new FormControl());
  }

  private configureModuleAndTable(): void {
    this.moduleName = `${this.configForm?.moduleName}.${this.configForm?.name}`;
    this.configureSuperHeaders();
    this.configureColumns();
    this.fields = this.configForm?.filterForm ? this.generateFieldsFromConfig(this.configForm?.filterForm) : [];
  }

  private configureSuperHeaders(): void {
    const hasSuperHeader = this.superHeaders && this.superHeaders.length > 0;
    if (hasSuperHeader) {
      this.superHeaders[0].unshift({
        columnDef: 'stt',
        header: 'stt',
        title: (e: any) => ``,
        cell: (e: any) => ``,
        rowSpan: this.superHeaders?.length + 1,
        colSpan: 1,
        align: AlignEnum.CENTER,
      });
    }
  }

  private configureColumns(): void {
    if (!this.columns) return;

    const hasSuperHeader = this.superHeaders && this.superHeaders.length > 0;
    const columnDefStt = hasSuperHeader ? 'stt-none-display' : 'stt';
    const headerClassNameStt = hasSuperHeader ? 'mat-column-none-display' : 'width-10';

    this.columns.unshift({
      columnDef: columnDefStt,
      header: 'stt',
      title: (e: any) => this.getSttValue(e),
      cell: (e: any) => this.getSttValue(e),
      className: 'width-10',
      headerClassName: headerClassNameStt,
      align: AlignEnum.CENTER,
      rowSpan: 1,
      colSpan: 1
    });
  }

  private getSttValue(element: any): string {
    if (this.configForm?.isViewDataWithSmartTable) {
      return ((this.smartTableControl?.value?.indexOf(element) || 0) + 1).toString();
    }
    return `${UtilsService.calcPosition(element, this.results, this.paging)}`;
  }

  private configureButtonPermissions(): void {
    if (!this.buttons) return;

    this.buttons.forEach((button: ButtonModel) => {
      const originalDisplay = button.display ?? (() => true);
      button.display = (data: any) => this.getButtonDisplayLogic(button.columnDef, originalDisplay, data);
    });
  }

  private getButtonDisplayLogic(columnDef: string, originalDisplay: (data: any) => boolean, data: any): boolean {
    if (!originalDisplay(data)) return false;

    const moduleName = this.configForm?.moduleName ?? '';
    const formName = this.configForm?.name ?? '';

    switch (columnDef) {
      case "detail":
        return this.permissionCheckingUtil.hasViewDetailPermission(moduleName, formName);

      case "edit":
        return this.permissionCheckingUtil.hasViewEditPermission(moduleName, formName) ||
              this.permissionCheckingUtil.hasSaveDraftPermission(moduleName, formName) ||
              this.permissionCheckingUtil.hasCompleteTaskPermission(moduleName, formName);

      case "accept":
        return this.permissionCheckingUtil.hasViewApprovePermission(moduleName, formName);

      case "reject":
      case 'deleteFinalBalanceConfig':
        return this.permissionCheckingUtil.hasViewRejectPermission(moduleName, formName);

      case "copy":
        return this.permissionCheckingUtil.hasViewEditPermission(moduleName, formName);

      case "onDownloadItemOnTable":
        return this.permissionCheckingUtil.isHasDownloadFolderPermission(moduleName, formName);

      case "onViewProcess":
        return true;

      default:
        return true;
    }
  }

  private setupAdvancedSearchForm(): void {
    const listDateRange = this.configForm?.filterForm ? this.configForm.filterForm.filter(x => x.type === FieldType.DATE_RANGE) : [];

    if (this.formAdvanceSearch) {
      this.addDateRangeControlsToAdvancedForm(listDateRange);
      this.searchForm?.addControl('formAdvanceSearch', this.formAdvanceSearch);
    } else {
      this.createSearchFormFromFields();
    }

    this.searchForm?.addControl('keyword', new FormControl());
  }

  private addDateRangeControlsToAdvancedForm(dateRangeFields: any[]): void {
    if (!dateRangeFields || dateRangeFields.length === 0) return;

    dateRangeFields.forEach(field => {
      const fromName = 'from' + field.name.replace(/^\w/, (c: any) => c.toUpperCase());
      const toName = 'to' + field.name.replace(/^\w/, (c: any) => c.toUpperCase());
      this.formAdvanceSearch?.addControl(fromName, new FormControl());
      this.formAdvanceSearch?.addControl(toName, new FormControl());
    });
  }

  private createSearchFormFromFields(): void {
    const formConfig = this.fields.reduce((result: any, item) => {
      result[item.name] = item.validate;
      return result;
    }, {});

    this.searchForm = this.formBuilder.group(formConfig);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['configForm'] && !changes['configForm'].firstChange) {
      const filterForm = changes['configForm'].currentValue?.filterForm || [];
      this.fields = this.generateFieldsFromConfig(filterForm);
    }
  }

  ngAfterContentInit() {
    this.templates.forEach(item => {
      switch (item.type) {
        case 'filterForm':
          this.filterTemplate = item.template;
          break;
        case 'toolbar':
          this.toolbarTemplate = item.template;
          break;
        case 'quickFilterForm':
          this.quickFilterTemplate = item.template;
          break;
      }
    });
  }

  ngAfterViewInit(): void {
    const displayColumns = this.columns.reduce((obj, col) => {
      const isDisplayCol = col.isExpandOptionColumn == undefined ? true : !col.isExpandOptionColumn();
      obj[col.columnDef] = isDisplayCol;
      return obj;
    }, {} as { [p: string]: boolean });

    this.onChangeDisplayColumnInternal(displayColumns);

    this.checkboxColumn = this.columns.find((item) => item.columnDef == 'checked');
    if (this.checkboxColumn) {
      this.checkboxColumn.onHeaderCellValueChange = () => {
        for (const item of this.results.data) {
          this.checkboxColumn!.onCellValueChange?.(item);
        }
      };
    }
  }

  collectParams(): HttpParams {
    if (!this.configForm || !this.fields) {
      return new HttpParams();
    }

    const fieldMap = this.buildFieldMap();
    let params = this.buildBaseParams(fieldMap);

    if (this.formAdvanceSearch) {
      params = this.applyAdvanceSearch(params, fieldMap);
    }

    params = this.applyConvertFn(params);
    params = this.applySelectedFields(params);

    return params;
  }

  trimKeyword(): void {
    const keywordControl = this.searchForm.get('keyword');
    if (keywordControl?.value && typeof keywordControl.value === 'string') {
      const trimmed = keywordControl.value.trim();
      if (trimmed !== keywordControl.value) {
        keywordControl.setValue(trimmed, { emitEvent: false });
      }
    }
  }

  search() {
    this.trimKeyword();

    if (!this.searchForm.valid) return;

    let params = this.collectParams();
    const searchContext = this.buildSearchContext(params);

    if (this.configForm?.isViewDataWithSmartTable) {
      this.executeSmartTableSearch(searchContext.params);
    } else {
      this.executeStandardSearch(searchContext);
    }
  }

  private buildSearchContext(params: HttpParams): SearchContext {
    const isQuickSearch = !this.isAdvancedSearch && this.searchForm.get('keyword')?.value;

    if (isQuickSearch) {
      return this.buildQuickSearchContext(params);
    }

    return this.buildAdvancedSearchContext(params);
  }

  private buildQuickSearchContext(params: HttpParams): SearchContext {
    const rawKeyword = this.searchForm.get('keyword')?.value.trim() || '';
    const encodedKeyword = encodeURIComponent(`%${rawKeyword}%`);
    const quickQueryString = `?keyword=${encodedKeyword}`;

    const updatedParams = this.paramAdditionalForQuickSearch
      ? this.paramAdditionalForQuickSearch(params)
      : params;

    return {
      params: updatedParams,
      queryString: quickQueryString,
      dateQueryString: ''
    };
  }

  private buildAdvancedSearchContext(params: HttpParams): SearchContext {
    const formGroup = this.getAdvancedSearchFormGroup();

    const dateQueryString = this.buildDateQueryString(formGroup);
    const updatedParams = this.processAdvancedSearchParams(params, formGroup);

    return {
      params: updatedParams,
      queryString: '?',
      dateQueryString
    };
  }

  private getAdvancedSearchFormGroup(): FormGroup {
    const formGroup = this.searchForm.get('formAdvanceSearch') as FormGroup;
    return formGroup || this.searchForm;
  }

  private buildDateQueryString(formGroup: FormGroup): string {
    const dateFields = this.fields?.filter((x: FieldModel) => x.type === FieldType.DATE_RANGE);

    if (!dateFields || dateFields.length === 0) return '';

    const dateQueries = dateFields
      .map(field => this.buildDateFieldQuery(field, formGroup))
      .filter(query => query !== '')
      .join('&');

    return dateQueries;
  }

  private buildDateFieldQuery(field: FieldModel, formGroup: FormGroup): string {
    const fromDateName = 'from' + field.name.replace(/^\w/, (c) => c.toUpperCase());
    const toDateName = 'to' + field.name.replace(/^\w/, (c) => c.toUpperCase());

    const valueFromDate = formGroup.get(fromDateName)?.value ?? this.searchForm.get(fromDateName)?.value;
    const valueToDate = formGroup.get(toDateName)?.value ?? this.searchForm.get(toDateName)?.value;

    if (!valueFromDate || !valueToDate) return '';

    const fromDate = `${valueFromDate.split(' ')[0]} 00:00:00`;
    const toDate = `${valueToDate.split(' ')[0]} 23:59:59`;
    const dateRange = encodeURIComponent(`from=${fromDate},to=${toDate}`);

    return `${field.name}=${dateRange}`;
  }

  private processAdvancedSearchParams(params: HttpParams, formGroup: FormGroup): HttpParams {
    let updatedParams = this.removeDateFieldsFromParams(params);
    updatedParams = this.processTextFieldsParams(updatedParams, formGroup);
    return updatedParams;
  }

  private removeDateFieldsFromParams(params: HttpParams): HttpParams {
    const dateFields = this.fields?.filter((x: FieldModel) => x.type === FieldType.DATE_RANGE);

    if (!dateFields) return params;

    return dateFields.reduce((result, field) => result.delete(field.name), params);
  }

  private processTextFieldsParams(params: HttpParams, formGroup: FormGroup): HttpParams {
    const textFields = this.fields?.filter((x: FieldModel) => x.type === FieldType.TEXT);

    if (!textFields) return params;

    return textFields.reduce((result, field) => {
      const value = formGroup.get(field.name)?.value;

      if (!value) return result;

      const trimmedText = value.trim();
      formGroup.get(field.name)?.setValue(trimmedText);

      return result.set(field.name, `%${trimmedText}%`);
    }, params);
  }

  private executeSmartTableSearch(params: HttpParams): void {
    const cleanedParams = this.removeEmptyParam(params);
    const paginatedParams = cleanedParams
      .set('pageNumber', '1')
      .set('pageSize', environment.INTEGER_MAX_VALUE.toString());

    const apiUrl = `/api/v1/${this.configForm?.moduleName}/${this.configForm?.name}`;

    this.apiService.get(apiUrl, paginatedParams).subscribe(res => {
      this.smartTableControl.setValue(res);
    });
  }

  private removeEmptyParam(params: HttpParams): HttpParams {
    const emptyKeys = params.keys().filter(key => !params.get(key));
    return emptyKeys.reduce((result, key) => result.delete(key), params);
  }

  private executeStandardSearch(context: SearchContext): void {
    if (!this.isSearchFormValid()) return;

    const params = this.prepareStandardSearchParams(context.params);
    const url = this.buildSearchUrl(context.queryString, context.dateQueryString);

    this._fillData(url, params, environment.BASE_URL);
  }

  private isSearchFormValid(): boolean {
    return this.searchForm.valid &&
          (!this.formAdvanceSearch || this.formAdvanceSearch.valid);
  }

  private prepareStandardSearchParams(params: HttpParams): HttpParams {
    let updatedParams = this.addSortParams(params);
    updatedParams = this.removeInvalidParamValues(updatedParams);
    return updatedParams;
  }

  private addSortParams(params: HttpParams): HttpParams {
    const sortBy = this.configForm?.sortBy;

    if (!sortBy) return params;

    const sortDirection = this.configForm?.sortDirection ?? 'desc';
    return params.set('sortBy', sortBy).set('sortDirection', sortDirection);
  }

  private removeInvalidParamValues(params: HttpParams): HttpParams {
    const validEntries = params.keys()
      .filter(key => {
        const value = params.get(key);
        return value !== '-1' && value !== null && !this.fields.find(field => field.name === key)?.skipQueryParam;
      })
      .map(key => [key, params.get(key) as string]);

    return new HttpParams({ fromObject: Object.fromEntries(validEntries) });
  }

  private buildSearchUrl(queryString: string, dateQueryString: string): string {
    const basePath = `${environment.PATH_API_V1}/${this.configForm?.moduleName}/${this.configForm?.name}`;
    const dateQuery = dateQueryString ? dateQueryString.replace(/&$/, '') : '';

    return `${basePath}${queryString}${dateQuery}`;
  }

  onResetForm(fieldName?: string) {
    // Lưu giá trị hiện tại của form nâng cao (nếu có)
    const currentFormAdvanceValue = this.formAdvanceSearch?.value || {};
    // Reset toàn bộ form
    this.searchForm.reset();
    if (this.configForm?.filterForm) {
      // Xử lý riêng cho các Combobox : Set giá trị về empty string ("") (với chọn 1 giá trị)
      // hoặc [] (với chọn nhiều giá trị) thay vì null để hiển thị placeholder "Chọn dữ liệu"
      const comboboxFields = this.fields
        .filter(field => field.type === FieldType.COMBOBOX)
        .reduce((acc: any, field) => {
          acc[field.name] = field.isMultiSelect ? [] : "";
          return acc;
        }, {});     
      const ignoreResetFields = this.fields.filter((item: any) => item.ignoreReset);
      const ignoreResetFieldsValue = ignoreResetFields.reduce((acc: any, field) => {
        acc[field.name] = currentFormAdvanceValue[field.name];
        return acc;
      }, {});      

      // Update giá trị cho các combobox field trong form nâng cao (nếu có)
      if (Object.keys(comboboxFields).length > 0) {
        this.formAdvanceSearch?.patchValue(comboboxFields);
        this.searchForm?.patchValue(comboboxFields)
      }
      if(ignoreResetFields.length > 0) {
        this.formAdvanceSearch?.patchValue(ignoreResetFieldsValue);
      }      
    }
    this.search()
  }

  addOrEdit(row?: any) {
    if (row) {
      if (this.configForm?.isPopupViewEdit && this.showPopupViewEdit) {
        this.showPopupViewEdit(row, 'UPDATE')
        return
      }
      if (row?.camundaProcessInstanceId && row.camundaMenuUrl) {
        const baseUrl = row?.camundaMenuUrl?.includes('{id}')
          ? row.camundaMenuUrl.replace('{id}', row.id)
          : row.camundaMenuUrl;
        this.router.navigateByUrl(
          baseUrl, {
            state: {
              edit: true,
              menuUrl: row?.camundaMenuUrl
            }
          }).then();
      } else {
        this.router.navigate([this.router.url, 'edit', row.id]).then();
      }
    } else {
      this.router.navigate([this.router.url, 'add']).then();
    }
  }

  viewDetail(row: any) {
    if (this.configForm?.isPopupViewEdit && !this.configForm.isPopupOnlyEdit && this.showPopupViewEdit) {
      this.showPopupViewEdit(row, 'VIEW')
      return
    }
    if (row?.camundaProcessInstanceId && row.camundaMenuUrl) {
      const baseUrl = row?.camundaMenuUrl?.includes('{id}')
        ? row.camundaMenuUrl.replace('{id}', row.id)
        : row.camundaMenuUrl;
      this.router.navigateByUrl(
        baseUrl, {
          state: {
            menuUrl: row?.camundaMenuUrl,
            isCompleted: this.formAdvanceSearch?.value.isCompleted
          }
        }).then();
    } else {
      this.router.navigate([this.router.url, 'detail', row.id]).then();
    }
  }

  accept(row: any) {
    this.onHandleAction(row?.id, ActionType.APPROVE);
  }

  reject(row: any) {
    this.onHandleAction(row?.id, ActionType.REJECT);
  }

  deleteFinalBalanceConfig(row: any) {
    this.onHandDeleteFinalBalanceConfig(row?.id, ActionType.REJECT);
  }

  copy(row: any) {
    if (row) {
      this.router.navigate([this.router.url, 'copy'], {queryParams: {id: row?.id}}).then();
    }
  }

  onViewProcess(row: any) {
    this.viewProcess.emit(row);
  }

  onDeleteItemOnTable(row: any) {
    this.deleteItemOnTable.emit(row?.id);
  }

  onDownloadItemOnTable(row: any) {
    this.downloadItemOnTable.emit(row);
  }

  handleOpenPreviewPopup(e: any) {
    this.onOpenPreviewPopup.emit(e);
  }

  onExport(e: any) {
    this.handleExport.emit(e)
  }

  onUpload() {
    this.handleUpload.emit();
  }

  onDownload() {
    this.handleDownload.emit();
  }

  onHandleAction(rowId: any, actionType: ActionType) {
    const actionUrl = `${environment.PATH_API_V1}/${this.configForm?.moduleName}/${this.configForm?.name}/${rowId}/${actionType}`;

    const apiCall = this.apiService.post(actionUrl, '');

    this.utilsService.execute(
      apiCall,
      this.onSuccessFunc,
      `common.${actionType}.success`,
      `common.title.confirm`,
      [`${this.configForm?.moduleName}.`],
      `common.confirm.${actionType}`,
      undefined,
      undefined,
      "common.button.confirm", // Nút Xác nhận
      "common.button.back" // Nút Quay lại
    );
  }

  onHandDeleteFinalBalanceConfig(rowId: any, actionType: ActionType) {
    const actionUrl = `${environment.PATH_API_V1}/${this.configForm?.moduleName}/${this.configForm?.name}/${rowId}/${actionType}`;

    const apiCall = this.apiService.post(actionUrl, '');

    this.utilsService.execute(
      apiCall,
      this.onSuccessFunc,
      `delete.final-balance-config.success`,
      `common.title.confirm`,
      [`${this.configForm?.moduleName}.`],
      `delete.final-balance-config`,
      undefined,
      undefined,
      "common.button.confirm", // Nút Xác nhận
      "common.button.back" // Nút Quay lại
    );
  }

  onExportExcel() {
    const params = new HttpParams().set('isExportPdf', 'false');
    this.apiService.saveFile(
      '/export-data/car',
      this.params2Object(this.collectParams()),
      {
        params,
      }
    );

  }

  onChangeDisplayColumnInternal($event: { [p: string]: any }) {
    this.columns.forEach(col => {
      const elements = this.el.nativeElement.getElementsByClassName(
        Utils.getKeyTrans(this.configForm?.moduleName, this.configForm?.name, col.columnDef))
      for (let i = 0; i < elements.length; i++) {
        this.renderer.setStyle(elements[i], 'display', $event[col.columnDef] ? 'flex' : 'none');
      }
    })
  }

  afterSearch = (data: TablePagingResponseModel) => {
    if (this.afterSearchFn && data && data.content) {
      let dataTable: MatTableDataSource<BaseModel> = new MatTableDataSource<BaseModel>();
      dataTable.data = this.afterSearchFn(data).content
      this.results = dataTable
    }
    if (this.checkboxColumn) {
      for (const item of data.content) {
        item.checked = !!this.selected.find((i) => i[this.trackBy] == item[this.mapBy]);
        this.checkboxColumn.onCellValueChange?.(item);
      }
      this.table.selectAllChecked = data.content.every((item) => item.checked);
    }
  };

  private generateFieldsFromConfig(filterForm: FieldModel[]): FieldModel[] {
    if (!this.configForm?.filterForm) return [];

    return [...filterForm, ...LIST_FIELD_CONSTANT].map(item => {
      if (item.type === FieldType.DATE_RANGE) {
        const fromDate: FieldModel = {} as FieldModel;
        Object.assign(fromDate, item);
        fromDate.type = FieldType.DATE;
        fromDate.name = 'from' + fromDate.name.replace(/^\w/, (c) => c.toUpperCase());
        const toDate: FieldModel = {} as FieldModel;
        Object.assign(toDate, item);
        toDate.type = FieldType.DATE;
        toDate.name = 'to' + toDate.name.replace(/^\w/, (c) => c.toUpperCase());
        return [item, fromDate, toDate];
      }
      return item;
    }).flat();
  }

  onSubmit(): void {
    this.table.goToPageNumber = 1;
    super.onSubmit();
  }

  private buildFieldMap() {
    return Object.fromEntries(
      this.fields
        .filter(x => !this.isDateField(x.type))
        .map(s => [s.name, s.name])
    );
  }

  private buildBaseParams(map: any): HttpParams {
    return this._collectParams(this.searchForm, map);
  }

  private applyAdvanceSearch(params: HttpParams, map: any): HttpParams {
    const advanceForm = this.searchForm.get('formAdvanceSearch') as FormGroup;

    let result = this._collectParams(advanceForm, map);
    result = this.appendNonDateFields(result);

    return result;
  }

  private appendNonDateFields(params: HttpParams): HttpParams {
    return LIST_FIELD_CONSTANT
      .filter(x => !this.isDateField(x.type))
      .reduce((acc, x) => {
        const value = this.searchForm.get(x.name)?.value;
        return value ? acc.set(x.name, value) : acc;
      }, params);
  }

  private applyConvertFn(params: HttpParams): HttpParams {
    if (!this.convertField2HttpParamFn) return params;

    let result = this.convertField2HttpParamFn(params, this.searchForm);

    if (this.formAdvanceSearch) {
      const advanceForm = this.searchForm.get('formAdvanceSearch') as FormGroup;
      result = this.convertField2HttpParamFn(result, advanceForm);
    }

    return result;
  }

  private applySelectedFields(params: HttpParams): HttpParams {
    return this.configForm?.tableField
      ? params.set("selectedFields", this.configForm.tableField)
      : params;
  }

  private isDateField(type: FieldType) {
    return type === FieldType.DATE || type === FieldType.DATE_RANGE;
  }
}
