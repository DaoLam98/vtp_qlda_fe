import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {SharedModule} from "src/app/shared";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {HttpClient} from "@angular/common/http";
import {QuillModule} from "ngx-quill";
import {ProjectInformationRoutingModule} from "src/app/modules/project-information/project-information.routing.module";
import {
  ProjectsInformationSearchComponent
} from "src/app/modules/project-information/projects-information/projects-information-search/projects-information-search.component";
import {
  ProjectsInformationAddEditDetailComponent
} from "src/app/modules/project-information/projects-information/projects-information-add-edit-detail/projects-information-add-edit-detail.component";
import {DashboardComponent} from "src/app/modules/project-information/dashboard/dashboard.component";
import {
  ProposalInformationComponent
} from "src/app/modules/project-information/projects-information/projects-information-add-edit-detail/proposal-information/proposal-information.component";
import {
  InvestmentInformationComponent
} from "src/app/modules/project-information/projects-information/projects-information-add-edit-detail/investment-information/investment-information.component";
import {
  FeasibilityReportComponent
} from "src/app/modules/project-information/projects-information/projects-information-add-edit-detail/feasibility-report/feasibility-report.component";
import {
  FolderListComponent
} from "src/app/modules/project-information/projects-information/projects-information-add-edit-detail/folder-list/folder-list.component";
import { TranslateLoaderFactoryHelper } from 'src/app/core';
import {ModuleNameEnum} from "src/app/shared/enums/module.name.enum";
import {
  FolderAddEditDetailComponent
} from "src/app/modules/project-information/projects-information/projects-information-add-edit-detail/folder-list/folder-add-edit-detail/folder-add-edit-detail.component";
import {
  ViewFileDialogComponent
} from "src/app/modules/project-information/projects-information/projects-information-add-edit-detail/folder-list/view-file-dialog/view-file-dialog.component";
import {PdfJsViewerModule} from "ng2-pdfjs-viewer";
import { ProjectProposalAddEditDetailComponent } from './project-proposal/project-proposal-add-edit-detail/project-proposal-add-edit-detail.component';
import { ProjectProposalGeneralComponent } from './project-proposal/project-proposal-add-edit-detail/project-proposal-general/project-proposal-general.component';
import { ProjectProposalInvestmentComponent } from './project-proposal/project-proposal-add-edit-detail/project-proposal-investment/project-proposal-investment.component';
import { ProjectProposalReportComponent } from './project-proposal/project-proposal-add-edit-detail/project-proposal-report/project-proposal-report.component';
import { ProjectProposalSearchComponent } from './project-proposal/project-proposal-search/project-proposal-search.component';
import { PopupUpgradeProjectProposalComponent } from './project-proposal/popup-upgrade-project-proposal/popup-upgrade-project-proposal.component';
import {
  PopupSyncProjectProposalComponent
} from 'src/app/modules/project-information/project-proposal/popup-sync-project-proposal/popup-sync-project-proposal.component';
import {SliderTopProjectComponent} from "src/app/modules/project-information/dashboard/slider-top-project/slider-top-project.component";
import {
  DashboardDetailComponent
} from "src/app/modules/project-information/dashboard/dashboard-detail/dashboard-detail.component";
import { PopupAddFinalBalanceConfigComponent } from './final-balance-config/popup-add-final-balance-config/popup-add-final-balance-config.component';
import { FinalBalanceConfigSearchComponent } from './final-balance-config/final-balance-config-search/final-balance-config-search.component';
import { FinalBalanceConfigAddEditDetailComponent } from './final-balance-config/final-balance-config-add-edit-detail/final-balance-config-add-edit-detail.component';
import { ProjectEvaluationSearchComponent } from './project-evaluation/project-evaluation-search/project-evaluation-search.component';
import { ProjectEvaluationAddEditDetailComponent } from './project-evaluation/project-evaluation-add-edit-detail/project-evaluation-add-edit-detail.component';
import { ProjectEvaluationGeneralComponent } from './project-evaluation/project-evaluation-add-edit-detail/project-evaluation-general/project-evaluation-general.component';
import { ProjectEvaluationEffectivenessComponent } from './project-evaluation/project-evaluation-add-edit-detail/project-evaluation-effectiveness/project-evaluation-effectiveness.component';
import { ProjectEvaluationInvestmentComponent } from './project-evaluation/project-evaluation-add-edit-detail/project-evaluation-investment/project-evaluation-investment.component';
import { ProjectImplStatusComponent } from './project-evaluation/project-evaluation-add-edit-detail/project-evaluation-impl-status/project-evaluation-impl-status.component';
import { ImplStatusEffectivenessTableComponent } from './project-evaluation/project-evaluation-add-edit-detail/impl-status-effectiveness-table/impl-status-effectiveness-table.component';
import { FormDataCollectionAddEditDetailComponent } from './data-collection/form-data-collection-add-edit-detail/form-data-collection-add-edit-detail.component';
import { FormDataCollectionSearchComponent } from './data-collection/form-data-collection-search/form-data-collection-search.component';
import { FormDataItemSearchComponent } from './data-collection/form-data-item-search/form-data-item-search.component';
import { ReportComponent } from './report/report.component';
import { ReportDetailComponent } from './report/report-detail/report-detail.component';
import { ReportSummaryComponent } from './report/report-summary/report-summary.component';
import { ReportCumulativeComponent } from './report/report-cumulative/report-cumulative.component';

export function translateLoaderFactory(http: HttpClient): any {
  return new (TranslateLoaderFactoryHelper.forModule(ModuleNameEnum.PROJECT))(http);
}

@NgModule({
  declarations: [
    DashboardComponent,
    ProjectsInformationSearchComponent,
    ProjectsInformationAddEditDetailComponent,
    ProposalInformationComponent,
    InvestmentInformationComponent,
    FeasibilityReportComponent,
    FolderListComponent,
    FolderAddEditDetailComponent,
    ViewFileDialogComponent,
    FolderAddEditDetailComponent,
    ProjectProposalSearchComponent,
    ProjectProposalAddEditDetailComponent,
    ProjectProposalGeneralComponent,
    ProjectProposalInvestmentComponent,
    ProjectProposalReportComponent,
    PopupUpgradeProjectProposalComponent,
    PopupSyncProjectProposalComponent,
    // Dashboard
    DashboardComponent,
    SliderTopProjectComponent,
    DashboardDetailComponent,
    PopupSyncProjectProposalComponent,
    PopupAddFinalBalanceConfigComponent,
    FinalBalanceConfigSearchComponent,
    FinalBalanceConfigAddEditDetailComponent,
    ProjectEvaluationSearchComponent,
    ProjectEvaluationAddEditDetailComponent,
    ProjectEvaluationGeneralComponent,
    ProjectEvaluationEffectivenessComponent,
    ProjectEvaluationInvestmentComponent,
    ProjectImplStatusComponent,
    ImplStatusEffectivenessTableComponent,
    FormDataCollectionAddEditDetailComponent,
    FormDataCollectionSearchComponent,
    FormDataItemSearchComponent,
    ReportComponent,
    ReportDetailComponent,
    ReportSummaryComponent,
    ReportCumulativeComponent,
  ],
  imports: [
    SharedModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: translateLoaderFactory,
        deps: [HttpClient],
      },
      isolate: false,
      extend: true,
    }),
    ProjectInformationRoutingModule,
    QuillModule.forRoot(),
    PdfJsViewerModule,
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProjectInformationModule { }
