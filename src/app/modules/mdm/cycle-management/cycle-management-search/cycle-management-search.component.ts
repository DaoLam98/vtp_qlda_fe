import { HttpParams } from '@angular/common/http';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlignEnum,
  ApiService,
  AuthoritiesService,
  ButtonModel,
  ColumnModel,
  CvaFlatTreeComponent,
  DateUtilService,
  FlatTreeNodeModel,
  IconTypeEnum,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import { TranslateService } from '@ngx-translate/core';
import { lastValueFrom, map } from 'rxjs';
import { Config } from 'src/app/common/models/config.model';
import { SelectValuesService } from 'src/app/core/services/selectValues.service';
import { FORM_CONFIG } from 'src/app/modules/mdm/cycle-management/cycle-management-search/cycle-management-search.config';
import type { CloudSearchComponent } from 'src/app/shared/components/base-search/cloud-search.component';
import { EnumUtil } from 'src/app/shared/utils/enum.util';
import { PermissionCheckingUtil } from 'src/app/shared/utils/permission-checking.util';
import { Utils } from 'src/app/shared/utils/utils';
import { environment } from 'src/environments/environment';
import { CycleManagementModel, CycleManagementStatusEnum } from '../../_models/cycle-management.model';
import { PopupAddCycleManagementComponent } from '../popup-add-cycle-management/popup-add-cycle-management.component';

@Component({
  selector: 'app-cycle-management-search',
  templateUrl: './cycle-management-search.component.html',
  styleUrl: 'cycle-management-search.component.scss',
  standalone: false,
})
export class CycleManagementSearchComponent implements OnInit {
  @ViewChild('cloudSearchRef', { static: true }) cloudSearchComponent!: CloudSearchComponent;
  @ViewChild('treeRef', { static: true }) treeComponent!: CvaFlatTreeComponent;
  columns: ColumnModel[] = [];
  buttons: ButtonModel[] = [];
  configForm!: Config;
  formAdvanceSearch?: FormGroup;
  yearTree: FlatTreeNodeModel[] = [];
  statusValues: SelectModel[] = [];
  selectedTreeNode!: FlatTreeNodeModel;
  protected readonly environment = environment;
  protected readonly Utils = Utils;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected apiService: ApiService,
    protected utilsService: UtilsService,
    protected matDialog: MatDialog,
    protected translateService: TranslateService,
    protected injector: Injector,
    protected activatedRoute: ActivatedRoute,
    protected authoritiesService: AuthoritiesService,
    protected selectValuesService: SelectValuesService,
    protected dateUtilService: DateUtilService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
  ) {
    this.configForm = FORM_CONFIG;

    this.formAdvanceSearch = formBuilder.group(
      this.configForm.filterForm!.reduce((result: any, item) => {
        result[item.name] = ['', item.validate ?? []];
        return result;
      }, {}),
    );

    this.columns.push(
      {
        columnDef: 'period',
        header: 'period',
        className: 'mat-column-code',
        title: (e: CycleManagementModel) => `${e.periodCode || ''}`,
        cell: (e: CycleManagementModel) => `${e.periodCode || ''}`,
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'startDate',
        header: 'startDate',
        title: (e: CycleManagementModel) =>
          this.dateUtilService.convertDateToDisplayServerTime(e.startDate || '') || '',
        cell: (e: CycleManagementModel) => this.dateUtilService.convertDateToDisplayServerTime(e.startDate || '') || '',
        className: 'mat-column-name',
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'endDate',
        header: 'endDate',
        className: 'mat-column-jobPosition',
        title: (e: CycleManagementModel) => this.dateUtilService.convertDateToDisplayServerTime(e.endDate || '') || '',
        cell: (e: CycleManagementModel) => this.dateUtilService.convertDateToDisplayServerTime(e.endDate || '') || '',
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'status',
        header: 'status',
        title: (e: CycleManagementModel) =>
          `${e.cycleStatus ? this.utilsService.getEnumValueTranslated(CycleManagementStatusEnum, e.cycleStatus) : ''}`,
        cell: (e: CycleManagementModel) =>
          `${e.cycleStatus ? this.utilsService.getEnumValueTranslated(CycleManagementStatusEnum, e.cycleStatus) : ''}`,
        className: 'mat-column-status',
        align: AlignEnum.CENTER,
      },
    );

    this.buttons.push(
      {
        columnDef: 'detail',
        header: 'common.table.action.title',
        color: 'warn',
        icon: 'fa fa-eye',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'viewDetail',
        className: 'primary',
        title: 'common.title.detail',
        display: (e: CycleManagementModel) => true,
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'edit',
        header: 'common.table.action.title',
        color: 'warn',
        icon: 'fa fa-pen',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'addOrEdit',
        className: 'primary',
        title: 'common.title.edit',
        display: (e: CycleManagementModel) => true,
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'accept',
        color: 'primary',
        icon: 'fa fa-check',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'accept',
        className: 'primary',
        title: 'mdm.cycle-management.button.open',
        display: (e: CycleManagementModel) => true,
        disabled: (e: CycleManagementModel) => e.cycleStatus === 'OPEN',
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'reject',
        color: 'warn',
        icon: 'fa fa-ban',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'reject',
        className: 'primary',
        title: 'mdm.cycle-management.button.close',
        display: (e: CycleManagementModel) => true,
        disabled: (e: CycleManagementModel) => e.cycleStatus === 'CLOSE',
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
    );
  }

  ngOnInit() {
    EnumUtil.enum2SelectModel(CycleManagementStatusEnum, this.statusValues, 'EDIT');
    this.getYear();
    this.cloudSearchComponent.accept = (row: CycleManagementModel) => this.onUpdateCycleStatus(row, 'open');
    this.cloudSearchComponent.reject = (row: CycleManagementModel) => this.onUpdateCycleStatus(row, 'close');
  }

  addBtnFunction = () => {
    this.matDialog
      .open(PopupAddCycleManagementComponent, {
        disableClose: false,
        width: '1000px',
        maxWidth: '90vw',
        maxHeight: '90vh',
      })
      .afterClosed()
      .subscribe(async (res) => {
        if (res) {
          await this.getYear();
          this.cloudSearchComponent.onSubmit();
        }
      });
  };

  onChooseYear(event: FlatTreeNodeModel) {
    event && (this.selectedTreeNode = event);
    this.cloudSearchComponent.onSubmit();
  }

  convertField2HttpParamFn(param: HttpParams, formGroup: FormGroup) {
    return this.selectedTreeNode ? param.set('year', +this.selectedTreeNode?.value) : param;
  }

  onUpdateCycleStatus(row: CycleManagementModel, status: 'open' | 'close') {
    const formData = new FormData();
    formData.append('body', this.utilsService.toBlobJon({ ...row, cycleStatus: status.toUpperCase() }));
    const apiCall = this.apiService.put(`${environment.PATH_API_V1}/mdm/cycle-management/${row.id}`, formData);
    this.utilsService.execute(
      apiCall,
      this.cloudSearchComponent.onSuccessFunc,
      `mdm.cycle-management.${status}.success`,
      'common.title.confirm',
      undefined,
      `mdm.cycle-management.confirm.${status}`,
      undefined,
      undefined,
      'common.button.confirm',
      'common.button.back',
    );
  }

  async getYear() {
    this.yearTree = await lastValueFrom(
      this.selectValuesService
        .getRawDataFromModulePath(`${environment.PATH_API_V1}/mdm/cycle-management`, [
          { key: 'selectedFields', value: 'id,year' },
          { key: 'sortBy', value: 'year' },
          { key: 'sortDirection', value: 'desc' },
        ])
        .pipe(
          map((res) =>
            Utils.uniqBy(
              res.map((item) => ({ value: item.year, displayValue: `${item.year}`, level: 0 })),
              'value',
            ),
          ),
        ),
    );
    if (this.yearTree.length > 0) {
      this.selectedTreeNode = this.yearTree[0];
      this.treeComponent.onLeafNodeClick(this.selectedTreeNode);
    }
  }

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }
}
