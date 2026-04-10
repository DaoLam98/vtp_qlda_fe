import {Location} from "@angular/common";
import {HttpParams} from "@angular/common/http";
import {Component, OnInit} from "@angular/core";
import {FormBuilder, Validators} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {ActivatedRoute, Router} from "@angular/router";
import {
  ActionTypeEnum,
  AlignEnum,
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent,
  BaseStatusEnum,
  ButtonClickEvent,
  ButtonModel,
  ColumnModel,
  ColumnTypeEnum,
  DateUtilService,
  IconTypeEnum,
  SelectModel,
  UtilsService,
} from "@c10t/nice-component-library";
import {TranslateService} from "@ngx-translate/core";
import { catchError, EMPTY, forkJoin, lastValueFrom, map, Observable, of } from 'rxjs';
import {SelectValuesService} from "src/app/core/services/selectValues.service";
import {
  PopupChooseOrganizationComponent
} from "src/app/shared/components/organization/organization-popup-choosen/organization-popup-choosen.component";
import {environment} from "src/environments/environment";
import {OrganizationModel} from "../../_models/organization.model";
import {DEFAULT_REGEX, VIETNAMESE_REGEX} from "src/app/shared/constants/regex.constants";
import {Utils} from "src/app/shared/utils/utils";
import {ConfigVOModel, StaffModel} from "src/app/modules/mdm/_models/config-vo.model";
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {Config} from "src/app/common/models/config.model";
import {FORM_CONFIG} from "src/app/modules/mdm/config-vo/config-vo-search/config-vo-search.config";

@Component({
  selector: "app-config-vo-add-edit-detail",
  templateUrl: "./config-vo-add-edit-detail.component.html",
  styleUrls: ["./config-vo-add-edit-detail.component.scss"],
  standalone: false,
})
export class ConfigVoAddEditDetailComponent extends BaseAddEditComponent implements OnInit {
  moduleName: string = "mdm.config-vo";
  configForm: Config;
  model!: ConfigVOModel;
  isView: boolean = false;
  checkIsActive: boolean = false;
  organizationColumns: ColumnModel[] = [];
  organizationButtons: ButtonModel[] = [];
  lstStaffColumns: ColumnModel[] = [];
  lstStaffButtons: ButtonModel[] = [];
  orgFormValues: SelectModel[] = [
    {
      displayValue: this.translateService.instant("common.organization.dependent"),
      value: "DEPENDENT",
      rawData: "DEPENDENT",
      disabled: false
    },
    {
      displayValue: this.translateService.instant("common.organization.independent"),
      value: "INDEPENDENT",
      rawData: "INDEPENDENT",
      disabled: false
    },
    {
      displayValue: this.translateService.instant("common.organization.unknown"),
      value: "UNKNOWN",
      rawData: "UNKNOWN",
      disabled: false
    }
  ];
  menuValues$: Observable<SelectModel[]> = of([]);
  typeValues$: Observable<SelectModel[]> = of([]);
  areaValues$: Observable<SelectModel[]> = of([]);
  priorityValues$: Observable<SelectModel[]> = of([]);
  stypeValues$: Observable<SelectModel[]> = of([]);
  positionValues: SelectModel[] = [];
  defaultOption: SelectModel = {
    value: -1,
    disabled: false,
    displayValue: this.translateService.instant("common.combobox.option.default"),
    rawData: -1,
  };
  internalUserValues: SelectModel[] = [this.defaultOption];
  /** [UI - Bảng "Cấu hình trình ký" - Cột "Nhóm ký song song"] Các lựa chọn của Combobox "Nhóm ký song song" */
  signLevelParallelValues: SelectModel[] = [
    {
      displayValue: `${this.translateService.instant("common.group")} 1`,
      value: 1,
      rawData: 1,
      disabled: false
    }
  ];
  lstStaffRowData = {
    signLevelParallel: null,
    jobPositions: [],
    staffId: null,
    isRequire: false,
    signImage: false,
    isPromulgate: false,
  };

  // Map to hold filtered jobPosition options
  jobPositionMap = new Map<number, SelectModel[]>();


  protected readonly Utils = Utils;
  protected readonly environment = environment;

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? "", this.configForm?.name ?? "");
  }

  get hasEditPermission() {
    return this.permissionCheckingUtil.hasViewEditPermission(
      this.configForm?.moduleName ?? "", this.configForm?.name ?? "");
  }

  get hasApprovePermission() {
    return this.permissionCheckingUtil.hasViewApprovePermission(
      this.configForm?.moduleName ?? "", this.configForm?.name ?? "");
  }

  get hasRejectPermission() {
    return this.permissionCheckingUtil.hasViewRejectPermission(
      this.configForm?.moduleName ?? "", this.configForm?.name ?? "");
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
    protected selectValuesService: SelectValuesService,
    protected matDialog: MatDialog,
    protected permissionCheckingUtil: PermissionCheckingUtil,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);

    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.isView = this.activatedRoute.routeConfig?.data?.actionType === ActionTypeEnum._VIEW;

    this.addEditForm = this.fb.group({
      code: ["", [Validators.pattern(DEFAULT_REGEX)]],
      title: ["", [Validators.pattern(VIETNAMESE_REGEX)]],
      menuId: [""],
      typeId: [""],
      areaId: [""],
      priorityId: [""],
      stypeId: [""],
      autoPromulgateText: [false],
      canAdd: [false],
      description: ["", [Validators.pattern(VIETNAMESE_REGEX)]],
      status: [],
      createdDate: [],
      createdBy: [],
      lastModifiedDate: [],
      lastModifiedBy: [],
      organizations: [[]],
      lstStaff: [[]],
      signLevelParallel: [false],
    });

    this.initColumnButtonOrganization()
    this.initColumnButtonLstStaff()

    this.menuValues$ = this.selectValuesService.getAutocompleteValuesFromModulePath(
      `${environment.PATH_API_V1}/mdm/menu`,
      undefined,
      undefined,
      undefined,
      true
    );

    this.typeValues$ = this.selectValuesService.getAutocompleteValuesFromVOffice(
      `${environment.PATH_API_V1}/voffice-gateway/fields`,
      [{
        key: "type",
        value: 1
      }],
      "listForm"
    );
    this.areaValues$ = this.selectValuesService.getAutocompleteValuesFromVOffice(
      `${environment.PATH_API_V1}/voffice-gateway/fields`,
      [{
        key: "type",
        value: 3
      }],
      "listRegion"
    );
    this.priorityValues$ = this.selectValuesService.getAutocompleteValuesFromVOffice(
      `${environment.PATH_API_V1}/voffice-gateway/fields`,
      [{
        key: "type",
        value: 4
      }],
      "listUrgency"
    );
    this.stypeValues$ = this.selectValuesService.getAutocompleteValuesFromVOffice(
      `${environment.PATH_API_V1}/voffice-gateway/fields`,
      [{
        key: "type",
        value: 2
      }],
      "listSecurity"
    );

    /** [UI - Bảng "Trình ký song song" - Toggle "Trình ký song song"] */
    this.addEditForm.get("signLevelParallel")?.valueChanges.subscribe((bool: boolean) => {
      const groupColIndex = this.lstStaffColumns.findIndex(item => item.columnDef == "signLevelParallel");
      this.lstStaffColumns[groupColIndex].isShowHeader = bool;
      this.lstStaffColumns[groupColIndex].display = (e: any) => bool;
      this.lstStaffColumns[groupColIndex].isShowHeader = bool;

      if(bool) {
        const litStaff = this.addEditForm.get("lstStaff")!.value;
        const isAllSignLevelParallelNull = litStaff.every((staff: any) => !staff.signLevelParallel);
        if(isAllSignLevelParallelNull) {
          /** Tạo ra số logic bằng với số bản ghi trong bảng */
          this.signLevelParallelValues = new Array(litStaff.length).fill((x: any) => 0).map((_, index) => ({
            displayValue: `${this.translateService.instant("common.group")} ${index + 1}`,
            value: index + 1,
            rawData: index + 1,
            disabled: false
          }));

          const newLstStaff = litStaff.map((staff: any, index: number) => ({
            ...staff,
            signLevelParallel: index + 1
          }));

          this.addEditForm.get("lstStaff")!.setValue(newLstStaff);
        }
      }
    });
  }

  initColumnButtonOrganization() {
    this.organizationColumns.push(
      {
        columnDef: "stt",
        header: "stt",
        headerClassName: "mat-column-stt width-5 min-width-40",
        className: "mat-column-stt",
        title: (e: OrganizationModel) => {
          const values = this.addEditForm.get("organizations")?.value as OrganizationModel[];
          const index = values.indexOf(e) + 1;
          return index.toString();
        },
        cell: (e: OrganizationModel) => {
          const values = this.addEditForm.get("organizations")?.value as OrganizationModel[];
          const index = values.indexOf(e) + 1;
          return index.toString();
        },
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
      {
        columnDef: "name",
        header: "name",
        headerClassName: "mat-column-name width-70",
        className: "mat-column-name",
        title: (e: OrganizationModel) => e.name || "",
        cell: (e: OrganizationModel) => e.name || "",
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: "orgForm",
        header: "orgForm",
        headerClassName: "mat-column-orgForm width-25",
        className: "mat-column-orgForm",
        title: (e: OrganizationModel) => this.orgFormValues.find(item => item.value === e.orgForm)?.displayValue || "",
        cell: (e: OrganizationModel) => this.orgFormValues.find(item => item.value === e.orgForm)?.displayValue || "",
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
    );

    this.organizationButtons.push({
      columnDef: "delete",
      color: "primary",
      icon: "fa fa-trash",
      iconType: IconTypeEnum.FONT_AWESOME,
      click: "onDeleteOrganization",
      className: "primary content-cell-align-center",
      title: "common.title.delete",
      display: () => !this.isView && (this.hasAddPermission || this.hasEditPermission),
      header: "common.table.action.title",
      alignHeader: AlignEnum.CENTER,
    });
  }

  private buildColumnStt() {
    return {
      columnDef: "stt",
      header: "stt",
      headerClassName: "mat-column-stt width-5 min-width-40",
      className: "mat-column-stt",
      title: (e: StaffModel) => {
        const values = this.addEditForm.get("lstStaff")?.value as StaffModel[];
        const index = values.indexOf(e) + 1;
        return index.toString();
      },
      cell: (e: StaffModel) => {
        const values = this.addEditForm.get("lstStaff")?.value as StaffModel[];
        const index = values.indexOf(e) + 1;
        e.prevSignLevelParallel = e.signLevelParallel;
        return index.toString();
      },
      columnType: ColumnTypeEnum.VIEW,
      alignHeader: AlignEnum.CENTER,
      align: AlignEnum.CENTER,
    }
  }

  private buildSignLevelParallel() {
    return {
      columnDef: "signLevelParallel",
      header: "signLevelParallel",
      className: "mat-column-signLevelParallel",
      title: (e: StaffModel) => `${this.translateService.instant("common.group")} ${e.signLevelParallel}`,
      cell: (e: StaffModel) => `${this.translateService.instant("common.group")} ${e.signLevelParallel}`,
      optionValues: (e: StaffModel) => this.signLevelParallelValues,
      display: (e: StaffModel) => this.addEditForm.get("signLevelParallel")!.value,
      disabled: (e: StaffModel) => this.isView || !this.addEditForm.get("signLevelParallel")!.value,
      onCellValueChange: (e: StaffModel) => {
        this.handleSignLevelParallelChange(e);
      },
      columnType: this.isView ? ColumnTypeEnum.VIEW : ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE,
      alignHeader: AlignEnum.CENTER,
      align: AlignEnum.LEFT,
    };
  }

  /** -------------------------
   *  Sign level parallel helpers
   *  ------------------------*/

  /** Main entry: build context and route to cases */
  private handleSignLevelParallelChange(e: StaffModel): void {
    const values = this.addEditForm.get("lstStaff")?.value as StaffModel[];
    if (!Array.isArray(values) || values.length === 0) return;

    const ctx = this.buildSignLevelContext(e, values);

    let newValues: StaffModel[] = [];

    if (this.isMoveToLastGroup(ctx)) {
      newValues = this.computeCaseMoveToLast(ctx);
      if (ctx.sourceQuantity >= 2) {
        this.extendSignLevelOptions(ctx.last);
      }
    } else if (this.isMoveBetweenMiddleGroups(ctx)) {
      newValues = this.computeCaseMoveBetween(ctx);
      if (ctx.sourceQuantity === 1) {
        this.reduceSignLevelOptionsIfNeeded();
      }
    } else {
      // move from last -> some other
      newValues = this.computeCaseMoveFromLast(ctx);
    }

    this.applySortedValuesIfNeeded(values, newValues);
  }

  /** Build a small context object to pass to handlers */
  private buildSignLevelContext(e: StaffModel, values: StaffModel[]) {
    const changedIndex = values.indexOf(e);
    const prevSignLevelParallel = e.prevSignLevelParallel;
    const currentSignLevelParallel = e.signLevelParallel || 0;
    const lastItemSignLevelParallel = values[values.length - 1].prevSignLevelParallel;
    const sourceQuantity = values.filter(item => item.prevSignLevelParallel === prevSignLevelParallel)?.length;

    return {
      values,
      changedIndex,
      prevSignLevelParallel,
      currentSignLevelParallel,
      last: lastItemSignLevelParallel,
      sourceQuantity,
      e
    };
  }

  /** Conditions (kept simple) */
  private isMoveToLastGroup(ctx: any): boolean {
    return ctx.currentSignLevelParallel === ctx.last;
  }
  private isMoveBetweenMiddleGroups(ctx: any): boolean {
    return ctx.prevSignLevelParallel !== ctx.last;
  }

  /** Case 1: move to last group (TH1) */
  private computeCaseMoveToLast(ctx: any): StaffModel[] {
    const { values, changedIndex, sourceQuantity, last } = ctx;

    const newValues = values.map((item: any, index: number) => {
      let newSignLevelParallel;
      if (sourceQuantity === 1) {
        if (changedIndex >= index) {
          newSignLevelParallel = item.signLevelParallel;
        } else {
          newSignLevelParallel = (item?.signLevelParallel || 0) - 1;
        }
      } else {
        newSignLevelParallel = changedIndex === index ? last + 1 : item.signLevelParallel;
      }

      return {
        ...item,
        signLevelParallel: newSignLevelParallel
      };
    });

    return newValues;
  }
  /** Case 2: move between middle groups (TH2) */
  private computeCaseMoveBetween(ctx: any): StaffModel[] {
    const { values } = ctx;

    return values.map((item: any, index: number) => ({
      ...item,
      signLevelParallel: this.getNewSignLevelForMiddleMove(ctx, item, index)
    }));
  }

  /** Determine new sign level for each item in middle-move TH2 */
  private getNewSignLevelForMiddleMove(ctx: any, item: any, index: number): number {
    const isMoveDown = ctx.currentSignLevelParallel > ctx.prevSignLevelParallel;

    return isMoveDown
      ? this.handleMoveDownBetween(ctx, item, index)
      : this.handleMoveUpBetween(ctx, item, index);
  }

  /** a < b (move downward) */
  private handleMoveDownBetween(ctx: any, item: any, index: number): number {
    if (ctx.sourceQuantity !== 1) return item.signLevelParallel;

    // Khi nhóm a chỉ có 1 bản ghi
    const { changedIndex, currentSignLevelParallel } = ctx;

    if (changedIndex > index) return item.signLevelParallel;
    if (changedIndex === index) return currentSignLevelParallel - 1;

    return (item?.signLevelParallel || 0) - 1;
  }

  /** a > b (move upward) */
  private handleMoveUpBetween(ctx: any, item: any, index: number): number {
    if (ctx.sourceQuantity !== 1) return item.signLevelParallel;

    // Khi nhóm a chỉ có 1 bản ghi
    const { changedIndex } = ctx;

    if (changedIndex < index) return item.prevSignLevelParallel - 1;

    return item.signLevelParallel;
  }


  /** Case 3: move from last -> some group (TH3) */
  private computeCaseMoveFromLast(ctx: any): StaffModel[] {
    const { values, currentSignLevelParallel, last } = ctx;
    const len = values.length;

    // sub-case: move to the previous group (a = n-1)
    if (currentSignLevelParallel === last - 1) {
      return values.map((item: any, index: number) => {
        let newSignLevelParallel;
        if (index === len - 2) {
          newSignLevelParallel = (item.prevSignLevelParallel || 0) + 1;
        } else if (index === len - 1) {
          newSignLevelParallel = (item.prevSignLevelParallel || 0) - 1;
        } else {
          newSignLevelParallel = item.signLevelParallel;
        }

        return {
          ...item,
          signLevelParallel: newSignLevelParallel
        };
      });
    }

    // sub-case: target above the two last groups
    const targetQuantity = values.filter((item: any) => item.prevSignLevelParallel === last - 1)?.length;
    if (targetQuantity === 1) {
      // remove one option handled by caller
    }

    return values.map((item: any, index: number) => {
      let newSignLevelParallel;
      if (targetQuantity === 1) {
        newSignLevelParallel = item.signLevelParallel;
      } else {
        newSignLevelParallel = index === values.length - 2 ? item.prevSignLevelParallel + 1 : item.signLevelParallel;
      }

      return {
        ...item,
        signLevelParallel: newSignLevelParallel
      };
    });
  }

  /** Extend signLevelParallelValues (add 1 option) - used in TH1 when sourceQuantity >= 2 */
  private extendSignLevelOptions(lastValue: number) {
    this.signLevelParallelValues = [
      ...this.signLevelParallelValues,
      {
        displayValue: `${this.translateService.instant("common.group")} ${lastValue + 1}`,
        value: lastValue + 1,
        rawData: lastValue + 1,
        disabled: false
      }
    ];
  }

  /** Reduce signLevelParallelValues (remove last option) - used in TH2 when sourceQuantity === 1 or similar */
  private reduceSignLevelOptionsIfNeeded() {
    // Keep same behavior as original: slice last
    this.signLevelParallelValues = this.signLevelParallelValues.slice(0, -1);
  }

  /** Compare, sort and apply new values back to form if changed */
  private applySortedValuesIfNeeded(oldValues: StaffModel[], newValues: StaffModel[]) {
    if (!Array.isArray(oldValues)) return;

    const sorted = [...newValues].sort((a, b) => (a.signLevelParallel || 0) - (b.signLevelParallel || 0));
    const isSorted = oldValues.every((item, idx) => item === sorted[idx]);

    if (!isSorted) {
      // preserve previous behavior: set value without emitting event and then set promulgate
      this.addEditForm.get("lstStaff")?.setValue(sorted, { emitEvent: false });
      this.setLastStaffPromulgate();
    }
  }

  buildJobPositions() {
    return {
      columnDef: "jobPositions",
      header: "positionId",
      headerClassName: "mat-column-jobPositions width-30",
      className: "mat-column-jobPositions",
      title: (e: StaffModel) =>
        e.jobPositions.map((i) => this.positionValues.find((j) => j.value === i)?.displayValue).join(', '),
      cell: (e: StaffModel) =>
        e.jobPositions.map((i) => this.positionValues.find((j) => j.value === i)?.displayValue).join(', '),
      isMultipleSelect: true,
      optionValues: (e: StaffModel) => e.jobPositionsValues || [],
      columnType: (e: StaffModel) => {
        const values = this.addEditForm.get("lstStaff")?.value as StaffModel[];
        const rowData = values[values.indexOf(e)];
        return (this.isView || !!rowData?.staffId && rowData?.staffId !== -1)
          ? ColumnTypeEnum.VIEW
          : ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE;
      },
      alignHeader: AlignEnum.CENTER,
      align: AlignEnum.LEFT,
      onCellValueChange: (e: StaffModel) => {
        e.staffId = null;
        this.updateStaffAndPositionCombobox();
      },
    }
  }
  buildColumnStaffId() {
    return {
      columnDef: "staffId",
      header: "staffId",
      headerClassName: "mat-column-staffId width-30",
      className: "mat-column-staffId",
      title: (e: StaffModel) =>
        !!e.staffId ? `${this.internalUserValues.find((item) => item.value == e.staffId)?.displayValue}` : '',
      cell: (e: StaffModel) =>
        !!e.staffId ? `${this.internalUserValues.find((item) => item.value == e.staffId)?.displayValue}` : '',
      optionValues: (e: StaffModel) => e.internalUserValues || [],
      columnType: (e: StaffModel) => {
        const values = this.addEditForm.get("lstStaff")?.value as StaffModel[];
        const rowData = values[values.indexOf(e)] as any;
        return (this.isView || rowData?.jobPositions?.length >= 2 || (rowData?.jobPositions?.length === 1 && !rowData?.jobPositions.includes(
          -1)))
          ? ColumnTypeEnum.VIEW
          : ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE;
      },
      alignHeader: AlignEnum.CENTER,
      align: AlignEnum.LEFT,
      onCellValueChange: (e: StaffModel) => {
        if (e.staffId == -1) {
          setTimeout(() => (e.staffId = null));
        }
        e.jobPositions = [];
        this.updateStaffAndPositionCombobox();
      },
    };
  }

  buildColumnIsRequired() {
    return {
      columnDef: "isRequire",
      header: "isRequire",
      className: "mat-column-isRequire",
      title: (e: StaffModel) => `${e.isRequire}`,
      cell: (e: StaffModel) => `${e.isRequire}`,
      columnType: (e: StaffModel) => e ? ColumnTypeEnum.CHECKBOX : ColumnTypeEnum.VIEW,
      disabled: (e: StaffModel) => this.isView,
      alignHeader: AlignEnum.CENTER,
      align: AlignEnum.CENTER,
    }
  }
  buildColumnSignImage() {
    return {
      columnDef: "signImage",
      header: "signImage",
      className: "mat-column-signImage",
      title: (e: StaffModel) => `${e.signImage}`,
      cell: (e: StaffModel) => `${e.signImage}`,
      columnType: (e: StaffModel) => e ? ColumnTypeEnum.CHECKBOX : ColumnTypeEnum.VIEW,
      disabled: (e: StaffModel) => this.isView,
      alignHeader: AlignEnum.CENTER,
      align: AlignEnum.CENTER,
    }
  }

  buildColumnIsPro() {
     return {
      columnDef: "isPromulgate",
       header: "isPromulgate",
      className: "mat-column-isPromulgate",
      title: (e: StaffModel) => `${e.isPromulgate}`,
      cell: (e: StaffModel) => `${e.isPromulgate}`,
      columnType: (e: StaffModel) => e ? ColumnTypeEnum.CHECKBOX : ColumnTypeEnum.VIEW,
      disabled: (e: StaffModel) => true,
      alignHeader: AlignEnum.CENTER,
      align: AlignEnum.CENTER,
    }
  }

  initColumnButtonLstStaff() {
    this.lstStaffColumns.push(
      this.buildColumnStt(),
      this.buildSignLevelParallel(),
      this.buildJobPositions(),
      this.buildColumnStaffId(),
      this.buildColumnIsRequired(),
      this.buildColumnSignImage(),
      this.buildColumnIsPro(),
    );

    this.lstStaffButtons.push(
      {
        columnDef: "detail",
        color: "primary",
        icon: "fa fa-arrow-up",
        iconType: IconTypeEnum.FONT_AWESOME,
        click: "onReorderUp",
        className: "primary content-cell-align-center",
        display: () => !this.isView && (this.hasAddPermission || this.hasEditPermission),
        disabled: (e: StaffModel) => {
          const values = this.addEditForm.get("lstStaff")?.value as StaffModel[];
          return !values.indexOf(e);
        },
        title: "common.title.reorder-up",
        header: "common.table.action.title",
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: "edit",
        color: "primary",
        icon: "fa fa-arrow-down",
        iconType: IconTypeEnum.FONT_AWESOME,
        click: "onReorderDown",
        className: "primary content-cell-align-center",
        title: "common.title.reorder-down",
        display: () => !this.isView && (this.hasAddPermission || this.hasEditPermission),
        disabled: (e: StaffModel) => {
          const values = this.addEditForm.get("lstStaff")?.value as StaffModel[];
          return values.indexOf(e) === (values?.length - 1);
        },
        header: "common.table.action.title",
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: "delete",
        color: "primary",
        icon: "fa fa-trash",
        iconType: IconTypeEnum.FONT_AWESOME,
        click: "onDeleteStaff",
        className: "primary content-cell-align-center",
        title: "common.title.delete",
        display: () => !this.isView && (this.hasAddPermission || this.hasEditPermission),
        header: "common.table.action.title",
        alignHeader: AlignEnum.CENTER,
      }
    );

  }

  async ngOnInit() {
    super.ngOnInit();

    if(this.isEdit) {
      this.callAPIGetDetail();
    }

    if(this.isView) {
      this.addEditForm.get("autoPromulgateText")?.disable();
      this.addEditForm.get("canAdd")?.disable();
      this.addEditForm.get("signLevelParallel")?.disable();
    }
  }

  callAPIGetDetail() {
    this.apiService.get<ConfigVOModel>(
      `${environment.PATH_API_V1}/${FORM_CONFIG.moduleName}/${FORM_CONFIG.name}/${this.id}`, new HttpParams())
      .pipe(catchError(error => {
        return EMPTY;
      }))
      .subscribe(res => {
        this.model = {...res};

        this.initForm(this.model);
        this.menuValues$ = this.selectValuesService.getAutocompleteValuesFromModulePath(
          `${environment.PATH_API_V1}/mdm/menu`,
          undefined,
          undefined,
          undefined,
          true,
          undefined,
          false,
        );
      });
  }

  onUpdateStatus(status: "approve" | "reject") {
    const apiCall = this.apiService.post(`${environment.PATH_API_V1}/mdm/config-vo/${this.id}/${status}`, "");

    this.utilsService.execute(
      apiCall,
      this.onSuccessFunc,
      `common.${status}.success`,
      `common.title.confirm`,
      [`${this.configForm?.moduleName}.`],
      `common.confirm.${status}`,
      undefined,
      undefined,
      "common.button.confirm", // Nút Xác nhận
      "common.button.back" // Nút Quay lại
    );
  }

  onReorderUp(event: StaffModel) {
    const lstStaffControl = this.addEditForm.get("lstStaff");
    if(!lstStaffControl) {
      return;
    }
    const lstStaffValue = [...(lstStaffControl.value || [])];
    const index = lstStaffValue.findIndex((i) => i === event);
    if(index === 0) return;
    [lstStaffValue[index - 1], lstStaffValue[index]] = [lstStaffValue[index], lstStaffValue[index - 1]];

    // Hoán vị lại trường signLevelParallel
    const tempId = lstStaffValue[index - 1].signLevelParallel;
    lstStaffValue[index - 1].signLevelParallel = lstStaffValue[index].signLevelParallel;
    lstStaffValue[index].signLevelParallel = tempId;

    lstStaffControl?.setValue(lstStaffValue);

    this.setLastStaffPromulgate();
  }

  onReorderDown(event: StaffModel) {
    const lstStaffControl = this.addEditForm.get("lstStaff");
    if(!lstStaffControl) {
      return;
    }

    const lstStaffValue = [...(lstStaffControl.value || [])];
    const index = lstStaffValue.findIndex((i) => i === event);
    if(index === lstStaffValue.length - 1) return;
    [lstStaffValue[index + 1], lstStaffValue[index]] = [lstStaffValue[index], lstStaffValue[index + 1]];
    // Hoán vị lại trường signLevelParallel
    const tempId = lstStaffValue[index + 1].signLevelParallel;
    lstStaffValue[index + 1].signLevelParallel = lstStaffValue[index].signLevelParallel;
    lstStaffValue[index].signLevelParallel = tempId;
    lstStaffControl?.setValue(lstStaffValue);

    this.setLastStaffPromulgate();
  }

  /**
   * [UI - Bảng "Trình ký song song" - Cột "Ban hành"] Check người ban hành là bản ghi cuối cùng
   */
  setLastStaffPromulgate() {
    const lstStaff = this.addEditForm.get("lstStaff")?.value || [];
    const newLstStaff = lstStaff?.map((staff: StaffModel, staffIndex: number) => {
      return {
        ...staff,
        isPromulgate: (lstStaff.length - 1) === staffIndex
      };
    });
    this.addEditForm.get("lstStaff")?.setValue(newLstStaff);
  }

  onRedirect(item: any) {
    this.router.navigate([`/mdm/config-vo/edit`, item]).then();
  }

  onOrganizationTableAction(event: ButtonClickEvent) {
    if(event.action == "onDeleteOrganization") {
      this.onDeleteOrganization(event.index);
    }
  }

  /**
   * @usageNotes [UI - Bảng "Danh sách đơn vị" - Thao tác "Xóa"] Xóa đơn vị khỏi bảng
   * @params index - vị trí (index) của đơn vị cần xóa trong mảng organizations.
   * @returns Không trả về giá trị (void).
   */
  async onDeleteOrganization(index: number | null | undefined) {
    const values = this.addEditForm.get("organizations")?.value;
    values.splice(index, 1);
    this.addEditForm.get("organizations")?.setValue(values);
    await this.updateJobPositionAndStaffOptions();

    if(values?.length === 0) {
      this.positionValues = [];
      this.internalUserValues = [];
    }
  }

  onDeleteStaff(e: StaffModel, deletedIndex: number) {
    const values = this.addEditForm.get("lstStaff")?.value || [];
    const index = values.indexOf(e);
    let isLastItem: boolean = deletedIndex === values.length - 1;

    const lstStaffAfterDelete = this.deleteAndAdjust(values, index as number);


    const isSignLevelParallel = this.addEditForm.get("signLevelParallel")?.value;
    /** Toggle "Trình ký song song" bật && Bản ghi cuối && Số bản ghi còn lại > 2 */
    if(isSignLevelParallel && isLastItem && lstStaffAfterDelete.length >= 2) {
      /** Đổi nhóm ký của bản ghi cuối của bảng sau khi xóa thành lựa chọn lớn nhất của combobox */
      lstStaffAfterDelete[lstStaffAfterDelete.length - 1].signLevelParallel = this.signLevelParallelValues[this.signLevelParallelValues.length - 1].value;
    }

    this.addEditForm.get("lstStaff")?.setValue(lstStaffAfterDelete);

    this.setLastStaffPromulgate();
    this.updateStaffAndPositionCombobox();
  }

  /**
   * [UI - Bảng "Danh sách đơn vị" - Button "Chọn đơn vi áp dụng"] Thêm đơn vị vào bảng từ popup "Chọn đơn vị"
   */
  onOpenOrgDialog() {
    this.matDialog
      .open(PopupChooseOrganizationComponent, {
        disableClose: false,
        width: "1500px",
        maxWidth: "90vw",
        maxHeight: "90vh",
        data: {
          selected: this.addEditForm.get("organizations")?.value,
        },
      })
      .afterClosed()
      .subscribe(async (organizations: OrganizationModel[]) => {
        if(organizations) {
          /** Sắp xếp theo thứ tự từ điển */
          organizations.sort((a, b) => (a.name || "").localeCompare(b.name || ("")));
          this.addEditForm.get("organizations")?.patchValue(organizations);

          await this.updateJobPositionAndStaffOptions();
        }
      });
  }

  /**
   * [UI - Bảng "Cấu hình trình ký" - Button "Thêm"] Thêm dòng cá nhân ký duyệt vào bảng
   */
  onAddRow(): void {
    const values: StaffModel[] = this.addEditForm.get("lstStaff")?.value || [];

    let maxSignLevelParallelInListStaff
      = Math.max(...(values.map((item: any) => item.signLevelParallel || 0)) || []);
    let maxSignLevelParallelInValues
      = Math.max(...this.signLevelParallelValues.map((item: any) => item.value));

    const lastSignLevelParallel = values[values.length - 1]?.signLevelParallel ?? 0;
    const currentSignLevelParallel = lastSignLevelParallel + 1;
    this.addEditForm.get('lstStaff')?.setValue([
      ...values,
      {
        ...this.lstStaffRowData,
        signLevelParallel: currentSignLevelParallel,
        internalUserValues: this.internalUserValues.filter((i) => i.value == -1 || !values.some((j) => j.staffId == i.value)),
        jobPositionsValues: this.positionValues.filter((i) => !values.some((j) => j.jobPositions.includes(i.value))),
      },
    ]);

    this.setLastStaffPromulgate();

    if(maxSignLevelParallelInListStaff < maxSignLevelParallelInValues) return;
    this.signLevelParallelValues = [
      ...this.signLevelParallelValues,
      {
        displayValue: `${this.translateService.instant("common.group")} ${currentSignLevelParallel}`,
        value: currentSignLevelParallel,
        rawData: currentSignLevelParallel,
        disabled: false
      }
    ];
  }

  onSubmit() {
    const formData = new FormData();
    const payload = new ConfigVOModel(this.addEditForm);
    formData.append("body", this.utilsService.toBlobJon(payload));

    const apiCall = this.isEdit
      ? this.apiService.put(
        `${environment.PATH_API_V1}/${FORM_CONFIG.moduleName}/${FORM_CONFIG.name}/${this.id}`, formData)
      : this.apiService.post(`${environment.PATH_API_V1}/${FORM_CONFIG.moduleName}/${FORM_CONFIG.name}`, formData);

    const action = this.isEdit ? "edit" : "add";
    this.utilsService.execute(
      apiCall,
      this.onSuccessFunc,
      `common.${action}.success`,
      "common.title.confirm",
      [`${this.configForm?.moduleName}.`],
      `common.confirm.${action}`,
      undefined,
      undefined,
      "common.button.confirm", // Nút Xác nhận
      "common.button.back" // Nút Quay lại
    );
  }

  private async initForm(model: ConfigVOModel) {
    const statusValue = this.isView ?
      this.translateService.instant(this.utilsService.getEnumValueTranslated(BaseStatusEnum, model.status || ""))
      : model.status;
    this.checkIsActive = model?.status === "APPROVED";

    const organizations = model.organizations?.map((org: OrganizationModel) => {
      return {
        id: org.id,
        name: org.name,
        orgForm: org.orgForm,
      };
    }) || [];
    await this.updateJobPositionAndStaffOptions(organizations);

    const signLevelParallel = model.lstStaff?.some(staff => staff.signLevelParallel);

    let maxSignLevelParallel: number = Math.max(
      ...(model.lstStaff?.map((item: StaffModel) => item.signLevelParallel || 0) || [])) || 0;
    if(maxSignLevelParallel && Math.abs(maxSignLevelParallel) !== Infinity) {
      this.signLevelParallelValues = new Array(maxSignLevelParallel).fill((x: any) => 0).map((_, index) => ({
        displayValue: `${this.translateService.instant("common.group")} ${index + 1}`,
        value: index + 1,
        rawData: index + 1,
        disabled: false
      }));
    }

    const lstStaff = model.lstStaff ?? [];

    /** Sắp xếp mảng lstStaff theo thuộc tính signLevel tăng dần */
    lstStaff.sort((a, b) => (a.signLevel || 0) - (b.signLevel || 0));

    const allJobPositionIds = lstStaff.flatMap(item => item.jobPositions.map(pos => pos.id));
    const listStaff = lstStaff.map((item: StaffModel) => {
      const jobPositions = item.jobPositions?.map((pos) => pos.id);
      return {
        ...item,
        jobPositions,
        internalUserValues: this.internalUserValues.filter(
          (i) => i.value == -1 || i.value == item.staffId || !lstStaff.some((j) => j.staffId == i.value),
        ),
        jobPositionsValues: this.positionValues.filter((i) => jobPositions?.includes(i.value) || !allJobPositionIds.includes(i.value)),
      };
    });

    const formValue = {
      ...model,
      signLevelParallel,
      organizations: organizations,
      lstStaff: listStaff,
      status: statusValue,
      createdBy: model.createdBy,
      createdDate: this.dateUtilService.convertDateToDisplayServerTime(model.createdDate || ""),
      lastModifiedBy: model.lastModifiedBy,
      lastModifiedDate: this.dateUtilService.convertDateToDisplayServerTime(model.lastModifiedDate || ""),
    };

    this.addEditForm.patchValue(formValue);
  }

  /**
   * Xoá một phần tử khỏi mảng `data` tại vị trí `deleteIndex` và điều chỉnh lại Nhóm ký song song nếu cần thiết.
   * Trả về mảng mới sau khi xoá và biến boolean `isDecrement` cho biết có cần giảm số lượng nhóm ký song song hay không.
   */
  private deleteAndAdjust(data: any[], deleteIndex: number) {
    // Kiểm tra nếu chỉ số xoá không hợp lệ thì trả về mảng gốc và không giảm nhóm ký song song.
    if(deleteIndex < 0 || deleteIndex >= data.length) {
      return data;
    }

    // Lưu lại phần tử bị xoá và phần tử kế tiếp (nếu có).
    const deletedItem = data[deleteIndex];

    // Xoá phần tử tại vị trí deleteIndex.
    data.splice(deleteIndex, 1);

    const quantity = data.filter(item => item.signLevelParallel === deletedItem.signLevelParallel)?.length;

    data = data.map((item: any, index: number) => {
      let newSignLevelParallel: number = item.signLevelParallel;
      if(index >= deleteIndex && quantity === 0) {
        newSignLevelParallel = item.signLevelParallel - 1;
      }
      return {
        ...item,
        signLevelParallel: newSignLevelParallel
      }
    })

    const staffListLength = data.length;
    const optionLength = this.signLevelParallelValues.length;
    /** Điều kiện để xóa bớt số lựa chọn của combobox "Nhóm ký song song":
     * (Nhóm ký lớn nhất trong các lựa chọn > nhóm ký lớn nhất trong bảng && số bản ghi còn lại trong bảng > 1 &&
     * Số lựa chọn lớn hơn 2) || (Số lượng bản ghi trong bảng bằng 1 và số lượng lựa chọn >= 2)
     */
    if (
      (
        this.signLevelParallelValues[optionLength - 1].value > data[staffListLength - 1]?.signLevelParallel &&
        staffListLength >= 2 &&
        this.signLevelParallelValues[optionLength - 1].value > 2 &&
        (data[staffListLength - 1]?.signLevelParallel !== data[staffListLength - 2]?.signLevelParallel)
      ) ||
      (staffListLength === 1 && this.signLevelParallelValues[optionLength - 1].value >= 2)
    ) {
      /** Xóa lựa chọn có nhóm ký lớn nhất trong số các lựa chọn của combobox */
      this.signLevelParallelValues = this.signLevelParallelValues.slice(0, -1);
    }

    return data;
  }

  /**
   * [UI - Bảng "Cấu hình trình ký" - Combobox "Chức danh" + Combobox "Người ký"] Cập nhật danh sách các lựa chọn
   * của combobox "Chức danh" (positionValues) và combobox "Người ký" (internalUserValues) theo danh sách các đơn vị
   * được chọn ở bảng "Danh sách đơn vị".
   */
  private async updateJobPositionAndStaffOptions(organizations?: Partial<OrganizationModel>[]) {
    const orgs: OrganizationModel[] = this.addEditForm.get("organizations")?.value || [];
    const orgIds = (organizations ?? orgs).map((org) => org.id).filter((id) => id != null);

    if (orgIds.length === 0) {
      this.positionValues = [];
      this.internalUserValues = [];
      this.updateStaffAndPositionCombobox();
      return;
    }

    // Update job positions
    this.positionValues = await lastValueFrom(
      this.fetchAndDeduplicate(
        `${environment.PATH_API_V1}/mdm/job-position`,
        orgIds.map((id: any) => ({ key: 'organizations.id', value: id })),
        { name: 'name', code: 'code' },
        undefined,
        true,
      ),
    );


    // Update internal users
    this.internalUserValues = await lastValueFrom(
      this.fetchAndDeduplicate(
        `${environment.PATH_API_V1}/mdm/internal-user`,
        [{ key: 'organizationId', value: orgIds.join(',') }],
        { name: 'fullName', code: 'code' },
        'id,code,fullName',
      ),
    );

    this.updateStaffAndPositionCombobox();
  }

  /** Fetch from API, flatten and deduplicate by value */
  private fetchAndDeduplicate(
    path: string,
    filters: any[],
    fields: { name: string; code: string },
    select?: string,
    ignoreEmptyValue: boolean = false,
  ): Observable<any[]> {
    return forkJoin(
      filters.map(filter =>
        this.selectValuesService.getAutocompleteValuesFromModulePath(
          path,
          [filter],
          fields,
          select,
          ignoreEmptyValue,
        )
      )
    ).pipe(
      map(results => {
        const merged = ([] as any[]).concat(...results);
        return merged.filter(
          (item, index, self) => index === self.findIndex(i => i.value === item.value)
        );
      })
    );
  }

  /** Cập nhật lại combobox "Người ký" và "Chức danh" trong bảng "Cấu hình trình ký" */
  updateStaffAndPositionCombobox() {
    const values = this.addEditForm.get('lstStaff')?.value as StaffModel[];
    for (let value of values) {
      value.internalUserValues = this.internalUserValues.filter(
        (i) => i.value == -1 || i.value == value.staffId || !values.some((j) => j.staffId == i.value),
      );
      value.jobPositionsValues = this.positionValues.filter(
        (i) => value.jobPositions.includes(i.value) || !values.some((j) => j.jobPositions.includes(i.value)),
      );
    }
  }
}
