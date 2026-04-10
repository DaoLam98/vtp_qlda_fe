import {Component, OnInit} from "@angular/core";
import {
  AlignEnum,
  ApiService,
  AuthoritiesService,
  BaseStatusEnum,
  ButtonModel,
  ColumnModel,
  ColumnTypeEnum,
  IconTypeEnum,
  SelectModel,
  UtilsService,
} from "@c10t/nice-component-library";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {FORM_CONFIG, getDatatypeOptions} from "./attribute-search.config";
import {Utils} from "../../../../shared/utils/utils";
import {Config} from "src/app/common/models/config.model";
import {AttributeDetailModel} from "src/app/modules/mdm/_models/attribute.model";
import {SelectValuesService} from "src/app/core/services/selectValues.service";
import {HttpParams} from "@angular/common/http";
import {environment} from "src/environments/environment";
import {map} from "rxjs";
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";

@Component({
  selector: "app-attribute-search",
  standalone: false,
  templateUrl: "./attribute-search.component.html"
})
export class AttributeSearchComponent implements OnInit {
  moduleName: string = "mdm.attribute";
  Utils = Utils;
  configForm: Config;
  formAdvanceSearch: FormGroup;

  propertyColumns: ColumnModel[] = [];
  buttons: ButtonModel[] = [];
  statusOptions$ = this.selectService.getStatus();
  datatypeOptions = getDatatypeOptions(true);
  requireOptions: SelectModel[] = [
    {
      value: -1,
      disabled: false,
      displayValue: this.translateService.instant("common.combobox.option.default"),
      rawData: -1,
    },
    {
      displayValue: `${this.moduleName}.form.require.option.require`,
      value: "true",
      rawData: "true",
      disabled: false
    },
    {
      displayValue: `${this.moduleName}.form.require.option.notRequire`,
      value: "false",
      rawData: "false",
      disabled: false
    },
  ];
  referenceTableOptions: SelectModel[] = [];
  referenceTableMap: Map<string, string> = new Map();

  protected readonly environment = environment;

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? "", this.configForm?.name ?? "");
  }

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected apiService: ApiService,
    protected utilsService: UtilsService,
    protected translateService: TranslateService,
    protected authoritiesService: AuthoritiesService,
    protected selectService: SelectValuesService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
  ) {
    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.formAdvanceSearch = formBuilder.group(this.configForm.filterForm!.reduce((result: any, item) => {
      result[item.name] = item.validate;
      return result;
    }, {}));

    this.propertyColumns.push(
      {
        columnDef: "name",
        header: "name",
        className: "mat-column-name",
        title: (e: AttributeDetailModel) => `${e.name || ""}`,
        cell: (e: AttributeDetailModel) => `${e.name || ""}`,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: "datatype",
        header: "datatype",
        className: "mat-column-datatype",
        title: (e: AttributeDetailModel) => `${e.datatype || ""}`,
        cell: (e: AttributeDetailModel) => `${e.datatype || ""}`,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: "require", // columnDef phải giống trường trong API thì checkbox mới nhận dữ liệu
        header: "require",
        className: "mat-column-require",
        title: (e: AttributeDetailModel) => `${e.require}`,
        cell: (e: AttributeDetailModel) => `${e.require}`,
        columnType: (e) => e ? ColumnTypeEnum.CHECKBOX : ColumnTypeEnum.VIEW,
        disabled: () => true,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
      {
        columnDef: "referenceTable",
        header: "referenceTable",
        className: "mat-column-referenceTable",
        title: (e: AttributeDetailModel) => `${this.referenceTableMap.get(
          e.referenceTable || "") ? this.translateService.instant(
          this.referenceTableMap.get(e.referenceTable || "") ?? "") : ""}`,
        cell: (e: AttributeDetailModel) => `${this.referenceTableMap.get(
          e.referenceTable || "") ? this.translateService.instant(
          this.referenceTableMap.get(e.referenceTable || "") ?? "") : ""}`,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: "status",
        header: "status",
        className: "mat-column-status",
        title: (e: AttributeDetailModel) => `${e.status ? this.utilsService.getEnumValueTranslated(
          BaseStatusEnum, e.status) : ""}`,
        cell: (e: AttributeDetailModel) => `${e.status ? this.utilsService.getEnumValueTranslated(
          BaseStatusEnum, e.status) : ""}`,
        isExpandOptionColumn: () => false, // Hàm chứa điều kiện để hiển thị nút "Ẩn hiện các cột"
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
    );

    this.buttons.push(
      {
        columnDef: "detail",
        color: "warn",
        icon: "fa fa-eye",
        iconType: IconTypeEnum.FONT_AWESOME,
        click: "viewDetail",
        className: "primary content-cell-align-center",
        title: "common.title.detail",
        display: (e: AttributeDetailModel) => true,
        header: "common.table.action.title",
        alignHeader: AlignEnum.CENTER
      },
      {
        columnDef: "edit", // Chỉ để hiển thị tên để phân biệt
        color: "warn",     // Màu của nút
        icon: "fa fa-pen", // icon của nút
        iconType: IconTypeEnum.FONT_AWESOME, // Thư viện sử dụng icon (Fontawesome)
        click: "addOrEdit", // Tên hàm để gọi khi nhấn click, hàm này đã định nghĩa trong CloudSearchComponent
        className: "primary content-cell-align-center",
        title: "common.title.edit", // Tên của nút bấm
        display: (e: AttributeDetailModel) => true, // Hàm chứa điều kiện để hiển thị nút (sử dụng trong phân quyền)
        disabled: (e: AttributeDetailModel) => false, // Hàm chứa điều kiện để disable nút (sử dụng trong phân quyền)
        header: "common.table.action.title", // Hiển thị tiêu đề của cột chứa các nút, sẽ chạy từ trên xuống dưới, gặp header nào trước thì lấy giá trị đó
        alignHeader: AlignEnum.CENTER // Căn vị trí của nút trong ô
      },
      {
        columnDef: "accept",
        color: "primary",
        icon: "fa fa-check",
        iconType: IconTypeEnum.FONT_AWESOME,
        click: "accept",
        className: "primary content-cell-align-center",
        title: "common.title.accept",
        display: (e: AttributeDetailModel) => true,
        disabled: (e: AttributeDetailModel) => e.status === "APPROVED",
      },
      {
        columnDef: "reject",
        color: "warn",
        icon: "fa fa-ban",
        iconType: IconTypeEnum.FONT_AWESOME,
        click: "reject",
        className: "primary content-cell-align-center",
        title: "common.title.reject",
        display: (e: AttributeDetailModel) => true,
        disabled: (e: AttributeDetailModel) => e.status === "REJECTED",
      },
    );
  }

  ngOnInit() {
    this.callAPIGetTableList();
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

          options.unshift({
            value: -1,
            disabled: false,
            displayValue: this.translateService.instant("common.combobox.option.default"),
            rawData: -1,
          });

          return options;
        }))
      .subscribe((options: SelectModel[]) => {
          this.referenceTableOptions = options;
        }
      );
  }
}
