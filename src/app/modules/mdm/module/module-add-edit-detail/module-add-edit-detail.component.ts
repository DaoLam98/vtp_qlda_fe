import {Component, OnInit} from '@angular/core';
import {
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent,
  BaseStatusEnum,
  DateUtilService,
  FileTypeEnum,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, Validators} from '@angular/forms';
import {Location} from '@angular/common';
import {TranslateService} from '@ngx-translate/core';
import {ActionTypeEnum} from 'src/app/shared';
import {HttpParams} from '@angular/common/http';
import {DEFAULT_REGEX, VIETNAMESE_REGEX} from 'src/app/shared/constants/regex.constants';
import {ModuleModel} from 'src/app/core';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {firstValueFrom, Observable, of} from 'rxjs';
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {Config} from "src/app/common/models/config.model";
import {FORM_CONFIG} from "src/app/modules/mdm/module/module-search/module-search.config";
import {environment} from 'src/environments/environment';

@Component({
  selector: 'app-services-add-edit-detail',
  templateUrl: './module-add-edit-detail.component.html',
  standalone: false,
})
export class ModuleAddEditDetailComponent extends BaseAddEditComponent implements OnInit {
  moduleName: string = 'mdm.module';
  configForm: Config;
  model: ModuleModel | null = null;
  isView: boolean = false;
  checkIsActive!: boolean;
  statusValues$: Observable<SelectModel[]>;

  readonly FileTypes = FileTypeEnum;
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
    private router: Router,
    private selectService: SelectValuesService,
    private dateUtilService: DateUtilService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);

    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.addEditForm = this.fb.group({
      code: ['', [Validators.maxLength(255), Validators.pattern(DEFAULT_REGEX)]],
      name: ['', [Validators.pattern(VIETNAMESE_REGEX), Validators.maxLength(255)]],
      description: ['', [Validators.pattern(VIETNAMESE_REGEX)]],
      path: [''],
      icon: [''],
      color: [''],
      orderNumber: [],
      files: [[]],
      status: [],
      createdDate: [],
      createdBy: [],
      lastModifiedDate: [],
      lastModifiedBy: [],
    });

    this.statusValues$ = of(this.selectService.statusValues);
    this.isView = this.activatedRoute.routeConfig?.data?.actionType === ActionTypeEnum._VIEW;
  }

  async ngOnInit() {
    super.ngOnInit();

    if(this.isEdit) {
      this.model = await firstValueFrom(
        this.apiService.get<ModuleModel>(`${environment.PATH_API_V1}/mdm/module/` + this.id, new HttpParams())
      );

      this.checkIsActive = this.model.status === 'APPROVED';

      this.model.createdDate = this.dateUtilService.convertDateToDisplayServerTime(this.model.createdDate || '') || '';
      this.model.lastModifiedDate = this.dateUtilService.convertDateToDisplayServerTime(
        this.model.lastModifiedDate || '') || '';

      this.model.status = this.isView
        ? this.translateService.instant(
          this.utilsService.getEnumValueTranslated(BaseStatusEnum, this.model.status || ''))
        : this.model.status;

      this.addEditForm.setValue(UtilsService.reduceEntityAttributeForFormControl(this.addEditForm, this.model));

      if(this.model.icon) {
        this.downloadFile();
      }
    }
  }

  onUpdateStatus(status: 'approve' | 'reject') {
    const apiCall = this.apiService.post(`${environment.PATH_API_V1}/mdm/module/${this.id}/${status}`, '');

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

  onRedirect(item: any) {
    this.router.navigate([`/mdm/module/edit`, item]).then();
  }

  downloadFile() {
    if(!this.model?.icon) return;

    const pathFile = this.model.icon;
    this.apiService.getBlob(`${environment.PATH_API_V1}/mdm/file?filePath=${pathFile}`, new HttpParams()).subscribe(
      (blob) => {
        const file = new File([blob], pathFile, {type: 'text/plain'});
        const files = [{
          name: this.model?.iconName || pathFile,
          id: null,
          previewValue: null,
          type: null,
          binary: file,
          filePath: pathFile
        }];
        this.addEditForm.get('files')?.setValue(files);
      })
  }

  async onDownloadFile($event: any) {
    const filePath = $event.filePath;
    if(!filePath) return;

    try {
      const blob = await firstValueFrom(
        this.apiService.getBlob(`${environment.PATH_API_V1}/mdm/file?filePath=${filePath}`, new HttpParams())
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = $event.name || 'downloaded-file';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch(error) {
      console.error('Download failed:', error);
    }
  }

  onSubmit() {
    const formData = new FormData();
    const payload = new ModuleModel(this.addEditForm);
    formData.append('body', this.utilsService.toBlobJon(payload));

    const files = this.addEditForm.value.files as any[];
    if(files && files.length) {
      files.forEach((f, index) => {
        if(f.binary) {
          formData.append('files', f.binary, f.name);
        }
      });
    } else {
      this.addEditForm.patchValue({icon: ''});
    }

    const apiCall = this.isEdit
      ? this.apiService.put(`${environment.PATH_API_V1}/mdm/module/${this.id}`, formData)
      : this.apiService.post(`${environment.PATH_API_V1}/mdm/module`, formData);

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
