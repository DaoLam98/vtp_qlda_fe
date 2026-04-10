import {Component} from '@angular/core';
import {FORM_CONFIG} from 'src/app/modules/mdm/permission/permission-search/permission-search.config';
import {
  AlignEnum,
  ApiService,
  AuthoritiesService,
  BaseStatusEnum,
  ButtonModel,
  ColumnModel,
  IconTypeEnum,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Config} from 'src/app/common/models/config.model';
import {PermissionModel} from 'src/app/modules/mdm/_models/permission.model';
import {Utils} from 'src/app/shared/utils/utils';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {Observable, of} from 'rxjs';
import {environment} from "src/environments/environment";

@Component({
  selector: 'app-permission-search',
  standalone: false,
  templateUrl: './permission-search.component.html'
})
export class PermissionSearchComponent {

  configForm: Config;
  formAdvanceSearch: FormGroup;
  columns: ColumnModel[] = [];
  buttons: ButtonModel[] = [];
  statusValues$: Observable<SelectModel[]>;
  formFieldDisplay: { [key: string]: boolean } = {};
  permissionValues$: Observable<SelectModel[]> = of([]);

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected apiService: ApiService,
    protected utilsService: UtilsService,
    protected translateService: TranslateService,
    protected authoritiesService: AuthoritiesService,
    protected selectService: SelectValuesService
  ) {
    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.formAdvanceSearch = formBuilder.group(this.configForm.filterForm!.reduce((result: any, item) => {
      result[item.name] = item.validate;
      return result;
    }, {}));

    this.columns.push(
      {
        columnDef: 'code',
        header: 'code',
        title: (e: PermissionModel) => `${e.code || ''}`,
        cell: (e: PermissionModel) => `${e.code || ''}`,
        className: 'mat-column-code',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'name',
        header: 'name',
        title: (e: PermissionModel) => `${e.name || ''}`,
        cell: (e: PermissionModel) => `${e.name || ''}`,
        className: 'mat-column-name',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'parentName',
        header: 'parentName',
        title: (e: PermissionModel) => `${e.parentName || ''}`,
        cell: (e: PermissionModel) => `${e.parentName || ''}`,
        className: 'mat-column-parentName',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'status',
        header: 'status',
        title: (e: PermissionModel) => `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
        cell: (e: PermissionModel) => `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
        className: 'mat-column-status',
        isExpandOptionColumn: () => false,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
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
        display: (e: PermissionModel) => true,
      },
      {
        columnDef: 'accept',
          color: 'primary',
        icon: 'fa fa-check',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'accept',
        className: 'primary content-cell-align-center',
        title: 'common.title.accept',
        display: (e: PermissionModel) => true,
        disabled: (e: PermissionModel) => e?.status === 'APPROVED',
        header: "common.table.action.title",
        alignHeader: AlignEnum.CENTER
      },
      {
        columnDef: 'reject',
          color: 'warn',
        icon: 'fa fa-ban',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'reject',
        className: 'primary content-cell-align-center',
        title: 'common.title.reject',
        display: (e: PermissionModel) => true,
        disabled: (e: PermissionModel) => e?.status === 'REJECTED',
        header: "common.table.action.title",
        alignHeader: AlignEnum.CENTER
      },
    );
    this.statusValues$ = this.selectService.getStatus()
    this.formFieldDisplay = this.columns.reduce((result: any, item) => {
      result[item.columnDef] = true;
      return result;
    }, {});

    this.permissionValues$ = this.selectService.getAutocompleteValuesFromModulePath(`${environment.PATH_API_V1}/mdm/permissions`)
  }

  onChangeDisplayColumn($event: { [key: string]: boolean }) {
    this.formFieldDisplay = $event;
  }

  protected readonly Utils = Utils;
  protected readonly environment = environment;
}
