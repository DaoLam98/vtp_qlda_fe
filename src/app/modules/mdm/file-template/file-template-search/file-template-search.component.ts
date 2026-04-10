import {Component} from '@angular/core';
import {Config} from 'src/app/common/models/config.model';
import {FormBuilder, FormGroup} from '@angular/forms';
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
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {
  FORM_CONFIG,
  getTypeValues
} from 'src/app/modules/mdm/file-template/file-template-search/file-template-search.config';
import {Utils} from 'src/app/shared/utils/utils';
import {FileTemplateModel} from 'src/app/core';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {Observable} from 'rxjs';
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {environment} from "src/environments/environment";

@Component({
  selector: 'app-file-template-search',
  standalone: false,
  templateUrl: './file-template-search.component.html',
})
export class FileTemplateSearchComponent {
  configForm: Config;
  formAdvanceSearch?: FormGroup;

  Utils = Utils
  columns: ColumnModel[] = [];
  buttons: ButtonModel[] = [];
  statusValues$: Observable<SelectModel[]>;

  typeValues: SelectModel[] = getTypeValues(true);

  protected readonly environment = environment;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected apiService: ApiService,
    protected utilsService: UtilsService,
    protected translateService: TranslateService,
    protected authoritiesService: AuthoritiesService,
    protected selectValuesService: SelectValuesService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
  ) {
    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.formAdvanceSearch = formBuilder.group(this.configForm.filterForm!.reduce((result: any, item) => {
      result[item.name] = item.validate;
      return result;
    }, {}));

    this.statusValues$ = this.selectValuesService.getStatus()

    this.columns.push(
      {
        columnDef: 'code',
        header: 'code',
        className: 'mat-column-code',
        title: (e: FileTemplateModel) => `${e.code || ''}`,
        cell: (e: FileTemplateModel) => `${e.code || ''}`,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'name',
        header: 'name',
        className: 'mat-column-name',
        title: (e: FileTemplateModel) => `${e.name || ''}`,
        cell: (e: FileTemplateModel) => `${e.name || ''}`,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'type',
        header: 'type',
        className: 'mat-column-type',
        title: (e: FileTemplateModel) => `${e.type === "IMPORT" ? this.translateService.instant('mdm.file-template.type.option.import') : this.translateService.instant('mdm.file-template.type.option.export')}`,
        cell: (e: FileTemplateModel) => `${e.type === "IMPORT" ? this.translateService.instant('mdm.file-template.type.option.import') : this.translateService.instant('mdm.file-template.type.option.export')}`,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'status',
        header: 'status',
        className: 'mat-column-status',
        title: (e: FileTemplateModel) => `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
        cell: (e: FileTemplateModel) => `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
    )

    this.buttons.push(
      {
        columnDef: 'detail',
        color: 'warn',
        icon: 'fa fa-eye',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'viewDetail',
        className: 'primary content-cell-align-center',
        title: 'common.title.detail',
        display: (e: FileTemplateModel) => true,
        header: "common.table.action.title",
        alignHeader: AlignEnum.CENTER
      },
      {
        columnDef: 'edit',
        color: 'warn',
        icon: 'fa fa-pen',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'addOrEdit',
        className: 'primary content-cell-align-center',
        title: 'common.title.edit',
        display: (e: FileTemplateModel) => true,
        header: "common.table.action.title",
        alignHeader: AlignEnum.CENTER
      },
      {
        columnDef: 'accept',
        color: 'primary',
        icon: 'fa fa-check',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'accept',
        className: 'primary content-cell-align-center',
        title: 'common.title.accept',
        display: (e: FileTemplateModel) => true,
        disabled: (e: FileTemplateModel) => e.status === 'APPROVED',
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
        display: (e: FileTemplateModel) => true,
        disabled: (e: FileTemplateModel) => e.status === 'REJECTED',
        header: "common.table.action.title",
        alignHeader: AlignEnum.CENTER
      },
    )
  }

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }
}
