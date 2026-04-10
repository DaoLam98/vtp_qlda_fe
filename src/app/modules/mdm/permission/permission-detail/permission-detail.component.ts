import {Component, OnInit} from '@angular/core';
import {PermissionModel} from 'src/app/modules/mdm/_models/permission.model';
import {
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent,
  DateUtilService,
  UtilsService
} from '@c10t/nice-component-library';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {DatePipe, Location} from '@angular/common';
import {ActionTypeEnum} from 'src/app/shared';
import {HttpParams} from '@angular/common/http';
import {environment} from "src/environments/environment";
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {Config} from "src/app/common/models/config.model";
import {FORM_CONFIG} from "src/app/modules/mdm/permission/permission-search/permission-search.config";
import {firstValueFrom} from "rxjs";
import {VIETNAMESE_REGEX} from "src/app/shared/constants/regex.constants";

@Component({
  selector: 'app-permission-detail',
  standalone: false,
  templateUrl: './permission-detail.component.html'
})
export class PermissionDetailComponent extends BaseAddEditComponent implements OnInit {
  moduleName: string = 'mdm.permissions';
  configForm: Config;
  model: PermissionModel | null = null;
  isView: boolean = false;
  checkIsActive: boolean = false;

  protected readonly environment = environment;

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
    protected datePipe: DatePipe,
    protected dateUtilService: DateUtilService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);

    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.addEditForm = this.fb.group({
      code: [''],
      name: [''],
      parentName: [''],
      description: ['', [Validators.pattern(VIETNAMESE_REGEX)]],
      status: [''],
      createdBy: [''],
      createdDate: [''],
      lastModifiedBy: [''],
      lastModifiedDate: ['']
    });

    this.isView = this.activatedRoute.routeConfig?.data?.actionType === ActionTypeEnum._VIEW;
  }

  async ngOnInit() {
    super.ngOnInit();

    if(this.isEdit) {
      this.model = await firstValueFrom(
        this.apiService.get<PermissionModel>(`${environment.PATH_API_V1}/mdm/permissions/` + this.id, new HttpParams())
      );

      this.checkIsActive = this.model?.status === 'APPROVED';

      this.model.createdDate = this.formatDate(this.model.createdDate || "");
      this.model.lastModifiedDate = this.formatDate(this.model.lastModifiedDate || "");
      this.model.status = this.model.status === 'APPROVED'
        ? this.translateService.instant('common.active')
        : this.translateService.instant('common.inactive');

      this.addEditForm.setValue(
        UtilsService.reduceEntityAttributeForFormControl(this.addEditForm, this.model)
      );
    }
  }

  onUpdateStatus(status: 'approve' | 'reject') {
    const apiCall = this.apiService.post(`${environment.PATH_API_V1}/mdm/permissions/${this.id}/${status}`, '');
    this.utilsService.execute(
      apiCall, this.onSuccessFunc,
      `common.${status}.success`,
      `common.confirm.${status}`, ['permission.']
    );
  }

  private formatDate(date: string | null): string {
    return date ? this.datePipe.transform(date, 'dd/MM/yyyy') ?? '' : '';
  }
}
