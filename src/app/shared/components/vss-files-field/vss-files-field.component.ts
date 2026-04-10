import {booleanAttribute, Component, EventEmitter, forwardRef, Input, Output, ViewChild} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator
} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {ActionTypeEnum, FileTypeEnum} from '@c10t/nice-component-library';
import {UploadModel} from "@c10t/nice-component-library/models/components/upload.model";

@Component({
  selector: 'app-vss-files-field',
  standalone: false,
  templateUrl: './vss-files-field.component.html',
  styleUrl: './vss-files-field.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VssFilesFieldComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => VssFilesFieldComponent),
      multi: true
    }
  ],
})
export class VssFilesFieldComponent implements ControlValueAccessor, Validator {

  @Input() fileAccept: string | string[] = '*/*';
  @Input() fileTitle: string | undefined;
  @Input() maxFileSize = 104857600; //default 100MB
  @Input() fieldPerRow: number = 4;
  @Input({transform: booleanAttribute}) multiple = true;
  @Input({transform: booleanAttribute}) isAppear: boolean = false;
  @Input({transform: booleanAttribute}) required: boolean = false;
  @Input({transform: booleanAttribute}) showDownload: boolean = false;
  @Input({transform: booleanAttribute}) isDownloadLocal: boolean = false;
  @Input({transform: booleanAttribute}) fullWidth: boolean = false; // Hiển thị file list full width
  @Input() fileListMaxWidth: string | undefined; // Max width cho file list (vd: '50%', '400px')
  @Input() set actionTypeInput(value: ActionTypeEnum | undefined) {
    if (value !== undefined) this.actionType = value;
  }

  @Output() downloadFile: EventEmitter<any> = new EventEmitter<any>();
  /** Trả về dữ liệu là File */
  @Output() downloadFiles: EventEmitter<any> = new EventEmitter();

  @ViewChild('inputFiles') inputFiles: any;

  files: Array<any> = [];
  disabled: boolean = false;
  actionType?: ActionTypeEnum;

  get isView(): boolean {
    return this.actionType === ActionTypeEnum._VIEW;
  }

  get isEdit(): boolean {
    return this.actionType === ActionTypeEnum._EDIT;
  }

  get normalizedFileAccept(): string[] {
    if (Array.isArray(this.fileAccept)) {
      return this.fileAccept;
    }
    return [this.fileAccept];
  }

// Map MIME -> đuôi file
  private mimeToExt: Record<string, string> = {
    [FileTypeEnum.PDF]: '.pdf',
    [FileTypeEnum.DOC]: '.doc',
    [FileTypeEnum.DOCX]: '.docx',
    [FileTypeEnum.XLS]: '.xls',
    [FileTypeEnum.XLSX]: '.xlsx',
    [FileTypeEnum.JPG]: '.jpg',
    [FileTypeEnum.PNG]: '.png',
    [FileTypeEnum.TXT]: '.txt',
    [FileTypeEnum.XML]: '.xml',
    [FileTypeEnum.ZIP]: '.zip',
  };

  get fileAcceptExtensions(): string[] {
    const exts = this.normalizedFileAccept
      .map(mime => this.mimeToExt[mime] || '')
      .filter(Boolean);
    return Array.from(new Set(exts));
  }

  get fileAcceptLabel(): string {
    const exts = this.fileAcceptExtensions;
    if (!exts.length) {
      return 'tất cả định dạng';
    }
    return exts.join(', ');
  }

  get maxFileSizeMB(): number {
    return Math.round(this.maxFileSize / (1024 * 1024));
  }

  constructor(private route: ActivatedRoute) {
    if (history.state.edit) {
      this.actionType = !!history.state.edit ? ActionTypeEnum._EDIT : ActionTypeEnum._VIEW;
    } else {
      this.actionType = this.route.routeConfig?.data?.actionType;
    }
  }

  onFileSelected(e: any): void {
    this.files = this.files || [];
    this.onChange(this.files);
    this.onTouched();
  }

  removeFile(index: number): void {
    this.files.splice(index, 1);
    this.onChange(this.files);
    this.onTouched();
    this.clearInputFile();
  }

  clearInputFile(): void {
    if (this.inputFiles?.nativeElement) {
      this.inputFiles.nativeElement.value = '';
    }
  }

  onDownloadFile(file: any): void {
    this.downloadFile.emit(file.pathFile || file.name);
    this.downloadFiles.emit(file);
  }

  getFileType(name?: string): string {
    if (!name) return 'unknown';
    const lower = name.toLowerCase();

    switch (true) {
      case lower.endsWith('.pdf'):
        return 'pdf';

      case lower.endsWith('.doc') || lower.endsWith('.docx'):
        return 'word';

      case lower.endsWith('.xls') || lower.endsWith('.xlsx'):
        return 'excel';

      case /\.(png|jpg|jpeg|gif)$/i.test(lower):
        return 'image';

      default:
        return 'unknown';
    }
  }

  writeValue(files: Array<any>): void {
    this.files = files || [];
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  validate(control: AbstractControl): ValidationErrors | null {
    const hasFiles = this.files && this.files.length > 0;

    if (this.required && !hasFiles) {
      return {required: true};
    }
    return null;
  }

  private onChange: any = () => {
  };

  private onTouched: any = () => {
  };
}
