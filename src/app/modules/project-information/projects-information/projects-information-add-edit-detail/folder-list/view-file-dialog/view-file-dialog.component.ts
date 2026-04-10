import {
  Component,
  Inject,
  Injector,
  OnInit,
  Optional,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef
} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {ExtendedFlatTreeNodeModel} from "src/app/shared/models/action-button.model";
import {
  ApiService,
  AuthoritiesService,
  BaseSearchComponent, DateUtilService,
  FormStateService,
  UtilsService
} from "@c10t/nice-component-library";
import {ActivatedRoute, Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {SelectValuesService} from "src/app/core/services/selectValues.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {environment} from "src/environments/environment";
import {HttpParams} from '@angular/common/http';

interface DialogData {
  filePath: string,
  fileName: string
}

@Component({
  selector: 'app-view-file-dialog',
  standalone: false,
  templateUrl: './view-file-dialog.component.html',
  styleUrl: './view-file-dialog.component.scss'
})
export class ViewFileDialogComponent extends BaseSearchComponent implements OnInit, AfterViewInit {
  @ViewChild('pdfViewer') pdfViewer: any;
  selectedFile: ExtendedFlatTreeNodeModel | null = null;
  _currentPdfUrl: string | null = null;
  pdfSrc: any = null; // Dùng để bind trực tiếp trong template
  isOfficeFile = false;

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
    private cdr: ChangeDetectorRef,
    @Optional() public matDialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    super(router, apiService, utilsService, uiStateService, translateService, injector, activatedRoute, authoritiesService, new FormGroup({}),
    );
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (!this.data?.filePath) {
        return;
      }

      const officeExtensions = ['doc', 'docx', 'xls', 'xlsx'];
      const ext = this.getExtension(this.data.fileName || this.data.filePath);
      this.isOfficeFile = officeExtensions.includes(ext);
      this.onLoadFdfFile(this.data.filePath);

    }, 100);
  }

  onLoadFdfFile(filePath: string) {
    this.apiService.getBlob(`${environment.PATH_API_V1}/mdm/file?filePath=${filePath}`, new HttpParams())
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);

          this.pdfSrc = blob; // hoặc this.pdfSrc = url;
          this._currentPdfUrl = url;
          this.cdr.detectChanges();
          if (this.pdfViewer) {
            this.pdfViewer.pdfSrc = blob;
            this.pdfViewer.refresh();
          }
        },
        error: (error) => {
          this.utilsService.showErrorToarst(
            this.translateService.instant('COMMON.ERROR_OCCURRED', error),
          );
        },
      });
  }

  private getExtension(nameOrPath: string): string {
    const last = nameOrPath.split('?')[0].split('#')[0];
    const dot = last.lastIndexOf('.');
    return dot >= 0 ? last.substring(dot + 1).toLowerCase() : '';
  }


  downloadFile(filePath: string): void {
    this.apiService.getBlob(`${environment.PATH_API_V1}/mdm/file?filePath=${filePath}`, new HttpParams())
      .toPromise()
      .then((blob: any) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filePath.split('/').pop() || 'downloaded-file';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('Download failed:', error);
      });
  }

  ngOnDestroy() {
    // Clean up blob URL
    if (this._currentPdfUrl) {
      window.URL.revokeObjectURL(this._currentPdfUrl);
    }
  }

  onClose() {
    this.matDialogRef.close();
  }
}
