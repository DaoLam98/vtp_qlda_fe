import {Component, Inject, Injector, OnInit, Optional, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
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
  FormStateService,
  IconTypeEnum,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import {HttpParams} from '@angular/common/http';
import {environment} from 'src/environments/environment';
import {distinctUntilChanged, filter, firstValueFrom, lastValueFrom, map} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EnumUtil} from '../../../utils/enum.util';
import {Config} from 'src/app/common/models/config.model';
import {EXTERNAL_USER_FORM_CONFIG, INTERNAL_USER_FORM_CONFIG} from './user-tree.config';
import {EmployeeModel} from '../internal-user.model';
import {GenderEnum} from '../../../enums/gender.enum';
import {SuperStatusEnum} from '../../../enums/super.status.enum';
import {Utils} from 'src/app/shared/utils/utils';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import type {CloudSearchComponent} from 'src/app/shared/components/base-search/cloud-search.component';
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";

@Component({
  selector: 'app-user-tree',
  standalone: false,
  templateUrl: './user-tree.component.html',
  styleUrl: 'user-tree.component.scss'
})
export class UserTreeComponent implements OnInit {
  moduleName = 'employee';
  Utils = Utils;

  @ViewChild('cloudSearchRef', {static: true}) cloudSearchComponent!: CloudSearchComponent;

  columns: ColumnModel[] = [];
  buttons: ButtonModel[] = [];
  configForm!: Config;
  formAdvanceSearch?: FormGroup;

  organizationTree: FlatTreeNodeModel[] = [];
  genderValues: SelectModel[] = [];
  statusValues: SelectModel[] = [];
  jobPositionValues: SelectModel[] = [];
  organizationValues: SelectModel[] = [];

  selectedEmployee: EmployeeModel[] = []
  selectedTreeNode!: FlatTreeNodeModel;

  isAdvancedSearch: boolean = false;
  /**
   * @usage Cây đơn vị sẽ trỏ đến node có value = selectedTreeId,
   * mặc định selectedTreeId = null, cây đơn vị trỏ đến node đầu tiên,
   */
  selectedTreeId: number | null = null;
  isPopup: boolean = false;
  /**
   * @usage Tên trường của EmployeeModel để mapping với trackBy,
   * giúp hiển thị dấu check đúng với các bản ghi đã chọn. Mặc định là 'id'
   */
  mapBy: keyof EmployeeModel = 'id';
  /**
   * @usage Tên trường của data.selected để mapping với mapBy,
   * giúp hiển thị dấu check đúng với các bản ghi đã chọn. Mặc định là 'id'
   */
  trackBy: string = '';
  multiple: boolean = true;

  typeControl: FormControl = new FormControl('INTERNAL');
  typeValues: SelectModel[] = [
    {
      value: 'INTERNAL',
      disabled: false,
      displayValue: this.translateService.instant('common.popup.radio.label.internal-user'),
      rawData: 'INTERNAL',
    },
    {
      value: 'EXTERNAL',
      disabled: false,
      displayValue: this.translateService.instant('common.popup.radio.label.external-user'),
      rawData: 'EXTERNAL',
    },
  ];
  allowExternalUser: boolean = false;
  isTreeVisible: boolean = true;

  protected readonly environment = environment;

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
    @Optional() public matDialogRef: MatDialogRef<EmployeeModel>,
    protected permissionCheckingUtil: PermissionCheckingUtil,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.configForm = JSON.parse(JSON.stringify(INTERNAL_USER_FORM_CONFIG));

    this.formAdvanceSearch = formBuilder.group(this.configForm.filterForm!.reduce((result: any, item) => {
      result[item.name] = item.validate;
      return result;
    }, {}));

    if(data) {
      this.isPopup = true;
      this.isAdvancedSearch = true;
      this.selectedEmployee = [...data.selected || []];
      this.trackBy = data.trackBy || 'id';
      this.mapBy = data.mapBy as keyof EmployeeModel || 'id';
      this.multiple = data.multiple ?? true;
      this.allowExternalUser = data.allowExternalUser;
      this.selectedTreeId = data.selectedTreeId;
    }

    if(this.isPopup) {
      this.columns.push({
        columnDef: 'checked',
        header: () => '',
        className: 'mat-column-checked',
        title: (e: EmployeeModel) => `${e.checked}`,
        cell: (e: EmployeeModel) => `${e.checked}`,
        columnType: ColumnTypeEnum.CHECKBOX,
        disabled: () => false,
        display: (e: EmployeeModel) => this.isPopup,
        onCellValueChange: (e: EmployeeModel) => this.onChooseEmployee(e),
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      })
    }

    this.columns.push(
      {
        columnDef: 'code',
        header: 'code',
        className: 'mat-column-code',
        title: (e: EmployeeModel) => this.displayCellValue(e.code),
        cell: (e: EmployeeModel) => this.displayCellValue(e.code),
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'name',
        header: 'fullName',
        title: (e: EmployeeModel) => this.displayCellValue(e.fullName),
        cell: (e: EmployeeModel) => this.displayCellValue(e.fullName),
        className: 'mat-column-name',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'jobPosition',
        header: 'jobPositionName',
        className: 'mat-column-jobPosition',
        title: (e: EmployeeModel) => this.displayCellValue(e.jobPositionName),
        cell: (e: EmployeeModel) => this.displayCellValue(e.jobPositionName),
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'organization',
        header: 'organization',
        className: 'mat-column-organization',
        title: (e: EmployeeModel) => this.displayCellValue(e.organizationName),
        cell: (e: EmployeeModel) => this.displayCellValue(e.organizationName),
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'email',
        header: 'email',
        className: 'mat-column-email',
        title: (e: EmployeeModel) => this.displayCellValue(e.email),
        cell: (e: EmployeeModel) => this.displayCellValue(e.email),
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'phoneNumber',
        header: 'phoneNumber',
        className: 'mat-column-phoneNumber',
        title: (e: EmployeeModel) => this.displayCellValue(e.phoneNumber),
        cell: (e: EmployeeModel) => this.displayCellValue(e.phoneNumber),
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
    );

    this.buttons.push(
      {
        columnDef: 'detail',
        header: "common.table.action.title",
        color: 'warn',
        icon: 'fa fa-eye',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'viewDetail',
        className: 'primary content-cell-align-center',
        title: 'common.title.detail',
        display: (e: EmployeeModel) => !this.isPopup,
      },
      {
        columnDef: 'edit',
        header: "common.table.action.title",
        color: 'warn',
        icon: 'fa fa-pen',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'addOrEdit',
        className: 'primary content-cell-align-center',
        title: 'common.title.edit',
        display: (e: EmployeeModel) => !this.isPopup,
      },
    );

    this.convertParamSearch = this.convertParamSearch.bind(this)
  }

  async ngOnInit() {
    EnumUtil.enum2SelectModel(GenderEnum, this.genderValues, 'SEARCH');
    EnumUtil.enum2SelectModel(SuperStatusEnum, this.statusValues, 'SEARCH');
    this.organizationTree = await firstValueFrom(
      this.apiService.get<FlatTreeNodeModel[]>(
        environment.PATH_API_V1 + '/mdm/organization/flat-tree-node',
        new HttpParams(), environment.BASE_URL
      ).pipe(map(value => this.expandAllNodes(value)))
    );
    this.jobPositionValues = await lastValueFrom(
      this.selectValuesService.getAutocompleteValuesFromModulePath(`${environment.PATH_API_V1}/mdm/job-position`));
    this.organizationValues = await lastValueFrom(
      this.selectValuesService.getAutocompleteValuesFromModulePath(`${environment.PATH_API_V1}/mdm/organization`));
    if (!this.selectedTreeId) {
      this.selectedTreeNode = this.organizationTree?.[0] || [];   
    } 

    /** Khi this.selectedTreeNode có dữ liệu thì hàm convertField2HttpParamFn sẽ được gọi lại để lấy danh sách dữ
     *  liêu ứng với đơn vị được chọn trên Cây đơn vị */
    this.cloudSearchComponent.search();

    this.typeControl.valueChanges.pipe(
      distinctUntilChanged(),
      filter(_ => this.allowExternalUser)
    ).subscribe((type: 'INTERNAL' | 'EXTERNAL') => {
      this.configForm = type === "INTERNAL" ?
        JSON.parse(JSON.stringify(INTERNAL_USER_FORM_CONFIG)) :
        JSON.parse(JSON.stringify(EXTERNAL_USER_FORM_CONFIG));

      this.formAdvanceSearch?.reset();

      setTimeout(() => this.cloudSearchComponent.search(), 0);
    })
  }

  addOrEdit(row: EmployeeModel | null) {
    if(row) {
      this.router.navigate([this.router.url, 'edit', row.id]).then();
    } else {
      this.router.navigate([this.router.url, 'add']).then();
    }
  }

  convertParamSearch(params: HttpParams, formGroup: FormGroup) {
    if(this.organizationTree && this.organizationTree.length) {
      params = params.set('organizationId', this.getSelectedNodes(this.organizationTree)[0]);
    }
    return params;
  }

  viewDetail(row: EmployeeModel) {
    this.router.navigate([this.router.url, 'detail', row.id]).then();
  }

  onChooseEmployee(e: EmployeeModel) {
    if (!this.multiple) {
      this.uncheckOtherEmployees(Number(e.id));
    }

    this.initializeSelectedEmployeeIfNeeded(e);
    this.updateSelectedEmployee(e);
  }

  chooseEmployee() {
    this.matDialogRef.close(this.selectedEmployee);
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
    event && (this.selectedTreeNode = event);
    this.formAdvanceSearch?.get("path")?.setValue(event.value)
    this.cloudSearchComponent.onSubmit()
  }

  convertField2HttpParamFn(param: HttpParams, formGroup: FormGroup) {
    return this.selectedTreeNode ? param.set(
      "organizationEntity.pathName", '%' + this.selectedTreeNode?.displayValue + '%') : param
  }

  private expandAllNodes(tree: FlatTreeNodeModel[]): FlatTreeNodeModel[] {
    for(const node of tree) {
      node.isExpanded = true;
      if (this.selectedTreeId && node.value == this.selectedTreeId) {
        this.selectedTreeNode = node;
      }
      if(node.children && node.children.length > 0) {
        this.expandAllNodes(node.children);
      }
    }
    return tree;
  }

  onExpandTree() {
    this.isTreeVisible = !this.isTreeVisible;
  }

  private displayCellValue(value: string | null): string {
    return value ? value : '';
  }

  private uncheckOtherEmployees(selectedId: number): void {
    this.cloudSearchComponent.results.data.forEach(item => {
      if (item.id !== selectedId) {
        item.checked = false;
      }
    });
  }

  private initializeSelectedEmployeeIfNeeded(e: EmployeeModel): void {
    if (!this.selectedEmployee && e.checked) {
      this.selectedEmployee = [e];
    }
  }

  private updateSelectedEmployee(e: EmployeeModel): void {
    if (!this.selectedEmployee) return;

    const existingIndex = this.findEmployeeIndex(e[this.mapBy]);    

    if (e.checked) {
      this.handleEmployeeChecked(e, existingIndex);
    } else {
      this.handleEmployeeUnchecked(existingIndex);
    }
  }

  private findEmployeeIndex(employeeId: any): number {
    return this.selectedEmployee.findIndex(
      (item: any) => item[this.trackBy] === employeeId
    );
  }

  private handleEmployeeChecked(e: EmployeeModel, existingIndex: number): void {
    const employeeData = {
      ...e,
      [this.trackBy]: e[this.mapBy],
    };

    if (existingIndex < 0) {
      this.addNewEmployee(employeeData);
    } else {
      this.updateExistingEmployee(existingIndex, e);
    }
  }

  private addNewEmployee(employeeData: any): void {
    if (this.multiple) {
      this.selectedEmployee.push(employeeData);
    } else {
      this.selectedEmployee = [employeeData];
    }
  }

  private updateExistingEmployee(index: number, e: EmployeeModel): void {
    Object.assign(this.selectedEmployee[index], e);
  }

  private handleEmployeeUnchecked(existingIndex: number): void {
    if (existingIndex > -1) {
      this.selectedEmployee.splice(existingIndex, 1);
    }
  }
}
