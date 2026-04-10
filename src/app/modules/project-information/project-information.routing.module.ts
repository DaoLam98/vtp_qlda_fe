import {RouterModule, Routes} from "@angular/router";
import {AuthoritiesResolverService} from "@c10t/nice-component-library";
import {NgModule} from "@angular/core";
import {ActionTypeEnum} from "src/app/shared";
import {environment} from "src/environments/environment";
import {
  ProjectsInformationSearchComponent
} from "src/app/modules/project-information/projects-information/projects-information-search/projects-information-search.component";
import {
  ProjectsInformationAddEditDetailComponent
} from "src/app/modules/project-information/projects-information/projects-information-add-edit-detail/projects-information-add-edit-detail.component";
import {DashboardComponent} from "src/app/modules/project-information/dashboard/dashboard.component";
import { ProjectProposalAddEditDetailComponent } from "./project-proposal/project-proposal-add-edit-detail/project-proposal-add-edit-detail.component";
import { ProjectProposalSearchComponent } from "./project-proposal/project-proposal-search/project-proposal-search.component";
import { FormDataCollectionAddEditDetailComponent } from "./data-collection/form-data-collection-add-edit-detail/form-data-collection-add-edit-detail.component";
import { FormDataCollectionSearchComponent } from "./data-collection/form-data-collection-search/form-data-collection-search.component";
import { ProjectEvaluationAddEditDetailComponent } from "./project-evaluation/project-evaluation-add-edit-detail/project-evaluation-add-edit-detail.component";
import { ProjectEvaluationSearchComponent } from "./project-evaluation/project-evaluation-search/project-evaluation-search.component";
import { FinalBalanceConfigSearchComponent } from "./final-balance-config/final-balance-config-search/final-balance-config-search.component";
import { FinalBalanceConfigAddEditDetailComponent } from "./final-balance-config/final-balance-config-add-edit-detail/final-balance-config-add-edit-detail.component";
import { ReportComponent } from "./report/report.component";



const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    ...(environment.MOCK_API ? {} : {resolve: {me: AuthoritiesResolverService}}),
  },
  {
    path: 'projects-info',
    data: {breadcrumb: 'menu.project.projects-info'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: ProjectsInformationSearchComponent,
        ...(environment.MOCK_API ? {} : {resolve: {me: AuthoritiesResolverService}}),
      },
      // {
      //   path: 'add',
      //   component: ProjectsInformationAddEditDetailComponent,
      //   data: {
      //     breadcrumb: 'menu.project.project-info.add',
      //     actionType: ActionTypeEnum._ADD,
      //   },
      //   resolve: {me: AuthoritiesResolverService},
      // },
      {
        path: 'edit/:id',
        component: ProjectsInformationAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.project.project-info.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        ...(environment.MOCK_API ? {} : {resolve: {me: AuthoritiesResolverService}}),
      },
      {
        path: 'detail/:id',
        component: ProjectsInformationAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.project.project-info.view',
          actionType: ActionTypeEnum._VIEW,
        },
        ...(environment.MOCK_API ? {} : {resolve: {me: AuthoritiesResolverService}}),
      },
    ]
  },
  {
    path: 'project-proposal',
    data: {breadcrumb: 'menu.project.project-proposal'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: ProjectProposalSearchComponent,
        ...(environment.MOCK_API ? {} : {resolve: {me: AuthoritiesResolverService}}),
      },
      {
        path: 'detail/:id',
        component: ProjectProposalAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.project.project-proposal.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        ...(environment.MOCK_API ? {} : {resolve: {me: AuthoritiesResolverService}}),
      },
      {
        path: 'add',
        component: ProjectProposalAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.project.project-proposal.add',
          actionType: ActionTypeEnum._ADD,
        },
        ...(environment.MOCK_API ? {} : {resolve: {me: AuthoritiesResolverService}}),
      },
      {
        path: 'edit/:id',
        component: ProjectProposalAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.project.project-proposal.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        ...(environment.MOCK_API ? {} : {resolve: {me: AuthoritiesResolverService}}),
      },
      {
        path: 'upgrade/:id',
        component: ProjectProposalAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.project.project-proposal.upgrade',
          actionType: ActionTypeEnum._EDIT,
        },
        ...(environment.MOCK_API ? {} : {resolve: {me: AuthoritiesResolverService}}),
      },
    ],
  },
  {
      path: 'final-balance-config',
      data: {breadcrumb: 'menu.project-manage.final-balance-config'},
      children: [
        {
          path: '',
          pathMatch: 'full',
          component: FinalBalanceConfigSearchComponent,
          ...(environment.MOCK_API ? {} : {resolve: {me: AuthoritiesResolverService}}),
        },
        {
          path: 'detail/:id',
          component: FinalBalanceConfigAddEditDetailComponent,
          data: {
            breadcrumb: 'menu.project.final-balance-config.view',
            actionType: ActionTypeEnum._VIEW,
          },
          ...(environment.MOCK_API ? {} : {resolve: {me: AuthoritiesResolverService}}),
        },
      ]
  },
  {
      path: 'project-evaluation',
      data: {breadcrumb: 'menu.project-manage.project-evaluation'},
      children: [
        {
          path: '',
          pathMatch: 'full',
          component: ProjectEvaluationSearchComponent,
          ...(environment.MOCK_API ? {} : {resolve: {me: AuthoritiesResolverService}}),
        },
        {
          path: 'add',
          component: ProjectEvaluationAddEditDetailComponent,
          data: {
            breadcrumb: 'menu.project.project-evaluation.add',
            actionType: ActionTypeEnum._ADD,
          },
          ...(environment.MOCK_API ? {} : {resolve: {me: AuthoritiesResolverService}}),
        },
        {
          path: 'edit/:id',
          component: ProjectEvaluationAddEditDetailComponent,
          data: {
            breadcrumb: 'menu.project.project-evaluation.edit',
            actionType: ActionTypeEnum._EDIT,
          },
          ...(environment.MOCK_API ? {} : {resolve: {me: AuthoritiesResolverService}}),
        },
        {
          path: 'detail/:id',
          component: ProjectEvaluationAddEditDetailComponent,
          data: {
            breadcrumb: 'menu.project.project-evaluation.view',
            actionType: ActionTypeEnum._VIEW,
          },
          ...(environment.MOCK_API ? {} : {resolve: {me: AuthoritiesResolverService}}),
        },
      ]
  },
  {
      path: 'form-data-collection',
      data: {breadcrumb: 'menu.mdm.form-data-collection'},
      children: [
          {
            path: '',
            pathMatch: 'full',
            component: FormDataCollectionSearchComponent,
            ...(environment.MOCK_API ? {} : {resolve: {me: AuthoritiesResolverService}}),
          },
          {
            path: 'detail/:id',
            component: FormDataCollectionAddEditDetailComponent,
            data: {
              breadcrumb: 'menu.project.form-data-collection.detail',
              actionType: ActionTypeEnum._VIEW,
            },
            ...(environment.MOCK_API ? {} : {resolve: {me: AuthoritiesResolverService}}),
          },
          {
            path: 'add',
            component: FormDataCollectionAddEditDetailComponent,
            data: {
              breadcrumb: 'menu.project.form-data-collection.add',
              actionType: ActionTypeEnum._ADD,
            },
            ...(environment.MOCK_API ? {} : {resolve: {me: AuthoritiesResolverService}}),
          },
          {
            path: 'edit/:id',
            component: FormDataCollectionAddEditDetailComponent,
            data: {
              breadcrumb: 'menu.project.form-data-collection.edit',
              actionType: ActionTypeEnum._EDIT,
            },
            ...(environment.MOCK_API ? {} : {resolve: {me: AuthoritiesResolverService}}),
          },
        ],
  },
  {
    path: 'report',
    component: ReportComponent,
    ...(environment.MOCK_API ? {} : {resolve: {me: AuthoritiesResolverService}}),
    data: { breadcrumb: 'menu.project.report' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectInformationRoutingModule {
}
