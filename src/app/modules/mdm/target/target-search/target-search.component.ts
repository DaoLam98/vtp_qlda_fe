import {Component, Inject, Injector, OnInit, Optional, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {
  AlignEnum,
  ApiService,
  AuthoritiesService, BaseStatusEnum,
  ButtonModel,
  ColumnModel,
  FlatTreeNodeModel,
  FormStateService,
  IconTypeEnum,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import {HttpParams} from '@angular/common/http';
import {environment} from 'src/environments/environment';
import { firstValueFrom, lastValueFrom, map, Observable } from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Config} from 'src/app/common/models/config.model';
import {Utils} from 'src/app/shared/utils/utils';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import type {CloudSearchComponent} from 'src/app/shared/components/base-search/cloud-search.component';
import {PermissionCheckingUtil} from 'src/app/shared/utils/permission-checking.util';
import { FORM_CONFIG } from 'src/app/modules/mdm/target/target-search/target-search.config';
import { TargetModel } from 'src/app/modules/mdm/_models/target.model';

@Component({
  selector: 'app-target-search',
  standalone: false,
  templateUrl: './target-search.component.html',
  styleUrl: 'target-search.component.scss'
})
export class TargetSearchComponent  {
  moduleName = 'target';
  Utils = Utils;

  @ViewChild('cloudSearchRef', {static: true}) cloudSearchComponent!: CloudSearchComponent;

  columns: ColumnModel[] = [];
  buttons: ButtonModel[] = [];
  configForm!: Config;
  formAdvanceSearch?: FormGroup;

  organizationTree: FlatTreeNodeModel[] = [];
  genderValues: SelectModel[] = [];
  targetParentValues: SelectModel[] = [];
  targetGroupValues: SelectModel[] = [];
  organizationValues: SelectModel[] = [];

  selectedEmployee: TargetModel[] = []
  selectedTreeNode!: FlatTreeNodeModel;

  isAdvancedSearch = false;
  isPopup = false;
  trackBy = '';
  multiple = true;

  protected readonly environment = environment;
  statusValues$: Observable<SelectModel[]>;

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
    protected selectValuesService: SelectValuesService,
    @Optional() public matDialogRef: MatDialogRef<TargetModel>,
    protected permissionCheckingUtil: PermissionCheckingUtil,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.formAdvanceSearch = formBuilder.group(this.configForm.filterForm!.reduce((result: any, item) => {
      result[item.name] = item.validate;
      return result;
    }, {}));

    if(data) {
      this.isPopup = true;
      this.isAdvancedSearch = true;
      this.selectedEmployee = [...data.selected || []];
      this.trackBy = data.trackBy || 'id';
      this.multiple = data.multiple ?? true;
    }

    this.columns.push(
      {
        columnDef: 'code',
        header: 'code',
        className: 'mat-column-code',
        title: (e: TargetModel) => `${e.code || ''}`,
        cell: (e: TargetModel) => `${e.code || ''}`,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'name',
        header: 'name',
        title: (e: TargetModel) => `${e.name}`,
        cell: (e: TargetModel) => `${e.name}`,
        className: 'mat-column-name',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'parentId',
        header: 'targetParent',
        className: 'mat-column-parentId',
        title: (e: TargetModel) => `${e.parentName || ''}`,
        cell: (e: TargetModel) => `${e.parentName || ''}`,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'targetGroupId',
        header: 'targetGroup',
        className: 'mat-column-targetGroupId',
        title: (e: TargetModel) => `${e.targetGroupName}`,
        cell: (e: TargetModel) => `${e.targetGroupName}`,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'status',
        header: 'status',
        title: (e: TargetModel) => `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
        cell: (e: TargetModel) => `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
        className: 'mat-column-status',
        isExpandOptionColumn: () => false,
        alignHeader: AlignEnum.CENTER,
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
        className: 'primary content-cell-align-center',
        title: 'common.title.detail',
        display: (e: TargetModel) => !this.isPopup,
      },
      {
        columnDef: 'edit',
        header: 'common.table.action.title',
        color: 'warn',
        icon: 'fa fa-pen',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'addOrEdit',
        className: 'primary content-cell-align-center',
        title: 'common.title.edit',
        display: (e: TargetModel) => !this.isPopup,
      },
      {
        columnDef: 'accept',
        color: 'primary',
        icon: 'fa fa-check',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'accept',
        className: 'primary content-cell-align-center',
        title: 'common.title.accept',
        display: (e: TargetModel) => true,
        disabled: (e: TargetModel) => e?.status === 'APPROVED',
        header: 'common.table.action.title',
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
        display: (e: TargetModel) => true,
        disabled: (e: TargetModel) => e?.status === 'REJECTED',
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER
      },
    );

    this.convertParamSearch = this.convertParamSearch.bind(this)
    this.statusValues$ = this.selectValuesService.getStatus()
  }

  async ngOnInit() {
    this.organizationTree = await firstValueFrom(
      this.apiService.get<FlatTreeNodeModel[]>(
        environment.PATH_API_V1 + '/mdm/target/flat-tree-node',
        new HttpParams(), environment.BASE_URL
      ).pipe(map(value => this.expandAllNodes(value)))
    );
    this.targetParentValues = await lastValueFrom(
      this.selectValuesService.getAutocompleteValuesFromModulePath(`${environment.PATH_API_V1}/mdm/target`));
    this.targetGroupValues = await lastValueFrom(
      this.selectValuesService.getAutocompleteValuesFromModulePath(`${environment.PATH_API_V1}/mdm/target-group`));
    this.selectedTreeNode = this.organizationTree?.[-1] || [];
  }

  addOrEdit(row: TargetModel | null) {
    if(row) {
      this.router.navigate([this.router.url, 'edit', row.id]).then();
    } else {
      this.router.navigate([this.router.url, 'add']).then();
    }
  }

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }

  convertParamSearch(params: HttpParams, formGroup: FormGroup) {
    if(this.organizationTree && this.organizationTree.length) {
      params = params.set('organizationId', this.getSelectedNodes(this.organizationTree)[0]);
    }
    return params;
  }

  viewDetail(row: TargetModel) {
    this.router.navigate([this.router.url, 'detail', row.id]).then();
  }

  getSelectedNodes(treeData: FlatTreeNodeModel[]): string[] {
    const selectedValues: string[] = [];
    for(const treeDataNode of treeData) {
      if(treeDataNode.checked) {
        selectedValues.push(treeDataNode.value);
        continue;
      }
      if(treeDataNode.children && treeDataNode.children.length > 0) {
        selectedValues.push(...this.getSelectedNodes(treeDataNode.children));
      }
    }
    return selectedValues;
  }

  onChooseOrg(event: FlatTreeNodeModel) {
    if (!event) return;
    const expand = event?.isFilterExpanded
    this.selectedTreeNode = event;
    event.isExpanded = expand;
    this.expandParentNodes(this.organizationTree, event.value);
    this.formAdvanceSearch?.get("path")?.setValue(event.value);
    this.cloudSearchComponent.onSubmit();
  }


  convertField2HttpParamFn(param: HttpParams, formGroup: FormGroup) {
    return this.selectedTreeNode?.value ? param.set(
      'pathName', '%/' + this.selectedTreeNode?.displayValue + '/%') : param
  }

  private expandAllNodes(tree: FlatTreeNodeModel[]): FlatTreeNodeModel[] {
    for(const node of tree) {
      node.isExpanded = true;
      if(node.children && node.children.length > 0) {
        this.expandAllNodes(node.children);
      }
    }
    return tree;
  }


  private expandParentNodes(nodes: FlatTreeNodeModel[], targetId: string): boolean {
    for (const node of nodes) {
      if (node.value === targetId) {
        return true;
      }

      if (node.children && node.children.length) {
        const found = this.expandParentNodes(node.children, targetId);
        if (found) {
          node.isExpanded = true;
          return true;
        }
      }
    }
    return false;
  }

}
