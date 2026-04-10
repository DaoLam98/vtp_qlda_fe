import {Component, Inject, OnInit, Optional} from '@angular/core';
import {
  ActionTypeEnum,
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent,
  FileTypeEnum,
  SelectModel,
  UtilsService
} from "@c10t/nice-component-library";
import {ActivatedRoute, Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {Location} from "@angular/common";
import {FormBuilder, Validators} from "@angular/forms";
import {SelectValuesService} from "src/app/core/services/selectValues.service";
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ProjectArchiveModel} from "src/app/modules/project-information/models/project-archive.model";
import {environment} from "src/environments/environment";
import {Utils} from "src/app/shared/utils/utils";
import {Config} from "src/app/common/models/config.model";
import {
  FORM_CONFIG
} from "src/app/modules/project-information/projects-information/projects-information-add-edit-detail/folder-list/folder-list.config";
import {firstValueFrom} from "rxjs";
import {HttpParams} from "@angular/common/http";
import {DEFAULT_REGEX, VIETNAMESE_REGEX} from "src/app/shared/constants/regex.constants";

@Component({
  selector: 'app-folder-add-edit-detail',
  standalone: false,
  templateUrl: './folder-add-edit-detail.component.html'
})
export class FolderAddEditDetailComponent extends BaseAddEditComponent implements OnInit {
  configForm: Config;

  archiveTypeOpts: SelectModel[] = [
    {
      displayValue: `common.project-archive.type.folder`,
      value: 'FOLDER',
      rawData: 'FOLDER',
      disabled: false
    },
    {
      displayValue: `common.project-archive.type.file`,
      value: 'FILE',
      rawData: 'FILE',
      disabled: false
    },
  ];

  parentFolderOpts: SelectModel[] = []
  model: ProjectArchiveModel | null = null;
  isUpdate: boolean = false;
  isViewOnly: boolean = false;
  actionType?: ActionTypeEnum;
  isChooseFolder: boolean = false;
  isCanDelete: boolean = false;
  isCanUpdate: boolean = false;

  ngAfterViewInit() {
    this.addEditForm.get('parentId')?.valueChanges.subscribe(parentId => {
      if (parentId) {
        const parent = this.parentFolderOpts.find(opt => opt.value == parentId);
        if (parent && parent.rawData && parent.rawData.projectId) {
          this.addEditForm.get('projectId')?.setValue(parent.rawData.projectId);
        }
      }
    });
  }

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected location: Location,
    protected translateService: TranslateService,
    protected utilsService: UtilsService,
    protected authoritiesService: AuthoritiesService,
    protected fb: FormBuilder,
    protected router: Router,
    protected apiService: ApiService,
    protected selectValuesService: SelectValuesService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
    @Optional() protected matDialogRef: MatDialogRef<ProjectArchiveModel>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);
    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.addEditForm = this.fb.group({
      id: [''],
      code: ['', [Validators.maxLength(255), Validators.pattern(DEFAULT_REGEX)]],
      name: ['', [Validators.maxLength(255), Validators.pattern(VIETNAMESE_REGEX)]],
      archiveType: [''],
      projectArchives: [''],
      parentId: [''],
      projectId: [''],
      description: [''],
      status: [''],
      parentCode: [''],
      parentName: [''],
      projectCode: [''],
      projectName: [''],
      path: [''],
      pathName: [''],
      filePath: [''],
      fileName: [''],
      createdDate: [],
      createdBy: [],
      lastModifiedDate: [],
      lastModifiedBy: [],
      files: [[]],
      sequenceNo: [0]
    });

    this.addEditForm.get('archiveType')?.valueChanges.subscribe((val: string) => {
      this.isChooseFolder = val === 'FILE';
    });
  }

  async ngOnInit() {
    super.ngOnInit();
    this.isUpdate = this.data?.mode === 'UPDATE';
    this.isViewOnly = this.data?.mode === 'VIEW';

    this.actionType = this.data?.mode === 'VIEW' ? ActionTypeEnum._VIEW : ActionTypeEnum._EDIT;

    if ((this.data?.mode === 'UPDATE' || this.data?.mode === 'VIEW') && this.data?.id) {
      this.model = await firstValueFrom(
        this.apiService.get<ProjectArchiveModel>(`${environment.PATH_API_V1}/project/project-archive/` + this.data.id, new HttpParams())
      );
      this.isCanDelete = this.model.canDelete;
      this.isCanUpdate = this.model.canUpdate
      this.addEditForm.patchValue(this.model);

      if (this.model.archiveType === 'FOLDER' && this.model.projectArchives && this.model.projectArchives.length > 0) {
        await this.getFilesFromFolder();
      } else if (this.model.filePath) {
        this.getFile();
      }
    } else if (this.data?.mode === 'CREATE' && this.data?.projectId) {
      this.addEditForm.get('projectId')?.setValue(this.data.projectId);
    }
    this.onGetParentOpts();
  }

  onGetParentOpts() {
    this.selectValuesService.getAutocompleteValuesFromModulePath(
      `${environment.PATH_API_V1}/project/project-archive`,
      [
        {key: 'archiveType', value: 'FOLDER'},
        {key: 'projectId', value: this.data?.projectId}
      ],
      {
        name: 'name',
        code: 'code',
      },
      'id,code,name,archiveType,projectId',
      true
    ).subscribe(options => {
      this.parentFolderOpts = options;
    })
  }

  onSubmit() {
    const files = this.addEditForm.value.files as any[];
    if (this.model?.archiveType === 'FOLDER' && this.model?.projectArchives) {
      const remainingFileIds = files
        ?.filter(f => f.id)
        .map(f => f.id) || [];

      const updatedProjectArchives = this.model.projectArchives.filter(archive => {
        return archive.archiveType === 'FOLDER' ||
               (archive.archiveType === 'FILE' && archive.id && remainingFileIds.includes(archive.id));
      });
      this.addEditForm.get('projectArchives')?.setValue(updatedProjectArchives);
    }

    const formData = new FormData();
    const payload = new ProjectArchiveModel(this.addEditForm);
    formData.append('body', this.utilsService.toBlobJon(payload));

    if (files && files.length) {
      files.forEach((f, index) => {
        if (f.binary) {
          formData.append('files', f.binary, f.name);
        }
      });
    }
    const apiCall = this.isUpdate
      ? this.apiService.put(
        `${environment.PATH_API_V1}/project/project-archive/${this.data.id}`, formData)
      : this.apiService.post(`${environment.PATH_API_V1}/project/project-archive`, formData);

    const action = this.isUpdate ? 'edit' : 'add';
    this.utilsService.execute(
      apiCall,
      this.onSuccessFunc1,
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

  onSuccessFunc1 = async (data: any, onSuccessMessage: string | undefined) => {
    this.matDialogRef.close(true);
    this.utilsService.onSuccessFunc(onSuccessMessage ? onSuccessMessage : 'common.default.success');
  }


  getFile() {
    if(!this.model?.filePath) return;

    const pathFile = this.model.filePath;
    this.apiService.getBlob(`${environment.PATH_API_V1}/mdm/file?filePath=${pathFile}`, new HttpParams()).subscribe((blob) => {
      const file = new File([blob], pathFile, { type: 'text/plain' });
      const files = [{
        name: this.model?.fileName || pathFile,
        id: null,
        previewValue: null,
        type: null,
        binary: file,
        filePath: pathFile
      }];
      this.addEditForm.get('files')?.setValue(files);
    })
  }

  async getFilesFromFolder() {
    if (!this.model?.projectArchives || this.model.projectArchives.length === 0) return;
    const fileItems = this.model.projectArchives.filter(item =>
      item.archiveType === 'FILE' && item.filePath
    );

    if (fileItems.length === 0) {
      this.addEditForm.get('files')?.setValue([]);
      return;
    }

    const files = fileItems.map((item) => {
      return {
        name: item.fileName || item.filePath || '',
        id: item.id,
        previewValue: null,
        type: null,
        binary: null,
        filePath: item.filePath
      };
    });

    this.addEditForm.get('files')?.setValue(files);
  }

  async onDownloadFile(event: any) {
    const filePath = event.filePath;
    if (!filePath) return;
    try {
      const blob = await firstValueFrom(
        this.apiService.getBlob(`${environment.PATH_API_V1}/mdm/file?filePath=${filePath}`, new HttpParams())
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fallbackFileName = filePath.split('/').pop() || 'downloaded-file';
      const resolvedFileName =
        event?.fileName ||
        event?.name ||
        this.model?.fileName ||
        this.model?.filePath ||
        fallbackFileName;
      a.download = String(resolvedFileName);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (err) {

    }
  }

  onEnableInput() {
    this.isViewOnly = false;
    this.isUpdate = true;
    this.isEdit = true;
    if (this.data) {
      this.data.mode = 'UPDATE';
    }
    this.actionType = ActionTypeEnum._EDIT;
  }

  onDelete(e: any) {
    const apiCall = this.apiService.post(`${environment.PATH_API_V1}/project/project-archive/${this.data.id}/reject`, '');

    this.utilsService.execute(
      apiCall,
      this.onSuccessFunc1,
      `common.delete.success`,
      `common.title.confirm`,
      [`${this.configForm?.moduleName}.`],
      `common.confirm.delete`,
      undefined,
      undefined,
      "common.button.confirm", // Nút Xác nhận
      "common.button.back" // Nút Quay lại
    );
  }

  get FileTypes() {
    return FileTypeEnum;
  }

  get hasDownloadPermission() {
    return this.permissionCheckingUtil.isHasDownloadFolderPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }

  get hasEditPermission() {
    return this.permissionCheckingUtil.hasViewEditPermission(
      this.configForm?.moduleName ?? '',
      this.configForm?.name ?? '',
    );
  }

  get hasViewRejectPermission() {
    return this.permissionCheckingUtil.hasViewRejectPermission(
      this.configForm?.moduleName ?? '',
      this.configForm?.name ?? '',
    );
  }

  protected readonly environment = environment;
  protected readonly Utils = Utils;
}
