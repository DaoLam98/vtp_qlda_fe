import {Component} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {
  AlignEnum,
  BaseStatusEnum,
  ButtonModel,
  ColumnModel,
  IconTypeEnum,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import {Observable} from 'rxjs/dist/types';
import {Config} from 'src/app/common/models/config.model';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {Utils} from 'src/app/shared/utils/utils';
import {FORM_CONFIG} from './config-vo-search.config';
import {ConfigVOModel} from "src/app/modules/mdm/_models/config-vo.model";
import {of} from "rxjs";
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {environment} from "src/environments/environment";

@Component({
  selector: 'app-config-vo-search',
  standalone: false,
  templateUrl: './config-vo-search.component.html',
})
export class ConfigVoSearchComponent {
  configForm: Config;
  formAdvanceSearch: FormGroup;
  columns: ColumnModel[] = [];
  buttons: ButtonModel[] = [];

  menuValues$: Observable<SelectModel[]> = of([]);
  statusValues$: Observable<SelectModel[]> = this.selectService.getStatus();

  protected readonly Utils = Utils;
  protected readonly environment = environment;

  constructor(
    protected formBuilder: FormBuilder,
    protected selectService: SelectValuesService,
    protected utilsService: UtilsService,
    protected selectValuesService: SelectValuesService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
  ) {
    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.formAdvanceSearch = formBuilder.group(
      this.configForm.filterForm!.reduce((result: any, item) => {
        result[item.name] = item.validate;
        return result;
      }, {}),
    );

    this.columns.push(
      {
        columnDef: 'code',
        header: 'code',
        className: 'mat-column-code',
        title: (e: ConfigVOModel) => `${e.code || ''}`,
        cell: (e: ConfigVOModel) => `${e.code || ''}`,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT
      },
      {
        columnDef: 'title',
        header: 'title',
        className: 'mat-column-title',
        title: (e: ConfigVOModel) => `${e.title || ''}`,
        cell: (e: ConfigVOModel) => `${e.title || ''}`,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT
      },
      {
        columnDef: 'menuId',
        header: 'menuId',
        className: 'mat-column-menuId',
        title: (e: ConfigVOModel) => `${e.menuName || ''}`,
        cell: (e: ConfigVOModel) => `${e.menuName || ''}`,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT
      },
      {
        columnDef: 'status',
        header: 'status',
        className: 'mat-column-status',
        title: (e: ConfigVOModel) =>
          `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
        cell: (e: ConfigVOModel) =>
          `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
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
        display: (e: ConfigVOModel) => true,
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'edit',
        color: 'warn',
        icon: 'fa fa-pen',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'addOrEdit',
        className: 'primary content-cell-align-center',
        title: 'common.title.edit',
        display: (e: ConfigVOModel) => true,
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
        display: (e: ConfigVOModel) => true,
        disabled: (e: ConfigVOModel) => e.status === 'APPROVED',
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
        display: (e: ConfigVOModel) => true,
        disabled: (e: ConfigVOModel) => e.status === 'REJECTED',
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
    );

    this.menuValues$ =  this.selectService.getAutocompleteValuesFromModulePath(`${environment.PATH_API_V1}/mdm/menu`);
  }

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }
}
