import {Component, Injector, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {
  AlignEnum,
  ApiService,
  AuthoritiesService,
  BaseSearchComponent, ButtonModel,
  ColumnModel,
  DateUtilService,
  FormStateService, IconTypeEnum, UtilsService
} from "@c10t/nice-component-library";
import {SelectValuesService} from "src/app/core/services/selectValues.service";
import {MatDialog} from "@angular/material/dialog";
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {ActivatedRoute, Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {ProjectProposalModel} from "src/app/modules/project-information/models/projects-information.model";
import {ProjectProposalStatusEnum} from "src/app/modules/project-information/models/project-proposal.model";

@Component({
  selector: 'vtp-proposal-information',
  standalone: false,
  templateUrl: './proposal-information.component.html'
})
export class ProposalInformationComponent extends BaseSearchComponent implements OnInit{
  @Input() addEditForm!: FormGroup;

  columns: ColumnModel[] = [];
  buttons: ButtonModel[] = [];
  moduleName: string = 'project.project';
  displayForm: FormGroup;


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
    protected permissionCheckingUtil: PermissionCheckingUtil,
    protected matDialog: MatDialog,
    private selectValuesService: SelectValuesService,
  ) {
    super(router, apiService, utilsService, uiStateService, translateService, injector, activatedRoute, authoritiesService,new FormGroup({}));

    this.displayForm = this.formBuilder.group({
      projectProposals: [[]],
    });

    this.columns.push(
      {
        columnDef: 'stt',
        header: 'stt',
        title: (e: ProjectProposalModel) => {
          const displayedData = this.displayForm.get('projectProposals')?.value || [];
          const index = displayedData.findIndex((item: any) => item === e);
          return (index + 1).toString();
        },
        cell: (e: ProjectProposalModel) => {
          const displayedData = this.displayForm.get('projectProposals')?.value || [];
          const index = displayedData.findIndex((item: any) => item === e);
          return (index + 1).toString();
        },
        className: 'mat-column-stt',
        isShowHeader: true,
        align: AlignEnum.CENTER,
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'code',
        header: 'proposalsCode',
        title: (e: ProjectProposalModel) => `${e.code}`,
        cell: (e: ProjectProposalModel) => `${e.code}`,
        align: AlignEnum.LEFT,
        alignHeader: AlignEnum.CENTER,
        className: 'mat-column-code'
      },
      {
        columnDef: 'name',
        header: 'proposalsName',
        title: (e: ProjectProposalModel) => `${e.name}`,
        cell: (e: ProjectProposalModel) => `${e.name}`,
        align: AlignEnum.LEFT,
        alignHeader: AlignEnum.CENTER,
        className: 'mat-column-code'
      },
      {
        columnDef: 'investmentFormName',
        header: 'investmentFormName',
        title: (e: ProjectProposalModel) => `${e.investmentFormName}`,
        cell: (e: ProjectProposalModel) => `${e.investmentFormName}`,
        align: AlignEnum.LEFT,
        alignHeader: AlignEnum.CENTER,
        className: 'mat-column-code'
      },
      {
        columnDef: 'proposingOrgName',
        header: 'proposingOrgName',
        title: (e: ProjectProposalModel) => `${e.proposingOrgName}`,
        cell: (e: ProjectProposalModel) => `${e.proposingOrgName}`,
        align: AlignEnum.LEFT,
        alignHeader: AlignEnum.CENTER,
        className: 'mat-column-code'
      },
      {
        columnDef: 'projectProposalStatus',
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
        alignHeader: AlignEnum.CENTER,
        className: 'mat-column-code'
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
        display: (e: ProjectProposalModel) => true,
        alignHeader: AlignEnum.CENTER,
      },
    )
  }

  ngOnInit() {
    super.ngOnInit();
    const data = this.addEditForm.get('projectProposals')?.value ?? [];
    this.displayForm.get('projectProposals')?.setValue([...data])
  }

  viewDetail(e: any) {
    console.log(e.id)
    this.router.navigate([`/project/project-proposal/detail/`, e.id]).then();
  }

}
