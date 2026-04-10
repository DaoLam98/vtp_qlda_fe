import { Component, OnInit } from '@angular/core';
import {
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent,
  BaseStatusEnum,
  DateUtilService,
  FlatTreeNodeModel,
  SelectModel,
  UtilsService
} from '@c10t/nice-component-library';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, Validators} from '@angular/forms';
import {Location} from '@angular/common';
import {TranslateService} from '@ngx-translate/core';
import {ActionType, ActionTypeEnum} from 'src/app/shared';
import {HttpParams} from '@angular/common/http';
import {RoleDetailModel} from "src/app/modules/mdm/_models/role.model";
import {environment} from "src/environments/environment";
import {catchError, EMPTY, share} from "rxjs";
import {DEFAULT_REGEX, VIETNAMESE_REGEX} from "src/app/shared/constants/regex.constants";
import {FORM_CONFIG} from "src/app/modules/mdm/role/role-search/role-search.config";
import {EnumUtil} from "src/app/shared/utils/enum.util";
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {Config} from "src/app/common/models/config.model";
import {SelectValuesService} from 'src/app/core/services/selectValues.service';

@Component({
  selector: 'app-role-add-edit-detail',
  standalone: false,
  templateUrl: './role-add-edit-detail.component.html',
  styleUrls: ['./role-add-edit-detail.component.scss'],
})
export class RoleAddEditDetailComponent extends BaseAddEditComponent implements OnInit {
  moduleName: string = 'mdm.role';
  configForm: Config;
  detailData: RoleDetailModel | null = null;
  isView: boolean = false;
  status: BaseStatusEnum = BaseStatusEnum._APPROVED;
  readonly BaseStatusEnum = BaseStatusEnum
  permissionTree: FlatTreeNodeModel[] = [];
  menuTree: FlatTreeNodeModel[] = [];
  actionType: ActionTypeEnum = ActionTypeEnum._ADD;

  protected readonly environment = environment;

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }

  get hasEditPermission() {
    return this.permissionCheckingUtil.hasViewEditPermission(
      this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }

  get hasApprovePermission() {
    return this.permissionCheckingUtil.hasViewApprovePermission(
      this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }

  get hasRejectPermission() {
    return this.permissionCheckingUtil.hasViewRejectPermission(
      this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder,
    protected location: Location,
    protected translateService: TranslateService,
    protected apiService: ApiService,
    protected utilsService: UtilsService,
    protected authoritiesService: AuthoritiesService,
    protected router: Router,
    protected dateUtilService: DateUtilService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
    protected selectValuesService: SelectValuesService,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);

    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.addEditForm = this.fb.group({
      code: ['', [Validators.maxLength(255), Validators.pattern(DEFAULT_REGEX)]],
      name: ['', [Validators.maxLength(255), Validators.pattern(VIETNAMESE_REGEX)]],
      description: ['', [Validators.pattern(VIETNAMESE_REGEX)]],
      status: [''],
      createdBy: [''],
      createdDate: [''],
      lastModifiedBy: [''],
      lastModifiedDate: [''],
      permissions: [null],
      menus: [null],
    });

    this.actionType = this.activatedRoute.routeConfig?.data?.actionType
    this.isView = this.actionType === ActionTypeEnum._VIEW;
    this.isEdit = this.actionType === ActionTypeEnum._EDIT;
  }

  async ngOnInit() {
    super.ngOnInit();

    this.callAPIGetPermissionList();
    this.callAPIGetMenuList();

    if(this.actionType !== ActionTypeEnum._ADD) {
      this.callAPIGetDetail();
    }
  }

  callAPIGetDetail() {
    this.apiService.get<RoleDetailModel>(`${environment.PATH_API_V1}/mdm/role/${this.id}`, new HttpParams())
      .pipe(catchError(error => {
        return EMPTY
      }))
      .subscribe(res => {
        this.detailData = {...res};
        this.status = this.detailData.status as BaseStatusEnum;

        this.initForm(this.detailData)
      })
  }

  getEnumValue(enumKey: BaseStatusEnum) {
    return EnumUtil.getKeysByValues(BaseStatusEnum, [enumKey])
  }

  initForm(detailData: RoleDetailModel) {
    const statusValue = this.isView ?
      this.translateService.instant(this.utilsService.getEnumValueTranslated(BaseStatusEnum, detailData.status || ''))
      : detailData.status;

    const validMenuIds = detailData.menus?.filter((item: any) => item.status === "APPROVED")?.map(menu => menu.id)
      ?.filter((menuId: number) => this.menuTree[0]?.children?.some(tree => tree.value === menuId));

    const formValue = {
      code: detailData.code,
      name: detailData.name,
      description: detailData.description,
      status: statusValue,
      createdBy: detailData.createdBy,
      createdDate: this.dateUtilService.convertDateToDisplayServerTime(detailData.createdDate ?? ''),
      lastModifiedBy: detailData.lastModifiedBy,
      lastModifiedDate: this.dateUtilService.convertDateToDisplayServerTime(detailData.lastModifiedDate ?? ''),
      permissions: detailData.permissions?.filter((item: any) => item.status === "APPROVED")?.map(permission => permission.id),
      menus: validMenuIds
    }

    this.addEditForm.setValue(UtilsService.reduceEntityAttributeForFormControl(this.addEditForm, formValue));
  }

  callAPIGetPermissionList() {
    this.selectValuesService
      .getAutocompleteValuesFromModulePath(
        `${environment.PATH_API_V1}/mdm/permissions`, undefined, undefined, undefined, true)
      .subscribe((res) => {
        this.permissionTree = this.convertListIntoTreeModel(res);
      });
  }

  callAPIGetMenuList() {
    this.selectValuesService
      .getAutocompleteValuesFromModulePath(
        `${environment.PATH_API_V1}/mdm/menu`,
        undefined,
        undefined,
        undefined,
        true
      )
      .subscribe((res) => {
        this.menuTree = this.convertListIntoTreeModel(res);

        const menuControl = this.addEditForm.get('menus');
        const menuIdList = menuControl?.value;
        const validMenuIds = menuIdList?.filter(
          (menuId: number) => this.menuTree[0]?.children?.some(tree => tree.value === menuId));
        menuControl?.setValue(validMenuIds);
      });
  }

  /**
   * @usage Chỉnh sửa
   */
  onRedirect() {
    this.router.navigate([`/mdm/role/edit`, this.detailData!.id]).then();
  }

  /**
   * @usage Kích hoạt
   */
  async onApprove() {
    return this.onHandleAction(this.detailData?.id, ActionType.APPROVE);
  }

  /**
   * @usage Hủy kích hoạt
   */
  async onReject() {
    return this.onHandleAction(this.detailData?.id, ActionType.REJECT);
  }

  onHandleAction(rowId: any, actionType: ActionType) {
    const actionUrl = `${environment.PATH_API_V1}/${FORM_CONFIG.moduleName}/${FORM_CONFIG.name}/${rowId}/${actionType}`;

    const apiCall = this.apiService.post(actionUrl, '').pipe(share({resetOnRefCountZero: true}));

    this.utilsService.execute(
      apiCall,
      this.onSuccessFunc,
      `common.${actionType}.success`,
      `common.title.confirm`,
      [`${this.configForm?.moduleName}.`],
      `common.confirm.${actionType}`,
      undefined,
      undefined,
      "common.button.confirm", // Nút Xác nhận
      "common.button.back" // Nút Quay lại
    );
  }

  onSubmit() {
    const formData = new FormData();
    const payload = new RoleDetailModel(this.addEditForm);
    formData.append('body', this.utilsService.toBlobJon(payload));

    const apiCall = this.isEdit
      ? this.apiService.put(`${environment.PATH_API_V1}/mdm/role/${this.id}`, formData)
      : this.apiService.post(`${environment.PATH_API_V1}/mdm/role`, formData);

    const action = this.isEdit ? 'edit' : 'add';
    this.utilsService.execute(
      apiCall,
      this.onSuccessFunc,
      `common.${action}.success`,
      'common.title.confirm',
      [`${this.configForm?.moduleName}.`],
      `common.confirm.${action}`,
      undefined,
      undefined,
      "common.button.confirm", // Nút Xác nhận
      "common.button.back" // Nút Quay lại
    );
  }

  private convertListIntoTreeModel(list: SelectModel[]): FlatTreeNodeModel[] {
    if(!list?.length) return [];

    const treeChildren = list.map(e => {
      return {
        value: e.value,
        displayValue: e.displayValue,
        checked: true,
        level: 1,
        disabled: false,
        display: true,
        _disabledFuncInput: false,
        _displayFuncInput: true

      }
    })

    return [{
      value: '_ALL',
      displayValue: this.translateService.instant('common.text.all'),
      checked: true,
      level: 0,
      children: treeChildren,
      expandable: true,
      isExpanded: true,
      isFilterExpanded: true,
    }]
  }

  onChangeSelectPermission(e: any) {
    this.permissionTree = this.expandTree(this.permissionTree);
  }

  onChangeSelectMenu(e: any) {
    this.menuTree = this.expandTree(this.menuTree);
  }

  private expandTree(tree: FlatTreeNodeModel[]): FlatTreeNodeModel[] {
    if (!tree || tree.length === 0 || tree[0].isExpanded) return tree;
    return tree.map((item: any) => ({
      ...item,
      expandable: true,
      isExpanded: true,
      isFilterExpanded: true,
    }));
  }
}
