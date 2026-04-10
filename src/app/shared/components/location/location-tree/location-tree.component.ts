import {Component, Inject, OnInit, Optional, ViewChild} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Config} from 'src/app/common/models/config.model';
import {FormBuilder, FormGroup} from '@angular/forms';
import {
  AlignEnum,
  ApiService,
  AuthoritiesService,
  BaseStatusEnum,
  ButtonModel,
  ColumnModel,
  ColumnTypeEnum,
  FlatTreeNodeModel,
  IconTypeEnum,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import {Router} from '@angular/router';
import {LocationModel} from 'src/app/core';
import {Utils} from 'src/app/shared/utils/utils';
import {firstValueFrom, map, Observable} from 'rxjs';
import {environment} from 'src/environments/environment';
import {HttpParams} from '@angular/common/http';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {LocationTypeEnum} from 'src/app/shared/enums/location-type.enum';
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import type {CloudSearchComponent} from "src/app/shared/components/base-search/cloud-search.component";
import { FORM_CONFIG } from './location-tree.config';

interface ExtendedFlatTreeNodeModel extends FlatTreeNodeModel {
  parentId?: number;
}
@Component({
  selector: 'app-location-tree',
  templateUrl: './location-tree.component.html',
  styleUrls: ['./location-tree.component.scss'],
  standalone: false
})
export class LocationTreeComponent implements OnInit{
  Utils = Utils;
  configForm: Config;
  formAdvanceSearch?: FormGroup;

  locationTree: FlatTreeNodeModel[] = [];
  columns: ColumnModel[] = [];
  buttons: ButtonModel[] = [];

  isPopup: boolean = false;
  isAdvancedSearch: boolean = false;


  selectedLocation: LocationModel[] = []
  multiple: boolean = true;
  trackBy: string = '';
  
  statusValues$: Observable<SelectModel[]>;

  formFieldDisplay: { [key: string]: boolean } = {};

  locationLevelValue: SelectModel[] = [
    {
      value: -1,
      disabled: false,
      displayValue: this.translateService.instant("common.combobox.option.default"),
      rawData: -1,
    },
    {
      displayValue: this.translateService.instant('location.type.country'),
      value: 'COUNTRY',
      rawData: 'COUNTRY',
      disabled: false,
    },
    {
      displayValue: this.translateService.instant('location.type.province'),
      value: 'PROVINCE',
      rawData: 'PROVINCE',
      disabled: false,
    },
    {
      displayValue: this.translateService.instant('location.type.district'),
      value: 'DISTRICT',
      rawData: 'DISTRICT',
      disabled: false,
    },
    {
      displayValue: this.translateService.instant('location.type.ward'),
      value: 'WARD',
      rawData: 'WARD',
      disabled: false,
    },
  ];
  selectedTreeNode!: ExtendedFlatTreeNodeModel;
  @ViewChild('cloudSearchRef', { static: true }) cloudSearchComponent!: CloudSearchComponent;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected apiService: ApiService,
    protected utilsService: UtilsService,
    protected translateService: TranslateService,
    protected authoritiesService: AuthoritiesService,
    protected selectService: SelectValuesService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
    @Optional() public matDialogRef: MatDialogRef<LocationModel>,
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
      this.selectedLocation = [...data.selected || []];
      this.trackBy = data.trackBy || 'id';
      this.multiple = data.multiple ?? true;      
    }

    if(this.isPopup) {
      this.columns.push({
        columnDef: 'checked',
        header: () => '',
        className: 'mat-column-checked',
        title: (e: LocationModel) => `${e.checked}`,
        cell: (e: LocationModel) => `${e.checked}`,
        columnType: ColumnTypeEnum.CHECKBOX,
        disabled: (e: LocationModel) => e.status === 'REJECTED',
        display: () => this.isPopup,
        onCellValueChange: (e: LocationModel) => this.onChooseLocation(e),
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      })
    }

    this.columns.push(
      {
        columnDef: 'code',
        header: 'code',
        title: (e: LocationModel) => this.displayCellValue(e.code),
        cell: (e: LocationModel) => this.displayCellValue(e.code),
        className: 'mat-column-name',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'name',
        header: 'name',
        title: (e: LocationModel) => this.displayCellValue(e.name),
        cell: (e: LocationModel) => this.displayCellValue(e.name),
        className: 'mat-column-name',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'locationLevel',
        header: 'locationLevel',
        title: (e: LocationModel) => e.locationLevel ? this.utilsService.getEnumValueTranslated(LocationTypeEnum, String(e.locationLevel)) : '',
        cell: (e: LocationModel) => e.locationLevel ? this.utilsService.getEnumValueTranslated(LocationTypeEnum, String(e.locationLevel)) : '',
        className: 'mat-column-name',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'parentName',
        header: 'parentName',
        title: (e: LocationModel) => this.displayCellValue(e.parentName),
        cell: (e: LocationModel) => this.displayCellValue(e.parentName),
        className: 'mat-column-name',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'status',
        header: 'status',
        title: (e: LocationModel) => `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
        cell: (e: LocationModel) => `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
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
        display: () => !this.isPopup,
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
        display: () => !this.isPopup,
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
        display: () => !this.isPopup,
        disabled: (e: LocationModel) => e.status === 'APPROVED',
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
        display: () => !this.isPopup,
        disabled: (e: LocationModel) => e?.status === 'REJECTED',
        header: "common.table.action.title",
        alignHeader: AlignEnum.CENTER
      },
    );
    this.convertParamsSearch = this.convertParamsSearch.bind(this);
    this.statusValues$ = this.selectService.getStatus();
    this.formFieldDisplay = this.columns.reduce((result: any, item) => {
      result[item.columnDef] = true;
      return result;
    }, {});
  }

  async ngOnInit() {
    this.locationTree = await firstValueFrom(
      this.apiService.get<FlatTreeNodeModel[]>(environment.PATH_API_V1 +'/mdm/location/flat-tree-node', new HttpParams(), environment.BASE_URL)
        .pipe(map(value => this.expandAllNodes(value, true)))
    );
  }

  convertParamsSearch(params: HttpParams) {
    if (this.locationTree && this.locationTree.length) {
      const selectedNodes = this.getSelectedNodes(this.locationTree);
      if (selectedNodes.length > 0) {
        params = params.set('parentId', selectedNodes[0]);
      } else {
        params = params.delete('parentId');
      }
    } else {
      params = params.delete('parentId');
    }

    return params;
  }


  getSelectedNodes(treeLocationData: FlatTreeNodeModel[]): string[] {
    const selectedValues: string[] = [];
    for(const treeDataNode of treeLocationData) {
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

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }

  convertField2HttpParamFn(param: HttpParams, formGroup: FormGroup) {
    return this.selectedTreeNode?.value ? param.set('isIncludeItself', this.selectedTreeNode.value || '') : param;
  }

  onSelectChange(event: FlatTreeNodeModel) {
    if(!event) return;
    const expand = event?.isFilterExpanded
    this.selectedTreeNode = event;
    event.isFilterExpanded = expand;
    this.expandParentNodes(this.locationTree, event.value);
    this.formAdvanceSearch?.get("path")?.setValue(event.value);
    this.cloudSearchComponent.onSubmit();
  }

  onChooseLocation(e: LocationModel) {
    if (!this.multiple) {
      this.uncheckOthers(e.id);
    }

    this.ensureSelectedLocationInitialized(e);

    if (!this.selectedLocation) return;

    const index = this.findSelectedIndex(e.id);

    e.checked
      ? this.addOrUpdateSelection(e, index)
      : this.removeSelection(index);
  }
  
  chooseLocation() {    
    this.matDialogRef.close(this.selectedLocation.filter(x => x.status !== 'REJECTED'));
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

  private expandAllNodes(tree: FlatTreeNodeModel[], isExpand?: boolean): FlatTreeNodeModel[] {
    for(const node of tree) {
      node.isExpanded = isExpand;
      node.isFilterExpanded = true;
      if(node.children && node.children.length > 0) {
        this.expandAllNodes(node.children, false);
      }
    }
    return tree;
  }

  private displayCellValue(value: string | null): string {
    return value ? value : '';
  }

  private uncheckOthers(selectedId: any) {
    for (const item of this.cloudSearchComponent.results.data) {
      item.checked = item.id === selectedId;
    }
  }

  private ensureSelectedLocationInitialized(e: any) {
    if (!this.selectedLocation && e.checked) {
      this.selectedLocation = [e];
    }
  }

  private findSelectedIndex(id: any): number {
    return this.selectedLocation.findIndex(
      (item: any) => item[this.trackBy] === id
    );
  }

  private addOrUpdateSelection(e: any, index: number) {
    const newItem = { ...e, [this.trackBy]: e.id };

    if (index < 0) {
      if (this.multiple) {
        this.selectedLocation.push(newItem);
      } else {
        this.selectedLocation = [newItem];
      }
    } else {
      Object.assign(this.selectedLocation[index], e);
    }
  }

  private removeSelection(index: number) {
    if (index > -1) {
      this.selectedLocation.splice(index, 1);
    }
  }

  protected readonly environment = environment;
}
