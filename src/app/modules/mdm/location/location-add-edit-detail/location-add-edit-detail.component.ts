import {Component, OnInit} from '@angular/core';
import {Utils} from 'src/app/shared/utils/utils';
import {
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent,
  BaseStatusEnum,
  DateUtilService,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, Validators} from '@angular/forms';
import {Location} from '@angular/common';
import {TranslateService} from '@ngx-translate/core';
import {ActionTypeEnum} from 'src/app/shared';
import {HttpParams} from '@angular/common/http';
import {environment} from 'src/environments/environment';
import {DEFAULT_REGEX, VIETNAMESE_REGEX} from 'src/app/shared/constants/regex.constants';
import {distinctUntilChanged, firstValueFrom, Observable, of, skip} from 'rxjs';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {Config} from "src/app/common/models/config.model";
import {FORM_CONFIG} from "src/app/shared/components/location/location-tree/location-tree.config";
import {LocationModel, LocationType} from "src/app/modules/mdm/_models/location.model";

@Component({
  selector: 'app-location-add-edit-detail',
  standalone: false,
  templateUrl: './location-add-edit-detail.component.html',
})
export class LocationAddEditDetailComponent extends BaseAddEditComponent implements OnInit {
  Utils = Utils;

  moduleName: string = 'mdm.location';
  configForm: Config;
  model: LocationModel | null = null;
  isView: boolean = false;
  statusValues$: Observable<SelectModel[]>

  locationLevelValue: SelectModel[] = [
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

  defaultOption: SelectModel = {
    value: -1,
    disabled: false,
    displayValue: this.translateService.instant("common.combobox.option.default"),
    rawData: -1,
  };

  checkIsActive!: boolean;
  parentValue: any[] = [];
  osmValues: SelectModel[] = [];

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
    protected selectService: SelectValuesService,
    protected dateUtilService: DateUtilService,
    protected selectValuesService: SelectValuesService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);

    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.addEditForm = this.fb.group({
      id: [''],
      code: ['', [Validators.maxLength(10), Validators.pattern(DEFAULT_REGEX)]],
      name: ['', [Validators.pattern(VIETNAMESE_REGEX)]],
      description: ['', [Validators.pattern(VIETNAMESE_REGEX)]],
      parentId: [''],
      osmBoundaryId: [''],
      locationLevel: [''],
      status: [],
      createdDate: [],
      createdBy: [],
      lastModifiedDate: [],
      lastModifiedBy: [],
    });

    this.addEditForm.get('locationLevel')?.valueChanges.pipe(distinctUntilChanged()).subscribe(
      (locationLevel: string) => {
        const parentIdControl = this.addEditForm.get('parentId');
        if(!parentIdControl) return;

        if(locationLevel === 'COUNTRY') {
          parentIdControl.clearValidators();
          this.parentValue = [this.defaultOption, ...this.parentValue];
        } else {
          parentIdControl.setValidators(Validators.required);
          if(this.parentValue[0]?.value === -1) {
            this.parentValue = this.parentValue.slice(1);
            parentIdControl?.setValue("");
            parentIdControl?.markAsUntouched();
            parentIdControl?.markAsPristine();
          }
        }
        parentIdControl.updateValueAndValidity();
      })

    this.statusValues$ = of(this.selectService.statusValues);
    this.isView = this.activatedRoute.routeConfig?.data?.actionType === ActionTypeEnum._VIEW;
  }

  async ngOnInit() {
    super.ngOnInit();

    if(this.isEdit) {
      this.model = await firstValueFrom(
        this.apiService.get<LocationModel>(`${environment.PATH_API_V1}/mdm/location/` + this.id, new HttpParams())
      ) as any;

      this.addEditForm.setValue(
        UtilsService.reduceEntityAttributeForFormControl(this.addEditForm, {
          ...this.model,
          parentId: Number(this.model?.parentId),
          osmBoundaryId: Number(this.model?.osmBoundaryId)
        })
      );

      this.checkIsActive = this.model?.status === 'APPROVED';
    }

    if(this.isView) {
      this.addEditForm.get('status')?.setValue(this.translateService.instant(
        this.utilsService.getEnumValueTranslated(BaseStatusEnum, this.model?.status || '')));
      this.addEditForm.get('createdDate')?.setValue(
        this.dateUtilService.convertDateToDisplayGMT0(this.model?.createdDate || ''));
      this.addEditForm.get('lastModifiedDate')?.setValue(
        this.dateUtilService.convertDateToDisplayGMT0(this.model?.lastModifiedDate || ''));
    }

    this.selectValuesService
      .getAutocompleteValuesFromModulePath(
        `${environment.PATH_API_V1}/mdm/location`,
        [
          { key: 'sortDirection', value: 'asc' },
          { key: 'sortBy', value: 'name' },
        ],
        undefined,
        undefined,
        true,
        undefined, 
        this.isEdit
      ).pipe(skip(1))
      .subscribe((res) => {
        this.parentValue = res;

        /** Nếu không check this.model?.parentId thì nếu API trả về không có parentId sẽ tạo ra 1 lựa chọn trống  */        
        if((this.isView || this.isEdit) && this.model?.parentId && !this.parentValue.find(
          item => item.value === this.model?.parentId)
        ) {
          this.parentValue.unshift(
            new SelectModel(this.model?.parentId, this.model?.parentName || '', false, this.model)
          );
        }

        this.parentValue = [...(this.model?.locationLevel === LocationType.COUNTRY ? [this.defaultOption] : []), ...this.parentValue].filter(x => !x.disabled || x.value === this.model?.parentId);
      });
  }

  onRedirect(item: any) {
    this.router.navigate([`/mdm/location/edit`, item]).then();
  }

  onUpdateStatus(status: 'approve' | 'reject') {
    const apiCall = this.apiService.post(`${environment.PATH_API_V1}/mdm/location/${this.id}/${status}`, '');

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

  onSubmit() {
    const formData = new FormData();
    const payload = new LocationModel(this.addEditForm);
    formData.append('body', this.utilsService.toBlobJon(payload));

    const apiCall = this.isEdit
      ? this.apiService.put(`${environment.PATH_API_V1}/mdm/location/${this.id}`, formData)
      : this.apiService.post(`${environment.PATH_API_V1}/mdm/location`, formData);

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
}
