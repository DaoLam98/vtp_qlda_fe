import {Component, Inject, Injector, Input, OnInit, Optional, ViewChild} from '@angular/core';
import {Utils} from "src/app/shared/utils/utils";
import {environment} from "src/environments/environment";
import type {CloudSearchComponent} from "src/app/shared/components/base-search/cloud-search.component";
import {
  AlignEnum,
  ApiService,
  AuthoritiesService,
  ButtonModel,
  ColumnModel,
  FlatTreeNodeModel,
  IconTypeEnum,
  SelectModel,
  UtilsService
} from "@c10t/nice-component-library";
import {Config} from "src/app/common/models/config.model";
import {FormBuilder, FormGroup} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {SelectValuesService} from "src/app/core/services/selectValues.service";
import {EnumUtil} from "src/app/shared/utils/enum.util";
import {SuperStatusEnum} from "src/app/shared";
import {firstValueFrom} from "rxjs";
import {HttpParams} from "@angular/common/http";
import {
  FORM_CONFIG
} from "src/app/modules/project-information/projects-information/projects-information-add-edit-detail/folder-list/folder-list.config";
import {ProjectArchiveModel} from "src/app/modules/project-information/models/project-archive.model";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {
  FolderAddEditDetailComponent
} from "src/app/modules/project-information/projects-information/projects-information-add-edit-detail/folder-list/folder-add-edit-detail/folder-add-edit-detail.component";
import {ProjectArchiveEnum} from "src/app/shared/enums/project-archive.enum";
import {
  ViewFileDialogComponent
} from "src/app/modules/project-information/projects-information/projects-information-add-edit-detail/folder-list/view-file-dialog/view-file-dialog.component";
import {ExtendedFlatTreeNodeModel} from "src/app/shared/models/action-button.model";

@Component({
  selector: 'vtp-folder-list',
  standalone: false,
  templateUrl: './folder-list.component.html',
  styleUrls: ['folder-list.component.scss']
})
export class FolderListComponent implements OnInit {

  moduleName = 'project.folder';
  protected readonly Utils = Utils;
  protected readonly environment = environment;
  @Input() projectId!: number;
  @Input() isViewFolder: boolean = false;
  @ViewChild('cloudSearchRef', {static: true}) cloudSearchComponent!: CloudSearchComponent;

  columns: ColumnModel[] = [];
  buttons: ButtonModel[] = [];
  configForm: Config;
  formAdvanceSearch?: FormGroup;

  folderTree: FlatTreeNodeModel[] = [];
  statusValues: SelectModel[] = [];
  selectedFolder: ProjectArchiveModel[] = [];

  isAdvancedSearch: boolean = false;
  isPopup: boolean = false;
  trackBy: string = ''

  selectedTreeNode!: ExtendedFlatTreeNodeModel;
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
  ]
  isTreeVisible: boolean = true;

  addBtnFunction = () => {
    this.matDialog.open(FolderAddEditDetailComponent, {
      width: '80vw',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: {
        mode: 'CREATE',
        projectId: this.projectId
      }
    }).afterClosed().subscribe(async (res) => {
      if (res) {
        await this.loadTree();
        this.cloudSearchComponent?.onSubmit();
      }
    })
  }

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
    private matDialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) protected data: any,
    @Optional() protected matDialogRef: MatDialogRef<ProjectArchiveModel>,
  ) {
    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.formAdvanceSearch = formBuilder.group(this.configForm.filterForm!.reduce((result: any, item) => {
      result[item.name] = item.validate;
      return result;
    }, {}));

    this.columns.push(
      {
        columnDef: 'code',
        header: 'code',
        headerClassName: 'mat-header-stt',
        className: 'mat-column-code',
        title: (e: ProjectArchiveModel) => `${e.code || ''}`,
        cell: (e: ProjectArchiveModel) => `${e.code || ''}`,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'name',
        header: 'name',
        headerClassName: 'mat-header-stt',
        className: 'mat-column-name',
        title: (e: ProjectArchiveModel) => `${e.name || ''}`,
        cell: (e: ProjectArchiveModel) => `${e.name || ''}`,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'parentName',
        header: 'parentName',
        headerClassName: 'mat-header-parentName',
        className: 'mat-column-parentName',
        title: (e: ProjectArchiveModel) => `${e.parentName || ''}`,
        cell: (e: ProjectArchiveModel) => `${e.parentName || ''}`,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'archiveType',
        header: 'archiveType',
        headerClassName: 'mat-header-archiveType',
        className: 'mat-column-archiveType',
        title: (e: ProjectArchiveModel) => this.utilsService.getEnumValueTranslated(ProjectArchiveEnum, e.archiveType),
        cell: (e: ProjectArchiveModel) => this.utilsService.getEnumValueTranslated(ProjectArchiveEnum, e.archiveType),
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
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
        display: (e: ProjectArchiveModel) => !this.isPopup,
      },
      {
        columnDef: 'edit',
        color: 'warn',
        icon: 'fa fa-pen',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'addOrEdit',
        className: 'primary content-cell-align-center',
        title: 'common.title.edit',
        display: (e: ProjectArchiveModel) => !this.isViewFolder,
        disabled: (e: ProjectArchiveModel) => !e.canDelete && !e.canUpdate,
        header: "common.table.action.title",
        alignHeader: AlignEnum.CENTER
      },
      {
        columnDef: 'onDownloadItemOnTable',
        color: 'warn',
        icon: 'fa fa-download',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'onDownloadItemOnTable',
        className: 'primary content-cell-align-center',
        title: 'common.title.download',
        display: (e: ProjectArchiveModel) => true,
        disabled: (e: ProjectArchiveModel) => false,
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'onViewProcess',
        color: 'warn',
        icon: 'fal fa-file-search',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'onViewProcess',
        className: 'primary',
        title: 'common.title.view-process',
        display: (e: ProjectArchiveModel) => true,
        disabled: (e: ProjectArchiveModel) => e.archiveType === 'FOLDER',
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
    );
  }

  async ngOnInit() {
    EnumUtil.enum2SelectModel(SuperStatusEnum, this.statusValues, 'SEARCH');
    await this.loadTree();
    this.cloudSearchComponent?.onSubmit();
  }

  async loadTree() {
    const temp = await firstValueFrom(
      this.apiService.get<FlatTreeNodeModel[]>(
        environment.PATH_API_V1 + '/project/project-archive/flat-tree-node?projectId=' + this.projectId,
        new HttpParams(), environment.BASE_URL
      ).pipe()
    );
    this.expandAllNodes(temp);
    this.folderTree = temp;
    this.selectedTreeNode = this.folderTree?.[0] || [];
  }

  onSelectChangeFolder(event: FlatTreeNodeModel) {
    event && (this.selectedTreeNode = event);
    this.formAdvanceSearch?.get("path")?.setValue(event.value);
    this.cloudSearchComponent.onSubmit();
  }

  convertField2HttpParamFn(param: HttpParams) {
    param = param.set("status", "APPROVED");
    param = param.set('projectId', this.projectId)

    if (this.selectedTreeNode && this.selectedTreeNode.value) {
        param = param.set("isIncludeItself", String(this.selectedTreeNode.value));
    }

    return param;
  }

  private expandAllNodes(tree: FlatTreeNodeModel[]): FlatTreeNodeModel[] {
    for (const node of tree) {
      node.isExpanded = true;
      if (node.children && node.children.length > 0) {
        this.expandAllNodes(node.children);
      }
    }
    return tree;
  }


  onExpandTree() {
    this.isTreeVisible = !this.isTreeVisible;
  }

  addOrEdit(e: any, mode: "CREATE" | "VIEW" | "UPDATE") {
    this.matDialog.open(FolderAddEditDetailComponent, {
      width: '80vw',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: {
        mode: mode,
        id: e?.id || null,
        projectId: this.projectId
      }
    }).afterClosed().subscribe(async (res) => {
      if (res) {
        await this.loadTree();
        this.cloudSearchComponent?.onSubmit();
      }
    })
  }

  showPopupViewAddEdit(e: any, action?: 'VIEW' | 'UPDATE') {
    if (e) {
      const mode = action === 'VIEW' ? 'VIEW' : 'UPDATE';
      this.addOrEdit(e, mode);
    }
  }

  async onDownloadItemOnTable(e: any) {
    try {
      if (!e?.id) return;
      const body = e.archiveType === 'FILE'
        ? { filePath: e.filePath }
        : {}; // FOLDER không cần body gì cả

      if (e.archiveType === 'FILE' && !e.filePath) return;
      const res = await firstValueFrom(
        this.apiService.postBlob(
          `${environment.PATH_API_V1}/project/project-archive/download/${e.id}`,
          body,
          { params: new HttpParams() }
        )
      );

      const blob = res.body as Blob;
      let fileName;

      if (e.archiveType === 'FOLDER') {
        const baseName = e.fileName || e.name || ('folder_' + e.id);
        const cleaned = baseName.replace(/\.zip$/i, '');
        fileName = cleaned + '.zip';
      } else {
        const nameFromPath = e.filePath ? e.filePath.split('/').pop() : null;
        fileName = e.fileName || nameFromPath || 'downloaded-file';
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    }
  }


  onViewProcess(e: any) {
    const filePath = e.filePath;
    this.matDialog.open(ViewFileDialogComponent, {
      width: '80vw',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: {
        filePath: filePath
      }
    })
  }

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }
}
