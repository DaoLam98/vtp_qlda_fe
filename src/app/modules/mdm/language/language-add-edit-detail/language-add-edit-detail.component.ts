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
import {LanguageModel} from 'src/app/core';
import {environment} from 'src/environments/environment';
import {EnumUtil} from 'src/app/shared/utils/enum.util';
import {firstValueFrom, Observable, of} from 'rxjs';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {Config} from "src/app/common/models/config.model";
import {FORM_CONFIG} from "src/app/modules/mdm/language/language-search/language-search.config";

@Component({
  selector: 'app-language-add-edit-detail',
  standalone: false,
  templateUrl: './language-add-edit-detail.component.html',
})
export class LanguageAddEditDetailComponent extends BaseAddEditComponent implements OnInit {

  moduleName: string = 'mdm.language';
  configForm: Config;
  model: LanguageModel | null = null;
  isView: boolean = false;
  checkIsActive!: boolean;
  files: any[] = [];
  statusValues$: Observable<SelectModel[]>

  protected readonly environment = environment;

  get FileTypes() {
    return FileTypeEnum;
  }

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
    protected router: Router,
    protected fb: FormBuilder,
    protected location: Location,
    protected translateService: TranslateService,
    protected apiService: ApiService,
    protected utilsService: UtilsService,
    protected authoritiesService: AuthoritiesService,
    protected dateUtilService: DateUtilService,
    protected selectService: SelectValuesService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);

    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.addEditForm = this.fb.group({
      code: ['', [Validators.maxLength(3), Validators.pattern(DEFAULT_REGEX)]],
      name: ['', [Validators.maxLength(255), Validators.pattern(VIETNAMESE_REGEX)]],
      description: ['', [Validators.pattern(VIETNAMESE_REGEX)]],
      status: [],
      createdDate: [],
      createdBy: [],
      lastModifiedDate: [],
      lastModifiedBy: [],
      files: [[]]
    });

    this.statusValues$ = of(this.selectService.statusValues);
    this.isView = this.activatedRoute.routeConfig?.data?.actionType === ActionTypeEnum._VIEW;
  }

  async ngOnInit() {
    super.ngOnInit();

    if(this.isEdit) {
      this.model = await firstValueFrom(
        this.apiService.get<LanguageModel>(`${environment.PATH_API_V1}/mdm/language/` + this.id, new HttpParams())
      );

      this.addEditForm.setValue(
        UtilsService.reduceEntityAttributeForFormControl(this.addEditForm, this.model)
      );

      if(this.model.icon) {
        this.downloadFile();
      }

      this.checkIsActive =
        this.model?.status === EnumUtil.getKeysByValues(BaseStatusEnum, [BaseStatusEnum._APPROVED]);
    }

    if(this.isView) {
      this.addEditForm.patchValue({
        status: this.utilsService.getEnumValueTranslated(BaseStatusEnum, this.model?.status || ''),
        createdDate: this.dateUtilService.convertDateToDisplayGMT0(String(this.model?.createdDate)),
        lastModifiedDate: this.dateUtilService.convertDateToDisplayGMT0(String(this.model?.lastModifiedDate)),
      });
    }
  }

  onUpdateStatus(status: 'approve' | 'reject') {
    const apiCall = this.apiService.post(`${environment.PATH_API_V1}/mdm/language/${this.id}/${status}`, '');

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
    this.router.navigate([`/mdm/language/edit`, item]).then();
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
    const payload = new LanguageModel(this.addEditForm);
    formData.append('body', this.utilsService.toBlobJon(payload));

    const files = this.addEditForm.value.files as any[];
    if(files && files.length) {
      files.forEach((f, index) => {
        if(f.binary) {
          formData.append('files', f.binary, f.name);
        }
      });
    }

    const apiCall = this.isEdit
      ? this.apiService.put(`${environment.PATH_API_V1}/mdm/language/${this.id}`, formData)
      : this.apiService.post(`${environment.PATH_API_V1}/mdm/language`, formData);

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
