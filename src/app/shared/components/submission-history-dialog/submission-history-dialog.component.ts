import {Component, Inject, Injector, OnDestroy, OnInit, Optional, ViewChild} from '@angular/core';
import {
  AlignEnum,
  ApiService, AuthoritiesService,
  BaseSearchComponent,
  ButtonModel,
  ColumnModel, DateUtilService,
  FileTypeEnum, FormStateService,
  UtilsService
} from "@c10t/nice-component-library";
import {HistoryType, ProgressStatus, VOStatus} from "src/app/shared/enums/history-type.enum";
import {HttpParams} from "@angular/common/http";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {
  ExtendedFlatTreeNodeModel,
  fileSignDocumentTreeModel,
  PopUpModel
} from "src/app/shared/models/action-button.model";
import {ActivatedRoute, Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {SelectValuesService} from "src/app/core/services/selectValues.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {catchError, finalize, map, of} from "rxjs";
import {environment} from "src/environments/environment";
import {BreakpointObserver, BreakpointState} from "@angular/cdk/layout";


interface DialogData {
  type: HistoryType;
  crrId: number;
  tableName: string;
  menuName?: string;
  moduleName?: string;
}

interface ApiEndpoint {
  url: string;
  params: HttpParams;
  baseUrl?: string;
}

interface ModuleConfig {
  dialogTitle: string;
  moduleTranslationKey: string;
}

@Component({
  selector: 'app-submission-history-dialog',
  standalone: false,
  templateUrl: './submission-history-dialog.component.html',
  styleUrl: './submission-history-dialog.component.scss'
})
export class SubmissionHistoryDialogComponent extends BaseSearchComponent implements OnInit, OnDestroy {
  @ViewChild('pdfViewer') pdfViewer: any;

  private readonly moduleConfigs: Record<HistoryType, ModuleConfig> = {
    [HistoryType.VOFFICE_HISTORY]: {
      dialogTitle: 'btnHistory',
      moduleTranslationKey: 'common.label.signingHistory',
    },
  };

  readonly columns: ColumnModel[] = [];
  readonly buttons: ButtonModel[] = [];
  readonly displayForm: FormGroup;
  readonly moduleName: string = '';
  readonly menuName: string = '';
  readonly historyType: HistoryType;
  readonly FileTypes = FileTypeEnum;

  moduleTranslationKey: string = '';
  dialogTitle: string = '';
  showSecondContent = false;
  _currentPdfUrl: string | null = null;
  isSmallScreen = false;
  treeViewHeight = 500;
  pdfViewerHeight = 570;

  readonly treeFormControl = new FormControl();
  fileSignTree: ExtendedFlatTreeNodeModel[] = [];
  selectedFile: ExtendedFlatTreeNodeModel | null = null;

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
    protected dateUtilService: DateUtilService,
    protected selectValuesService: SelectValuesService,
    private _breakpointObserver: BreakpointObserver,
    @Optional() public matDialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    super(router, apiService, utilsService, uiStateService, translateService, injector, activatedRoute, authoritiesService, new FormGroup({}),
    );

    this._breakpointObserver.observe([
      "(max-width: 1367px)"
    ]).subscribe((result: BreakpointState) => {
      this.isSmallScreen = result.matches;
      if (result.matches) {
        this.treeViewHeight = 400;
        this.pdfViewerHeight = 450;
      } else {
        this.treeViewHeight = 500;
        this.pdfViewerHeight = 570;
      }
    })

    this.historyType = data.type;
    this.menuName = data.menuName || '';
    this.moduleName = data.moduleName || '';

    this.displayForm = this.formBuilder.group({
      processHistory: [[]],
    });

    this.initializeComponent();
  }

  ngOnInit(): void {
    this.loadHistoryData();
  }

  ngOnDestroy(): void {
    if (this._currentPdfUrl) {
      URL.revokeObjectURL(this._currentPdfUrl);
    }
  }

  onClose(): void {
    this.matDialogRef.close();
  }

  toggleContent(): void {
    this.showSecondContent = !this.showSecondContent;
  }

  onNodeClick(node: ExtendedFlatTreeNodeModel) {
    this.selectedFile = node;
    if (node.rawData?.filePathVss) {
      const fileExtension = node.rawData.filePathVss.split('.').pop()?.toLowerCase() || '';
      const officeExtensions = ['doc', 'docx', 'xls', 'xlsx'];

      if (officeExtensions.includes(fileExtension)) {
        this.downloadFile(node.rawData.filePathVss);
      } else {
        this.loadPdfFile(node.rawData.filePathVss);
      }
    }
  }

  private initializeComponent(): void {
    this.setupColumns();
    this.setModuleTranslation();
  }

  private setupColumns(): void {
    const baseColumns: ColumnModel[] = [
      {
        columnDef: 'stt',
        header: 'stt',
        title: this.getIndexColumn(),
        cell: this.getIndexColumn(),
        className: 'mat-column-stt',
        align: AlignEnum.CENTER,
      },
    ];

    const typeSpecificColumns = this.getTypeSpecificColumns();
    (this.columns as any).push(...baseColumns, ...typeSpecificColumns);
  }

  private getIndexColumn() {
    return (e: PopUpModel): string => {
      const values = this.displayForm.get('processHistory')?.value as PopUpModel[];
      return (values.indexOf(e) + 1).toString();
    };
  }

  private getTypeSpecificColumns(): ColumnModel[] {
    const columnGenerators = {
      [HistoryType.VOFFICE_HISTORY]: () => this.getVOfficeHistoryColumns(),
    };

    return columnGenerators[this.historyType]() || [];
  }

  private getVOfficeHistoryColumns(): ColumnModel[] {
    return [
      this.createColumn('code', 'code', (e: PopUpModel) => e.code || '', AlignEnum.CENTER),
      this.createColumn('title', 'title', (e: PopUpModel) => e.title || '', AlignEnum.LEFT),
      this.createColumn('submissionNumber', 'submissionNumber', this.getSubmissionNumber.bind(this), AlignEnum.LEFT),
      this.createColumn('creatorName', 'createdBy', this.getCreatorUser.bind(this), AlignEnum.LEFT),
      this.createDateColumn('createdDate', 'createdDate'),
      this.createColumn('lstStaff', 'lstStaff', this.getLastStaff.bind(this), AlignEnum.LEFT),
      this.createDateColumn('signVofficeDate', 'signVofficeDate', 'mat-column-submissionDate'),
      this.createColumn('signComment', 'reason', (e: PopUpModel) => e.signComment || ''),
      this.createColumn('voStatus', 'voStatus', (e: PopUpModel) =>
        this.utilsService.getEnumValueTranslated(VOStatus, e.voStatus || ''),
      ),
    ];
  }

  private createColumn(
    columnDef: string,
    header: string,
    valueExtractor: (e: any) => string,
    align: AlignEnum = AlignEnum.CENTER,
    className?: string,
  ): ColumnModel {
    return {
      columnDef,
      header,
      title: valueExtractor,
      cell: valueExtractor,
      className: className || `mat-column-${columnDef}`,
      alignHeader: AlignEnum.CENTER,
      align,
    };
  }

  formatToDDMMYYYY_HHMMSS(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const pad = (n: number) => n.toString().padStart(2, '0');

    const day = pad(date.getUTCDate());
    const month = pad(date.getUTCMonth() + 1);
    const year = date.getUTCFullYear();

    const hours = pad(date.getUTCHours());
    const minutes = pad(date.getUTCMinutes());
    const seconds = pad(date.getUTCSeconds());

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }


  private createDateColumn(
    columnDef: string,
    header: string,
    className?: string,
  ): ColumnModel {
    const formatDate = (e: any) =>
      this.formatToDDMMYYYY_HHMMSS(e[columnDef] || '') || '';

    return this.createColumn(columnDef, header, formatDate, AlignEnum.CENTER, className);
  }

  private getSubmissionNumber(e: any): string {
    const values = this.displayForm.get('processHistory')?.value as any[];
    return `Lần ${(values.indexOf(e) + 1).toString()}`;
  }

  private getLastStaff(e: PopUpModel): string {
    const signer = e?.lstStaff?.[(e?.lstStaff?.length || 0) - 1];
    return signer ? `${signer?.staffFullName} (${signer?.staffCode})` : '';
  }

  private getCreatorUser(e: any): string {
    return `${e?.creatorName} (${e.creatorCode})` || '';
  }

  private setModuleTranslation(): void {
    const config = this.moduleConfigs[this.historyType];
    if (config) {
      this.dialogTitle = config.dialogTitle;
      this.moduleTranslationKey = config.moduleTranslationKey;
    }
  }

  private buildFileSignTree(signDocuments: fileSignDocumentTreeModel[]): ExtendedFlatTreeNodeModel[] {
    const sortedDocs = [...signDocuments].sort((a, b) => a.index - b.index);

    return sortedDocs.map(doc => {
      return {
        value: doc.id.toString(),
        displayValue: `Lần ${doc.index} - ${this.dateUtilService.convertDateTimeToDisplay(doc.createdDate)}`,
        level: 0,
        expandable: true,
        isExpanded: true,
        children: [
          {
            value: 'main_' + doc.id.toString(),
            displayValue: this.translateService.instant('common.label.mainSignedFile'),
            level: 1,
            expandable: (doc.lstFileSign || []).length > 0,
            isExpanded: true,
            children: (doc.lstFileSign || []).map(file => ({
              value: file.id.toString(),
              displayValue: file.name || '',
              level: 2,
              expandable: false,
              checked: false,
              disabled: false,
              display: true,
              rawData: file,
            })),
          },
          {
            value: 'main_signed_' + doc.id.toString(),
            displayValue: this.translateService.instant('common.label.lstFileSigned'),
            level: 1,
            expandable: (doc.lstFileSigned || []).length > 0,
            isExpanded: true,
            children: (doc.lstFileSigned || []).map(file => ({
              value: file.id.toString(),
              displayValue: file.name || '',
              level: 2,
              expandable: false,
              checked: false,
              disabled: false,
              display: true,
              rawData: file,
            })),
          },
          {
            value: 'other_' + doc.id.toString(),
            displayValue: this.translateService.instant('common.label.otherFile'),
            level: 1,
            expandable: (doc.listFileSignOther || []).length > 0,
            isExpanded: true,
            children: (doc.listFileSignOther || []).map(file => ({
              value: file.id.toString(),
              displayValue: file.name || '',
              level: 2,
              expandable: false,
              checked: false,
              disabled: false,
              display: true,
              rawData: file,
            })),
          },
          {
            value: 'other_signed_' + doc.id.toString(),
            displayValue: this.translateService.instant('common.label.otherFileSigned'),
            level: 1,
            expandable: (doc.listFileSignedOther || []).length > 0,
            isExpanded: true,
            children: (doc.listFileSignedOther || []).map(file => ({
              value: file.id.toString(),
              displayValue: file.name || '',
              level: 2,
              expandable: false,
              checked: false,
              disabled: false,
              display: true,
              rawData: file,
            })),
          },
        ],
      };
    });
  }

  private downloadFile(filePathVss: string): void {
    this.apiService.getBlob(`${environment.PATH_API_V1}/mdm/file?filePath=${filePathVss}`, new HttpParams())
      .toPromise()
      .then((blob: any) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.selectedFile?.rawData?.name || 'downloaded-file';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('Download failed:', error);
      });
  }

  private loadPdfFile(filePathVss: string) {
    this.apiService.getBlob(`${environment.PATH_API_V1}/mdm/file?filePath=${filePathVss}`, new HttpParams())
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          this.pdfViewer.pdfSrc = url;
          this.pdfViewer.refresh();
          // Lưu lại url để revoke khi destroy
          this._currentPdfUrl = url;
        },
        error: (error) => {
          this.utilsService.showErrorToarst(
            this.translateService.instant('COMMON.ERROR_OCCURRED', error),
          );
        },
      });
  }

  private getApiEndpoint(): ApiEndpoint {
    const baseParams = new HttpParams();
    const endpointMap = {
      [HistoryType.VOFFICE_HISTORY]: {
        url: `${environment.PATH_API_V1}/voffice-gateway/sign-document`,
        params: baseParams
          .set('pageNumber', '1')
          .set('pageSize', '999')
          .set('tableName', this.data.tableName)
          .set('tableId', this.data.crrId),
        baseUrl: environment.VOFFICE_URL,
      },
    };

    const endpoint = endpointMap[this.historyType];
    if (!endpoint) {
      throw new Error(`Invalid history type: ${this.historyType}`);
    }

    return endpoint;
  }

  private handleError = (error: any) => {
    return of([]);
  };

  private loadHistoryData(): void {
    try {
      const {url, params, baseUrl} = this.getApiEndpoint();

      this.apiService.get(url, params, baseUrl)
        .pipe(
          map((res: any) => {
            return this.historyType === HistoryType.VOFFICE_HISTORY
              ? res?.content || []
              : res;
          }),
          catchError(this.handleError),
          finalize(() => {
          }),
        ).subscribe((response: any[] | any) => {
        this.processHistoryResponse(response);
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  private processHistoryResponse(response: any[] | any) {
    this.displayForm.patchValue({
      processHistory: response,
    });

    if (this.historyType === HistoryType.VOFFICE_HISTORY && response?.length > 0) {
      this.fileSignTree = this.buildFileSignTree(response as any[]);
    }
  }


}
