import {Component} from '@angular/core';
import {
  AlignEnum,
  ApiService,
  AuthoritiesService,
  BaseStatusEnum,
  ButtonModel,
  ColumnModel,
  IconTypeEnum,
  UtilsService,
} from '@c10t/nice-component-library';
import {Config} from 'src/app/common/models/config.model';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {FORM_CONFIG} from 'src/app/modules/mdm/role/role-search/role-search.config';
import {Utils} from 'src/app/shared/utils/utils';
import {RoleDetailModel} from "src/app/modules/mdm/_models/role.model";
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {environment} from "src/environments/environment";

@Component({
  selector: 'app-role-search',
  standalone: false,
  templateUrl: './role-search.component.html'
})
export class RoleSearchComponent {
  Utils = Utils;
  configForm: Config;
  formAdvanceSearch: FormGroup;

  columns: ColumnModel[] = [];
  buttons: ButtonModel[] = [];
  moduleName: string = 'mdm.role';
  statusOptions$ = this.selectService.getStatus();

  protected readonly environment = environment;

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

    this.columns.push(
      {
        columnDef: 'code', // Chưa xác định
        header: 'code',  // Sử dụng trong file đa ngôn ngữ. Ví dụ : mdm.role.table.header.code
        title: (e: RoleDetailModel) => `${e.code || ''}`, // Hàm hiển thị giá trị của tooltip, code là trường trong API
        cell: (e: RoleDetailModel) => `${e.code || ''}`, // Hàm hiển thị giá trị của ô trong bảng, code là trường trong API
        className: 'mat-column-code', // class để CSS từng ô trong 1 cột (bao gồm cả header và cell)
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT
      },
      {
        columnDef: 'name',
        header: 'name',
        title: (e: RoleDetailModel) => `${e.name || ''}`,
        cell: (e: RoleDetailModel) => `${e.name || ''}`,
        className: 'mat-column-name',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT
      },
      {
        columnDef: 'status',
        header: 'status',
        title: (e: RoleDetailModel) => `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
        cell: (e: RoleDetailModel) => `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
        className: 'mat-column-status',
        isExpandOptionColumn: () => false, // Hàm chứa điều kiện để hiển thị nút "Ẩn hiện các cột"
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER
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
        display: (e: RoleDetailModel) => true,
        header: "common.table.action.title",
        alignHeader: AlignEnum.CENTER
      },
      {
        columnDef: 'edit', // Chỉ để hiển thị tên để phân biệt
        color: 'warn',     // Màu của nút
        icon: 'fa fa-pen', // icon của nút
        iconType: IconTypeEnum.FONT_AWESOME, // Thư viện sử dụng icon (Fontawesome)
        click: 'addOrEdit', // Tên hàm để gọi khi nhấn click, hàm này đã định nghĩa trong CloudSearchComponent
        className: 'primary content-cell-align-center',
        title: 'common.title.edit', // Tên của nút bấm
        display: (e: RoleDetailModel) => true, // Hàm chứa điều kiện để hiển thị nút (sử dụng trong phân quyền)
        disabled: (e: RoleDetailModel) => false, // Hàm chứa điều kiện để disable nút (sử dụng trong phân quyền)
        header: "common.table.action.title", // Hiển thị tiêu đề của cột chứa các nút, sẽ chạy từ trên xuống dưới, gặp header nào trước thì lấy giá trị đó
        alignHeader: AlignEnum.CENTER // Căn vị trí của nút trong ô
      },
      {
        columnDef: 'accept',
        color: 'primary',
        icon: 'fa fa-check',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'accept',
        className: 'primary content-cell-align-center',
        title: 'common.title.accept',
        display: (e: RoleDetailModel) => true,
        disabled: (e: RoleDetailModel) => e.status === 'APPROVED',
      },
      {
        columnDef: 'reject',
        color: 'warn',
        icon: 'fa fa-ban',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'reject',
        className: 'primary content-cell-align-center',
        title: 'common.title.reject',
        display: (e: RoleDetailModel) => true,
        disabled: (e: RoleDetailModel) => e.status === 'REJECTED',
      },
    );
  }

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }
}
