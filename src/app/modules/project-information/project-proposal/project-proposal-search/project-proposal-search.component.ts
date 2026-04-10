import { HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  AlignEnum,
  ApiService,
  AuthoritiesService,
  ButtonClickEvent,
  ButtonModel,
  ColumnModel,
  IconTypeEnum,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import { Observable } from 'rxjs';
import { Config } from 'src/app/common/models/config.model';
import { SelectValuesService } from 'src/app/core/services/selectValues.service';
import { CloudSearchComponent } from 'src/app/shared/components/base-search/cloud-search.component';
import { PermissionCheckingUtil } from 'src/app/shared/utils/permission-checking.util';
import { Utils } from 'src/app/shared/utils/utils';
import { environment } from 'src/environments/environment';
import { ProjectProposalModel, ProjectProposalStatusEnum } from '../../models/project-proposal.model';
import { FORM_CONFIG } from './project-proposal-search.config';
import { MatDialog } from '@angular/material/dialog';
import { PopupUpgradeProjectProposalComponent } from '../popup-upgrade-project-proposal/popup-upgrade-project-proposal.component';
import {
  PopupSyncProjectProposalComponent
} from 'src/app/modules/project-information/project-proposal/popup-sync-project-proposal/popup-sync-project-proposal.component';
import { EnumUtil } from 'src/app/shared/utils/enum.util';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-proposal-search',
  templateUrl: './project-proposal-search.component.html',
  standalone: false,
})
export class ProjectProposalSearchComponent implements AfterViewInit {
  @ViewChild('cloudSearchRef') cloudSearchComponent!: CloudSearchComponent;
  configForm: Config;
  formAdvanceSearch: FormGroup;
  columns: ColumnModel[] = [];
  buttons: ButtonModel[] = [];
  statusValues: SelectModel[] = [];
  organizationValues$: Observable<SelectModel[]>;
  investmentFormValues$: Observable<SelectModel[]>;
  protected readonly Utils = Utils;
  protected readonly environment = environment;

  constructor(
    protected formBuilder: FormBuilder,
    protected selectValuesService: SelectValuesService,
    protected utilsService: UtilsService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
    protected apiService: ApiService,
    protected authoritiesService: AuthoritiesService,
    protected matDialog: MatDialog,
    protected router: Router,
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
        columnDef: 'code',
        header: 'code',
        title: (e: ProjectProposalModel) => `${e.code || ''}`,
        cell: (e: ProjectProposalModel) => `${e.code || ''}`,
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'name',
        header: 'name',
        title: (e: ProjectProposalModel) => `${e.name || ''}`,
        cell: (e: ProjectProposalModel) => `${e.name || ''}`,
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'investmentFormId',
        header: 'investmentFormId',
        title: (e: ProjectProposalModel) => `${e.investmentFormName || ''}`,
        cell: (e: ProjectProposalModel) => `${e.investmentFormName || ''}`,
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'proposingOrgId',
        header: 'proposingOrgId',
        title: (e: ProjectProposalModel) => `${e.proposingOrgName || ''}`,
        cell: (e: ProjectProposalModel) => `${e.proposingOrgName || ''}`,
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'status',
        header: 'status',
        title: (e: ProjectProposalModel) =>
          `${
            e.projectProposalStatus
              ? this.utilsService.getEnumValueTranslated(ProjectProposalStatusEnum, e.projectProposalStatus)
              : ''
          }`,
        cell: (e: ProjectProposalModel) =>
          `${
            e.projectProposalStatus
              ? this.utilsService.getEnumValueTranslated(ProjectProposalStatusEnum, e.projectProposalStatus)
              : ''
          }`,
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
        className: 'primary',
        title: 'common.title.detail',
        display: (e: ProjectProposalModel) => true,
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'edit',
        color: 'warn',
        icon: 'fa fa-pen',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'addOrEdit',
        className: 'primary',
        title: 'common.title.edit',
        display: (e: ProjectProposalModel) => true,
        disabled: (e: ProjectProposalModel) =>
          !(
            e.projectProposalStatus == 'WAITING' ||
            e.projectProposalStatus == 'REJECTED' ||
            e.projectProposalStatus == 'REVOKED'
          ),
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'delete',
        color: 'primary',
        icon: 'fa fa-trash',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'delete',
        className: 'primary mat-column-detail',
        title: 'project.project-proposal.action.delete',
        display: (e: ProjectProposalModel) => this.hasRejectPermission,
        disabled: (e: ProjectProposalModel) => e.projectProposalStatus != 'WAITING',
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'upgrade',
        color: 'primary',
        icon: 'fa fa-arrow-circle-up',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'upgrade',
        className: 'primary mat-column-detail',
        title: 'project.project-proposal.action.upgrade',
        display: (e: ProjectProposalModel) => this.hasUpgradePermission,
        disabled: (e: ProjectProposalModel) => e.projectProposalStatus != 'APPROVED' || !!e.upgraded,
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'cancel',
        color: 'primary',
        icon: 'fa fa-times',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'cancel',
        className: 'primary mat-column-detail',
        title: 'project.project-proposal.action.cancel',
        display: (e: ProjectProposalModel) => this.hasCancelPermission,
        disabled: (e: ProjectProposalModel) =>
          !(e.projectProposalStatus == 'REJECTED' || e.projectProposalStatus == 'REVOKED'),
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'sync',
        color: 'primary',
        icon: 'fas fa-check-square',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'sync',
        className: 'primary mat-column-detail',
        title: 'project.project-proposal.action.sync',
        display: (e: ProjectProposalModel) => this.hasEditPermission,
        disabled: (e: ProjectProposalModel) => e.projectProposalStatus != 'ISSUED',
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
    );

    EnumUtil.enum2SelectModel(ProjectProposalStatusEnum, this.statusValues, 'EDIT');
    this.organizationValues$ = this.selectValuesService.getAutocompleteValuesFromModulePath(
      `${environment.PATH_API_V1}/mdm/organization`,
    );
    this.investmentFormValues$ = this.selectValuesService.getAutocompleteValuesFromModulePath(
      `${environment.PATH_API_V1}/mdm/investment-form`,
    );
  }

  ngAfterViewInit(): void {
    this.cloudSearchComponent.table.clickAction.subscribe((event: ButtonClickEvent) => {
      switch (event.action) {
        case 'delete':
          this.onAction('reject', event.object);
          break;
        case 'upgrade':
          this.matDialog
            .open(PopupUpgradeProjectProposalComponent, {
              disableClose: false,
              width: '1000px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              data: {
                id: event.object.id,
              },
            })
            .afterClosed()
            .subscribe((res) => {
              if (res) {
                this.router.navigate([this.router.url, 'upgrade', res.id]).then();
              }
            });
          break;
        case 'cancel':
          this.onAction('cancel', event.object);
          break;
        case 'sync':
          this.matDialog
            .open(PopupSyncProjectProposalComponent, {
              disableClose: false,
              width: '1000px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              data: {
                data: event.object,
                id: event.object.id,
              },
            })
            .afterClosed()
            .subscribe((res) => {
              if (res) {
                this.cloudSearchComponent.onSubmit();
              }
            });
          break;
        case 'sign':
          this.router.navigate([this.router.url, 'detail', event.object.id], { state: { isSign: true } });
          break;
      }
    });
  }

  onAction(action: string, row: ProjectProposalModel) {
    const apiCall = this.apiService.post(`${environment.PATH_API_V1}/project/project-proposal/${row.id}/${action}`, {});
    this.utilsService.execute(
      apiCall,
      (data: any, message?: string) => {
        this.utilsService.onSuccessFunc(message);
        this.cloudSearchComponent.onSubmit();
      },
      `project.project-proposal.${action}.success`,
      'common.title.confirm',
      undefined,
      `project.project-proposal.confirm.${action}`,
      undefined,
      undefined,
      'common.button.confirm',
      'common.button.back',
    );
  }

  convertField2HttpParamFn = (params: HttpParams, formGroup: FormGroup) => {
    params = params.set('status', 'APPROVED');
    return params;
  };

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '');
  }

  get hasEditPermission() {
    return this.permissionCheckingUtil.hasViewEditPermission(
      this.configForm?.moduleName ?? '',
      this.configForm?.name ?? '',
    );
  }

  get hasRejectPermission() {
    return this.permissionCheckingUtil.hasViewRejectPermission(
      this.configForm?.moduleName ?? '',
      this.configForm?.name ?? '',
    );
  }

  get hasUpgradePermission() {
    return (
      this.authoritiesService.hasAuthority('SYSTEM_ADMIN') ||
      this.authoritiesService.hasAuthority(`POST${environment.PATH_API_V1}/project/project-proposal/{id}/upgrade`)
    );
  }

  get hasCancelPermission() {
    return (
      this.authoritiesService.hasAuthority('SYSTEM_ADMIN') ||
      this.authoritiesService.hasAuthority(`POST${environment.PATH_API_V1}/project/project-proposal/{id}/cancel`)
    );
  }
}
