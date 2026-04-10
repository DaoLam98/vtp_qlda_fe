import {Component, Inject, Injector, OnInit, Optional, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {
  AlignEnum,
  ApiService,
  AuthoritiesService,
  ButtonModel,
  ColumnModel,
  ColumnTypeEnum,
  FlatTreeNodeModel,
  IconTypeEnum,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import {HttpParams} from '@angular/common/http';
import {environment} from 'src/environments/environment';
import {firstValueFrom} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EnumUtil} from '../../../utils/enum.util';
import {Config} from 'src/app/common/models/config.model';
import {FORM_CONFIG} from './organization-tree.config';
import {OrganizationModel} from 'src/app/modules/mdm/_models/organization.model';
import type {CloudSearchComponent} from 'src/app/shared/components/base-search/cloud-search.component';
import {Utils} from 'src/app/shared/utils/utils';
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {SelectValuesService} from "src/app/core/services/selectValues.service";
import {SuperStatusEnum} from '../../../enums/super.status.enum';

@Component({
  selector: 'app-organization-tree',
  standalone: false,
  templateUrl: './organization-tree.component.html',
  styleUrl: './organization-tree.component.scss'
})
export class OrganizationTreeComponent implements OnInit {
  moduleName = 'mdm.organization';

  @ViewChild('cloudSearchRef', {static: true}) cloudSearchComponent!: CloudSearchComponent;

  Utils = Utils;

  columns: ColumnModel[] = [];
  buttons: ButtonModel[] = [];
  configForm: Config;
  formAdvanceSearch?: FormGroup;

  organizationTree: FlatTreeNodeModel[] = [];
  statusValues: SelectModel[] = [];

  selectedOrganization: OrganizationModel[] = [];
  originalSelectedOrgList: OrganizationModel[] = [];

  isAdvancedSearch: boolean = false;
  isPopup: boolean = false;
  trackBy: string = ''
  selectedTreeNode!: FlatTreeNodeModel;
  orgOptions: SelectModel[] = [];
  isTreeVisible: boolean = true;
  multiple: boolean = true;

  protected readonly environment = environment;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected apiService: ApiService,
    protected utilsService: UtilsService,
    protected translateService: TranslateService,
    protected injector: Injector,
    protected activatedRoute: ActivatedRoute,
    protected authoritiesService: AuthoritiesService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
    protected selectValuesService: SelectValuesService,
    @Optional() public matDialogRef: MatDialogRef<OrganizationModel>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.formAdvanceSearch = formBuilder.group(this.configForm.filterForm!.reduce((result: any, item) => {
      result[item.name] = item.validate;
      return result;
    }, {}));

    // initialize columns array
    this.columns = [];

    // extract dialog data (if any) to local var for clarity
    const dialogData = this.data;

    if (dialogData) {
      this.isPopup = true;
      this.isAdvancedSearch = true;
      this.selectedOrganization = [...(dialogData.selected || [])];
      this.originalSelectedOrgList = [...(dialogData.selected || [])];
      this.trackBy = dialogData.trackBy ?? 'id';
      this.multiple = dialogData.multiple ?? true;
    }

    // If popup, add checkbox column at the beginning
    if (this.isPopup) {
      this.columns.unshift(this.buildCheckboxColumn(dialogData));
    }

    // push default columns
    this.columns.push(...this.getDefaultColumns());

    // Buttons (unchanged)
    this.buttons.push(
      {
        columnDef: 'detail',
        color: 'warn',
        icon: 'fa fa-eye',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'viewDetail',
        className: 'primary content-cell-align-center',
        title: 'common.title.detail',
        display: (e: OrganizationModel) => !this.isPopup,
      },
      {
        columnDef: 'edit',
        color: 'warn',
        icon: 'fa fa-pen',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'addOrEdit',
        className: 'primary content-cell-align-center',
        title: 'common.title.edit',
        display: (e: OrganizationModel) => !this.isPopup,
        header: "common.table.action.title",
        alignHeader: AlignEnum.CENTER
      }
    );
  }

  // --- Helper: build checkbox column (extracted to reduce complexity) ---
  private buildCheckboxColumn(dialogData: any): ColumnModel {
    const hasCombobox = Array.isArray(dialogData?.comboboxValues);

    return {
      columnDef: 'checked',
      header: () => '',
      className: 'mat-column-checked',
      title: (e: OrganizationModel) => `${e.checked}`,
      cell: (e: OrganizationModel) => `${e.checked}`,
      columnType: (e) => ColumnTypeEnum.CHECKBOX,
      disabled: (e: OrganizationModel) =>
        hasCombobox
          ? !dialogData.comboboxValues.some((x: SelectModel) => x.value === e.id) || e.status === 'REJECTED'
          : false,
      display: (e: OrganizationModel) => this.isPopup,
      onCellValueChange: (e: OrganizationModel) => this.onChooseOrganization(e),
      alignHeader: AlignEnum.CENTER,
      align: AlignEnum.CENTER,
      isNotShowHeaderCheckbox: !this.multiple,
    } as ColumnModel;
  }

  // --- Helper: default columns (extracted) ---
  private getDefaultColumns(): ColumnModel[] {
    return [
      {
        columnDef: 'code',
        header: 'code',
        headerClassName: 'mat-header-stt width-15',
        className: 'mat-column-code',
        title: (e: OrganizationModel) => `${e.code || ''}`,
        cell: (e: OrganizationModel) => `${e.code || ''}`,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'name',
        header: 'name',
        className: 'mat-column-name',
        title: (e: OrganizationModel) => `${e.name || ''}`,
        cell: (e: OrganizationModel) => `${e.name || ''}`,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'parentName',
        header: 'parentName',
        headerClassName: 'width-35',
        className: 'mat-column-parentName',
        title: (e: OrganizationModel) => `${e.parentName || ''}`,
        cell: (e: OrganizationModel) => `${e.parentName || ''}`,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      }
    ] as ColumnModel[];
  }

  async ngOnInit() {
    EnumUtil.enum2SelectModel(SuperStatusEnum, this.statusValues, 'SEARCH');
    const temp = await firstValueFrom(
      this.apiService.get<FlatTreeNodeModel[]>(
        environment.PATH_API_V1 + '/mdm/organization/flat-tree-node',
        new HttpParams(), environment.BASE_URL
      ));
    temp.forEach(t => {
      t.expandable = true;
      t.isExpanded = true;
      t.isFilterExpanded = true;
    });
    this.organizationTree = temp;
    this.selectedTreeNode = this.organizationTree?.[0] || [];
    this.cloudSearchComponent?.onSubmit();

    this.callAPIGetOrgOptionList();
  }

  callAPIGetOrgOptionList() {
    this.selectValuesService.getAutocompleteValuesFromModulePath(
      `${environment.PATH_API_V1}/mdm/organization`
    ).subscribe(options => {
      this.orgOptions = options;
    });
  }

  onChooseOrganization(e: OrganizationModel) {
    if (!this.multiple) {
      this.uncheckOtherOrganizations(e.id);
    }

    this.initSelectedOrganization(e);

    if (!this.selectedOrganization) return;

    const index = this.findOrganizationIndex(e.id);

    e.checked
      ? this.addOrUpdateOrganization(e, index)
      : this.removeOrganization(index);
  }

  getSelectedNodes(treeData: FlatTreeNodeModel[]): string[] {
    const selectedValues: string[] = [];
    for (const treeDataNode of treeData) {
      if (treeDataNode.checked) {
        selectedValues.push(treeDataNode.value);
        continue;
      }
      if (treeDataNode.children && treeDataNode.children.length > 0) {
        selectedValues.push(...this.getSelectedNodes(treeDataNode.children));
      }
    }
    return selectedValues;
  }

  onSelectChangeOrg(event: FlatTreeNodeModel) {
    event && (this.selectedTreeNode = event);
    event.expandable = true;
    event.isExpanded = true;
    event.isFilterExpanded = true;
    this.formAdvanceSearch?.get("path")?.setValue(event.value);
    this.cloudSearchComponent.onSubmit();
  }

  convertField2HttpParamFn(param: HttpParams, formGroup: FormGroup) {
    if (this.isPopup) {
      param = param.set("status", "APPROVED");
    }
    return this.selectedTreeNode?.value ? param.set('isIncludeItself', this.selectedTreeNode.value || '') : param;
  }

  chooseOrganization() {
    this.matDialogRef.close(this.selectedOrganization);
  }

  onExpandTree() {
    this.isTreeVisible = !this.isTreeVisible;
  }

  private uncheckOtherOrganizations(selectedId: any) {
    for (const item of this.cloudSearchComponent.results.data) {
      item.checked = item.id === selectedId;
    }
  }

  private initSelectedOrganization(e: any) {
    if (!this.selectedOrganization && e.checked) {
      this.selectedOrganization = [e];
    }
  }

  private findOrganizationIndex(id: any): number {
    return this.selectedOrganization.findIndex(
      (item: any) => item[this.trackBy] === id
    );
  }

  private addOrUpdateOrganization(e: any, index: number) {
    const newItem = { ...e, [this.trackBy]: e.id };

    if (index < 0) {
      if (this.multiple) {
        this.selectedOrganization.push(newItem);
      } else {
        this.selectedOrganization = [newItem];
      }
    } else {
      Object.assign(this.selectedOrganization[index], e);
    }
  }

  private removeOrganization(index: number) {
    if (index > -1) {
      this.selectedOrganization.splice(index, 1);
    }
  }
}
