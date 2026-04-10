import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import {
  AlignEnum,
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent,
  ButtonModel,
  ColumnModel,
  ColumnTypeEnum,
  FileTypeEnum,
  IconTypeEnum,
  SelectModel,
  TablePagingResponseModel,
  UploadModel,
  UtilsService,
} from '@c10t/nice-component-library';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { SelectValuesService } from 'src/app/core/services/selectValues.service';
import { PopupChooseUserComponent } from 'src/app/shared/components/internal-user/popup-choose-user/popup-choose-user.component';
import {
  catchError,
  concatMap,
  distinctUntilChanged,
  EMPTY,
  filter,
  forkJoin,
  from,
  lastValueFrom,
  map,
  mergeMap,
  Observable,
  of,
  skip,
  skipUntil,
  Subject,
  switchMap,
  tap,
  toArray,
} from 'rxjs';
import { Utils } from '../../utils/utils';
import { ConfigVOModel, StaffModel } from 'src/app/modules/mdm/_models/config-vo.model';
import { HttpParams } from '@angular/common/http';
import { Config } from 'src/app/common/models/config.model';
import { PermissionCheckingUtil } from 'src/app/shared/utils/permission-checking.util';
import { VIETNAMESE_REGEX } from '../../constants/regex.constants';
import { SignaturePhotoModel } from '../../models/signature-photo.model';
import { FileSignModel, LstStaffModel, SignDocumentModel } from '../../models/sign-document.model';

@Component({
  selector: 'app-sign-template',
  standalone: false,
  templateUrl: './sign-template.component.html',
  styleUrl: './sign-template.component.scss',
})
export class SignTemplateComponent extends BaseAddEditComponent {
  @Input() addEditForm!: FormGroup;
  @Input() moduleName: string = 'common';
  @Input({ required: true }) configForm!: Config;
  @Input() isView = false;
  @Input() isEdit = false;
  // Có tự động tạo Số hiệu hay không
  @Input() autoGenerateCode: boolean = true;
  // Trường để map với title và description
  @Input() titleDescriptionField: string = 'name';

  @Output() backEvent: EventEmitter<any> = new EventEmitter<any>();

  approvalListColumns: ColumnModel[] = [];
  approvalListButtons: ButtonModel[] = [];

  formGroup!: FormGroup;

  signLevelParallelValues: SelectModel[] = [];
  typeValues: SelectModel[] = [];
  areaValues: SelectModel[] = [];
  priorityValues: SelectModel[] = [];
  stypeValues: SelectModel[] = [];
  /** [Luồng ký] Danh sách lựa chọn sử dụng trên UI */
  flowOptions$: Observable<SelectModel[]> = of([]);
  /** Danh sách lựa chọn của combobox Luồng ký sử dụng để xử lý dữ liệu trong Component */
  flowOptions: SelectModel[] = [];
  /** Truy cập nhanh danh sách lựa chọn của combobox "Ảnh ký" theo staffCode */
  signImageOptionsMap: Map<string | number, any> = new Map();
  /** [Luồng ký] Sử dụng để "khóa" combobox "Luồng ký".
   * Khi vào màn Xem chi tiết / Chỉnh sửa, để ưu tiên điền dữ liệu từ API detail vào thay vì
   * từ API /config-vo detail thì phải khóa tạm combobox "Luồng ký" lại. */
  configVoIdSubject$: Subject<any> = new Subject();
  configVoId: number | null = null;
  moduleId: number | null = null;

  protected readonly environment = environment;

  get _approvalCount(): number {
    return this.formGroup.get('lstStaff')?.value?.length ?? 0;
  }

  get FileTypes() {
    return FileTypeEnum;
  }

  /**
   * Lấy giá trị lớn nhất của Nhóm ký song song
   */
  get _maxSignGroup(): number {
    const lstStaff = this.formGroup.get('lstStaff')?.value || [];
    return Math.max(...lstStaff.map((item: any) => item.signLevelParallel), 0);
  }

  constructor(
    protected fb: FormBuilder,
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    protected apiService: ApiService,
    protected location: Location,
    protected translateService: TranslateService,
    protected utilsService: UtilsService,
    protected authoritiesService: AuthoritiesService,
    protected matDialog: MatDialog,
    protected selectValuesService: SelectValuesService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);

    this.selectValuesService
      .getAutocompleteValuesFromVOffice(
        `${environment.PATH_API_V1}/voffice-gateway/fields`,
        [
          {
            key: 'type',
            value: 1,
          },
        ],
        'listForm',
      )
      .pipe(skip(1))
      .subscribe((options) => {
        this.typeValues = options;
        const { typeId, code } = this.formGroup.getRawValue();
        if (typeId && this.typeValues?.length && !code && this.autoGenerateCode) {
          this.formGroup.patchValue({
            code: this.getCode(),
          });
        }
      });
    this.selectValuesService
      .getAutocompleteValuesFromVOffice(
        `${environment.PATH_API_V1}/voffice-gateway/fields`,
        [
          {
            key: 'type',
            value: 3,
          },
        ],
        'listRegion',
      )
      .subscribe((options) => {
        this.areaValues = options;
      });
    this.selectValuesService
      .getAutocompleteValuesFromVOffice(
        `${environment.PATH_API_V1}/voffice-gateway/fields`,
        [
          {
            key: 'type',
            value: 4,
          },
        ],
        'listUrgency',
      )
      .subscribe((options) => {
        this.priorityValues = options;
      });
    this.selectValuesService
      .getAutocompleteValuesFromVOffice(
        `${environment.PATH_API_V1}/voffice-gateway/fields`,
        [
          {
            key: 'type',
            value: 2,
          },
        ],
        'listSecurity',
      )
      .subscribe((options) => {
        this.stypeValues = options;
      });
  }

  async ngOnInit() {
    this.initApprovalListColumns();
    this.initApprovalListButtons();

    this.formGroup = this.fb.group({
      // 🡫🡫🡫🡫🡫 START REGION : THÔNG TIN TRÌNH KÝ 🡫🡫🡫🡫🡫
      id: [null],
      configVoId: [''], // [Luồng ký]
      code: [''], // [Số hiệu]
      title: ['', [Validators.pattern(VIETNAMESE_REGEX)]], // [Trích yếu]
      description: ['', [Validators.pattern(VIETNAMESE_REGEX)]], // [Mô tả]
      typeId: [''], // [Hình thức văn bản]
      areaId: [''], // [Ngành]
      priorityId: [''], // [Độ khẩn]
      sTypeId: [''], // [Độ mật]
      autoPromulgateText: [true], // [Ban hành tự động]
      // 🡩🡩🡩🡩🡩 END REGION : THÔNG TIN TRÌNH KÝ 🡩🡩🡩🡩🡩🡩

      // 🡫🡫🡫🡫🡫 START REGION : FILE ĐÍNH KÈM 🡫🡫🡫🡫🡫
      lstFileSign: [[]], // [File trình ký]
      listFileSignOther: [[]], // [File phụ lục]
      lstFileSigned: [[]], // File trình ký đã ký (Dùng cho Lịch sử trình ký)
      listFileSignedOther: [[]], // File phụ lục đã ký (Dùng cho Lịch sử trình ký)
      // 🡩🡩🡩🡩🡩 END REGION : FILE ĐÍNH KÈM 🡩🡩🡩🡩🡩🡩

      // 🡫🡫🡫🡫🡫 START REGION : DANH SÁCH CÁ NHÂN KÝ DUYỆT : START REGION 🡫🡫🡫🡫🡫
      isSignParallel: [false], // [Trình ký song song]
      canAdd: [true], // Disable/Enable nút Chọn cá nhân ký duyết
      lstStaff: [[]], // [Danh sách người ký]
      // 🡩🡩🡩🡩🡩 END REGION : DANH SÁCH CÁ NHÂN KÝ DUYỆT : END REGION 🡩🡩🡩🡩🡩🡩
    });

    const formValue = this.addEditForm.value;

    this.formGroup.patchValue({
      title: formValue.signDocumentDto.title ?? formValue[this.titleDescriptionField],
      description: formValue.signDocumentDto.description ?? formValue[this.titleDescriptionField],
    });

    /** [Luồng ký] Combobox "Luồng ký" sẽ được mở khóa, cho phép người dùng tự chọn giá trị nếu
     *  configVoId == null trong API detail (nghĩa là KHCT mới được tạo, chưa được cấu hình trình ký) */
    if (!this.addEditForm.get('signDocumentDto')?.value?.configVoId) {
      /** Sử dụng setTimeout để các FormGroup, FormControl khởi tạo xong */
      setTimeout(() => {
        this.configVoIdSubject$.next(0);
      });
    }

    this.formGroup.get('isSignParallel')?.valueChanges.subscribe((value) => {
      const sectionColIndex = this.approvalListColumns.findIndex((item) => item.columnDef == 'signLevelParallel');
      this.approvalListColumns[sectionColIndex].isShowHeader = value;
      this.approvalListColumns[sectionColIndex].display = (e: any) => value;
    });



    /** [Luồng ký] Xử lý logic khi hệ thống hoặc user chọn giá trị cho Combobox Luồng ký.
     * Khi giá trị của combobox thay đổi thì sẽ lấy ra dữ liệu trong flowOptions (được lấy từ API /config-vo)
     * ứng với lựa chọn đó và thiết lập cho bảng "Danh sách cá nhân ký duyệt".
     */
    this.configVoIdChange();

    /** Gọi API /menu để lấy danh sách menu, sau đó so sánh với url (ví dụ :travel-expense/te-confirmation) để có menuId => lấy cấu hình trình ký theo menuId */
    await this.getMenuAndConfigVo();

    /** [Số hiệu] Khi thay đổi giá trị của Combobox "Hình thức văn bản" thì sẽ tự động tạo lại giá trị cho "Số hiệu" */
    this.formGroup
      .get('typeId')
      ?.valueChanges.pipe(distinctUntilChanged())
      .subscribe((typeId: number) => {
        if (typeId && this.typeValues?.length && this.autoGenerateCode) {
          this.formGroup.patchValue({
            code: this.getCode(typeId),
          });
        }
      });

    if (this.isView || this.isEdit) {
      this.initForm();

      /** (1) Cập nhật những thay đổi của FormGroup bên trong component này lên addEditForm của component cha, chỉ áp
       *  dụng mới màn Chỉnh sửa */
      this.formGroup.valueChanges
        .pipe(
          filter(() => this.isEdit),
          skipUntil(this.configVoIdSubject$),
        )
        .subscribe((_) => {
          this.addEditForm.get('signDocumentDto')?.setValue(this.formGroup.getRawValue());
        });
    }
  }

  configVoIdChange() {
    this.formGroup
      .get('configVoId')
      ?.valueChanges.pipe(
        filter(() => this.isEdit),
        distinctUntilChanged(),
        skipUntil(this.configVoIdSubject$),
      )
      .subscribe((configVoId) => {
        if (configVoId == -1) {
          this.configVoId = 0;
          this.formGroup.patchValue({
            configVoId: '',
          });
        } else {
          this.configVoId = configVoId;
        }
        if (this.configVoId) {
          const selectedItem = this.flowOptions.find((item) => item.value === configVoId);
          let hasParallelSign: boolean = false;
          const convertLstStaff = selectedItem?.rawData?.lstStaff?.map((staff: StaffModel) => {
            if (staff.signLevelParallel) {
              hasParallelSign = true;
            }
            return { ...staff };
          });

          this.formGroup.patchValue({
            typeId: selectedItem?.rawData?.typeId,
            areaId: selectedItem?.rawData?.areaId,
            priorityId: selectedItem?.rawData?.priorityId,
            sTypeId: selectedItem?.rawData?.stypeId,
            autoPromulgateText: selectedItem?.rawData?.autoPromulgateText,
            lstStaff: convertLstStaff,
            canAdd: selectedItem?.rawData?.canAdd,
            isSignParallel: hasParallelSign,
          });

          this._calculateSignLevelParallelValues();

          const lstStaff = selectedItem?.rawData?.lstStaff;
          if (!lstStaff?.length) return;

          /** Lấy dữ liệu từ lstStaff trong API /mdm/config-vo detail (API này được gọi khi chọn 1 giá trị cho combobox "Luồng ký") */
          this.getStaffOptionsForEachRowData(lstStaff);
        } else {
          this.formGroup.patchValue({
            typeId: '',
            areaId: '',
            priorityId: '',
            sTypeId: '',
            autoPromulgateText: true,
            lstStaff: [],
            canAdd: true,
            isSignParallel: false,
          });
          this.formGroup.markAsPristine();
        }
      });
  }

  async getMenuAndConfigVo() {
    const menus = await lastValueFrom(
      this.selectValuesService
        .getAutocompleteValuesFromModulePath(
          `${environment.PATH_API_V1}/mdm/menu`,
          undefined,
          undefined,
          'id,code,name,url,moduleId',
        )
        .pipe(filter((options) => !!options?.length)),
    );
    const selectedMenu = menus.find((item: any) => {
      return item.rawData.url === this.getBasePath();
    });
    this.moduleId = selectedMenu?.rawData?.moduleId;
    const me = Utils.getObservableValue(this.authoritiesService.me$);

    /** [Luồng ký] Sau khi có menuId thì truyền vào API /config-vo để lấy danh sách các lựa chọn cho
     *  combobox "Luồng ký" */
    this.flowOptions = await lastValueFrom(
      this.selectValuesService
        .getAutocompleteValuesFromModulePath(
          `${environment.PATH_API_V1}/mdm/config-vo`,
          [
            {
              key: 'menuId',
              value: selectedMenu?.value,
            },
            {
              key: 'organizations.id',
              value: me?.userAuthentication?.principal?.orgId,
            },
          ],
          undefined,
          'id,title,typeId,areaId,priorityId,stypeId,autoPromulgateText,canAdd,status',
          false,
          'title',
          true,
        )
        .pipe(
          switchMap((options) => {
            if (!options.length) return of([]);

            /** [Luồng ký] Sau khi có danh sách các giá trị của combobox "Luồng ký", ứng với mỗi giá trị
             *  thì dùng id để gọi API /config-vo detail, lấy dữ liệu lstStaff cho bảng "Danh sách cá nhân ký duyệt"
             *  do API lấy danh sách /config-vo không trả về dữ liệu cho bảng này */
            const enrichedOptions$ = options.filter(item => item.value == -1 || item.rawData.status == 'APPROVED' || this.addEditForm.get('signDocumentDto')?.value.configVoId == item.value).map((option) =>
              /** Lựa chọn "Chọn giá trị" của combobox có giá trị = -1 nên không cần gọi API để lấy dữ vì sẽ báo lỗi */
              option.value !== -1
                ? this.apiService
                    .get<ConfigVOModel>(`${environment.PATH_API_V1}/mdm/config-vo/${option.value}`, new HttpParams())
                    .pipe(
                      map((response) => ({
                        ...option,
                        rawData: {
                          ...option.rawData,
                          lstStaff: response.lstStaff || [],
                        },
                      })),
                    )
                : of(option),
            );

            return forkJoin(enrichedOptions$);
          }),
        ),
    );

    const configVoIdControl = this.formGroup.get('configVoId');
    /** [Luồng ký] Nếu combobox "Luồng ký" có ít nhất 1 giá trị và formControl configVoId = null
     *  (tức là trong API detail không có giá trị configVoId) thì sẽ tự động điền giá trị đầu tiên vào combobox */
    if (this.flowOptions.length == 2 && !configVoIdControl?.value && this.isEdit) {
      configVoIdControl?.setValue(this.flowOptions[1].value);
    }
  }


  /**
   * Khởi tạo giá trị cho form từ API. Sau khi gọi API save-draft thì phải gọi lại hàm initForm để cập nhật
   */
  initForm() {
    const formGroupValue = this.formGroup.value;
    const signDocumentDto = this.addEditForm.get('signDocumentDto')?.value as SignDocumentModel;
    /** So sánh value của FormGroup nội bộ với value của trường signDocumentDto trong addEditForm ở
     * component cha. Nếu giống nhau nghĩa là trong API detail không có dữ liệu trình ký (signDocumentDto = null)
     * và dữ liệu khởi tạo ở FormGroup nội bộ đã được đồng bộ lên addEditForm tại logic (1) */
    if (JSON.stringify(signDocumentDto) === JSON.stringify(formGroupValue)) return;

    this.configVoId = signDocumentDto?.configVoId;

    const configVo = this.flowOptions.find((item) => item.value === signDocumentDto?.configVoId);
    const lstStaffFromConfigVo = configVo?.rawData?.lstStaff as StaffModel[];

    const lstStaff = signDocumentDto?.lstStaff?.map((staff, index: number) => {
      const staffFromConfigVo = lstStaffFromConfigVo?.find((item) => item.id === staff.configVoStaffId);
      return {
        ...staff,
        /** Đánh dấu những bản ghi lấy từ API detail, để khi thêm Cá nhân ký duyệt từ Popup không bị ghi đề */
        isFromAPI: true,
        isPromulgate: staff.departmentSignId === signDocumentDto.officePublishedId,
        signLevelParallel: signDocumentDto.isSignParallel ? staff.signLevel! + 1 : index + 1,
        jobPositions: staffFromConfigVo?.jobPositions || [],
        isRequire: staffFromConfigVo?.isRequire || false,
      };
    });

    this.formGroup.patchValue({
      ...signDocumentDto,
      lstStaff,
      canAdd: configVo?.rawData?.canAdd ?? true,
    });

    this.formGroup.markAsPristine();

    const lstFileSign = signDocumentDto?.lstFileSign || [];
    const listFileSignOther = signDocumentDto?.listFileSignOther || [];
    this.downloadFile(lstFileSign, listFileSignOther);

    this._calculateSignLevelParallelValues();
    this.setLastStaffPromulgate();

    if (this.isEdit) {
      /** Lấy dữ liệu từ API detail để thiết lập giá trị cho các dòng trong bảng "Danh sách cá nhân ký duyệt" */
      this.getStaffOptionsForEachRowData(lstStaff);

      setTimeout(() => {
        this.configVoIdSubject$.next(0);
      });
    }
  }

  /**
   * [File trình ký, File phụ lục] Tải lại file từ server để khi nhấn nút Lưu nháp trong màn Chỉnh sửa thì tải lại file
   * lên Server giống như lúc Thêm mới
   * @params lstFileSign: Danh sách file trình ký, lấy từ API detail
   * @params listFileSignOther: Danh sách file phụ lục, lấy từ API detail
   */
  downloadFile(lstFileSign: any[], listFileSignOther: any[]) {
    const filesForSigningObs = lstFileSign
      ?.filter((file) => file.filePathVss)
      ?.map((file) =>
        this.apiService
          .getBlob(`${environment.PATH_API_V1}/mdm/file?filePath=${file.filePathVss}`, new HttpParams())
          .pipe(catchError((_) => EMPTY)),
      );

    const filesAppendixObs = listFileSignOther
      ?.filter((file) => file.filePathVss)
      ?.map((file) =>
        this.apiService
          .getBlob(`${environment.PATH_API_V1}/mdm/file?filePath=${file.filePathVss}`, new HttpParams())
          .pipe(catchError((_) => EMPTY)),
      );

    if (filesForSigningObs?.length) {
      forkJoin(filesForSigningObs).subscribe((blobs) => {
        const files = blobs.map((blob, index) => {
          const fileInfo = lstFileSign[index];
          const file = new File([blob], fileInfo.name, { type: this.FileTypes.PDF });

          return {
            name: fileInfo.name,
            id: fileInfo.id,
            previewValue: null,
            type: this.FileTypes.PDF,
            binary: file,
            filePath: fileInfo.filePathVss,
          };
        });

        this.formGroup.get('lstFileSign')?.setValue(files);
      });
    }

    if (filesAppendixObs?.length) {
      forkJoin(filesAppendixObs).subscribe((blobs) => {
        const files = blobs.map((blob, index) => {
          const fileInfo = listFileSignOther[index];
          const file = new File([blob], fileInfo.name, { type: this.FileTypes.PDF });

          return {
            name: fileInfo.name,
            id: fileInfo.id,
            previewValue: null,
            type: this.FileTypes.PDF,
            binary: file,
            filePath: fileInfo.filePathVss,
          };
        });

        this.formGroup.get('listFileSignOther')?.setValue(files);
      });
    }
  }

  /**
   * [Người ký] Gọi API lấy danh sách lựa chọn cho combobox "Người ký" cho
   * tất cả các dòng trong bảng "Danh sách cá nhân ký duyệt".
   * @params lstStaff là danh sách dữ liệu của các dòng trong bảng
   */
  getStaffOptionsForEachRowData(lstStaff: Partial<LstStaffModel>[]) {
    /** Màn Chỉnh sửa mới cần gọi sang VO lấy dữ liệu */
    if (!lstStaff?.length || !this.isEdit) return;

    from(lstStaff)
      .pipe(
        mergeMap((staff, index: number) => {
          let obs$: Observable<any>;
          if (staff.staffCode && (!staff.jobPositions || staff.jobPositions.length == 0)) {
            /** Dữ liệu của cá nhân ký duyệt có staffCode (Khi thiết lập "Cấu hình luồng trình ký"
             * > Bảng "Cấu hình trình ký" > Chọn "Người ký") thì sẽ gọi API /voffice-gateway/users
             * sang VO để lấy dữ liệu cho combobox "Đơn vị" và "Ảnh ký"*/
            obs$ = this.getDepartmentAndSignImageOptionFromVO(staff, index);
          } else {
            obs$ = this.getStaffOptionsForPositionRow(staff, index);
          }

          /** Sử dụng index để sắp xếp kết quả nhận được đúng với thứ tự từng của từng cá nhân trong bảng */
          return obs$.pipe(
            map((result) => ({
              index,
              result,
            })),
          );
        }),
        toArray(),
        map((results) => {
          const sortedResults = [...results].sort((a, b) => a.index - b.index);
          return sortedResults.map((r) => r.result);
        }),
        /** Sau khi gọi API /users sang VO hoặc /internal-user sẽ trả về danh sách giá trị của combobox "Người ký" */
      )
      .subscribe((optionList: SelectModel[][]) => {
        this.setStaffOptionsForEachRowData(optionList);
      });
  }

  setStaffOptionsForEachRowData(optionList: SelectModel[][]) {
    const lstStaffControl = this.formGroup.get('lstStaff');
    const lstStaffValue = this.getValue(lstStaffControl?.value, []) as LstStaffModel[];

    /** Lưu danh sách các giá trị của Combobox "Người ký" vào dữ liệu của từng dòng trong bảng để tái sử dụng */
    const newLstStaff = lstStaffValue.map((staff, index: number) => {
      const staffOptions = this.getValue(optionList[index], []).filter(
        (item) =>
          lstStaffValue.find((s) => (s.staffCode !== staff.staffCode ? s.staffCode === item.value : false)) == null,
      );
      const options: SelectModel[] = this.getValue(this.signImageOptionsMap.get(this.getValue(staff.staffCode, 0)), []);
      return {
        ...staff,
        staffOptions,
        staffCode: this.getValue(
          staff.staffCode,
          this.getValueFromList(staffOptions, staffOptions[0]?.value, null),
        ),
        staffFullName: this.getValue(
          staff.staffFullName,
          this.getValueFromList(staffOptions, staffOptions[0]?.rawData.fullName, null),
        ),
        /** Khi dữ liệu từ API detail trả về được khởi tạo vào bảng nếu được thiết lập "Hiện ảnh ký" và
         * nếu chỉ có 1 ảnh thì tự động điền vào combobox "Ảnh ký" */
        signImageId: staff.signImage
          ? this.getValue(this.getValueFromList(options, options[0]?.value, null), staff.signImageId)
          : null,
        signImageName: staff.signImage
          ? this.getValue(this.getValueFromList(options, options[0]?.rawData.name, null), staff.signImageName)
          : null,
        configVoStaffId: staff.id,
      };
    });
    lstStaffControl?.setValue(newLstStaff);

    this._refineItems();
    this._calculateSignLevelParallelValues();
  }

  getStaffOptionsForPositionRow(staff: Partial<LstStaffModel>, index: number) {
    /** Dữ liệu của cá nhân ký duyệt không có staffCode (Khi thiết lập "Cấu hình luồng trình ký" >
     * Bảng "Cấu hình trình ký" > Chọn "Chức danh") thì gọi API /internal-user để lấy dữ liệu */
    let params = new HttpParams()
      .set('pageNumber', '1')
      .set('pageSize', environment.INTEGER_MAX_VALUE.toString())
      .set('status', 'APPROVED')
      .set('selectedFields', 'id,code,fullName,userName');
    // Lấy user theo chức danh và đơn vị của người trình ký (1)
    let paramsForjobPositionId = new HttpParams();
    // Lấy user được uỷ quyền
    let paramsForInternalUserDelegations = new HttpParams();
    // Lấy user theo chức danh kiêm nhiệm và đơn vị của người trình ký
    let paramsForInternalUserPositions = new HttpParams();

    /** Nếu có jobPositions (Chọn nhiều chức danh) thì truyền danh sách id vào params.
     * Nếu không có thì lấy tất cả internal-user */
    if (staff.jobPositions?.length) {
      const positionIds = this.getValue(staff.jobPositions?.map((item: any) => item.id)?.join(','), '');
      paramsForInternalUserPositions = params
        .set('internalUserPositions.positionId', positionIds)
        .set('internalUserPositions.organizationId', this.getValue(this.me?.userAuthentication?.principal?.orgId, ''));

      paramsForjobPositionId = params
        .set('jobPositionId', positionIds)
        .set('organizationId', this.getValue(this.me?.userAuthentication?.principal?.orgId, ''));

      return forkJoin([
        this.getInternalUser(paramsForjobPositionId).pipe(
          switchMap((res) => {
            const userIds = this.getValue(res.content.map((item) => item.id)?.join(','), '');
            if (userIds.length > 0) {
              paramsForInternalUserDelegations = params.set('userId', userIds);
              return forkJoin([of(res), this.getInternalUserDelegation(paramsForInternalUserDelegations)]);
            }
            return of(res);
          }),
        ),
        this.getInternalUser(paramsForInternalUserPositions),
      ]).pipe(
        map((res) =>
          Utils.uniqBy(
            res.flat().flatMap((item) => item.content),
            'id',
          ),
        ),
        switchMap((res) => {
          if (res?.length === 1) {
            /** Nếu API /internal-user chỉ trả về 1 giá trị thì hệ thống sẽ tự động gọi sang VO */
            const resStaff = res[0];
            return this.getDepartmentAndSignImageOptionFromVO(
              {
                ...resStaff,
                staffCode: resStaff.code,
                staffFullName: resStaff.fullName,
              },
              index,
            );
          }
          return of(
            res.map((item: any) => new SelectModel(item?.code, item.fullName + ' (' + item.code + ')', false, item)),
          );
        }),
        catchError((_) => of([])),
      );
    } else {
      return of([]);
    }
  }

  // Lấy người dùng được uỷ quyền
  getInternalUserDelegation(params: HttpParams): Observable<TablePagingResponseModel> {
    params = params.set('selectedFields', 'id,assignerId,assignerEntity.fullName,assignerEntity.code,startDate,endDate').set('moduleId', this.moduleId!);
    return this.apiService
      .get<TablePagingResponseModel>(`${environment.PATH_API_V1}/mdm/internal-user-delegation`, params)
      .pipe(
        map((res) => ({
          ...res,
          content: res.content.filter(item => this.checkValidEffective(item.startDate, item.endDate)).map((item) => ({
            id: item.assignerId,
            code: item.assignerCode,
            fullName: item.assignerFullName,
          })),
        })),
      );
  }

  // Lấy người dùng nội bộ
  getInternalUser(params: HttpParams) {
    return this.apiService.get<TablePagingResponseModel>(`${environment.PATH_API_V1}/mdm/internal-user`, params);
  }

  /**
   * [Đơn vị] [Ảnh ký] Lấy dữ liệu cho combobox "Đơn vị" và "Ảnh ký" cho từng dòng trong bảng "Danh sách cá nhân ký duyệt".
   * Khi người dùng hoặc hệ thống điền giá trị vào combobox "Người ký", hệ thống sẽ gọi API sang VOffice để lấy các lựa chọn
   * cho combobox "Đơn vị" và combobox "Ảnh ký"
   * @params staff là dữ liệu của cá nhân ký duyệt trong 1 dòng của bảng
   * @params ObsIndex là index của dòng phát ra Observable, sử dụng để map dữ liệu nhận được sau khi gọi API
   *         đúng với dòng dữ liệu nằm trong listStaff trong FormGroup
   * @returns Observable trả về danh sách lựa chọn cho combobox "Người ký", combobox "Đơn vị", combobox "Ảnh ký"
   */
  getDepartmentAndSignImageOptionFromVO(staff: any, ObsIndex: number) {
    /** Bước 1 : Sử dụng staffCode để gọi API /users của VO để lấy giá trị cho combobox "Đơn vị" */
    return this.apiService
      .get(
        `${environment.PATH_API_V1}/voffice-gateway/users`,
        new HttpParams().set('keyword', staff.staffCode),
        environment.VOFFICE_URL,
      )
      .pipe(
        concatMap((res: any) => {
          /** Dữ liệu nhận được từ API /voffice-gateway/users luôn là 1 mảng chứa 1 giá trị => Lấy bản ghi đầu tiên */
          const user = res[0];
          const lstStaffControl = this.formGroup.get('lstStaff')!;
          const lstStaffValue = this.getValue(lstStaffControl?.value, []);

          /** Sử dụng danh sách userRoles trong dữ liệu trả về để làm danh sách lựa chọn cho combobox "Đơn vị" */
          const departmentSignOptions = user?.userRoles?.map(
            (item: any) => new SelectModel(item?.userRoleId, item.roleName + ' - ' + item.orgName, false, item),
          ) as SelectModel[];

          /** Giá trị có trường isDefault = true thì sẽ được đặt làm mặc định */
          const defaultUserRole = user?.userRoles?.find((item: any) => item.isDefault);

          const newLstStaff = this.getNewLstStaff(
            lstStaffValue,
            user,
            staff,
            ObsIndex,
            departmentSignOptions,
            defaultUserRole,
          );

          lstStaffControl?.setValue(newLstStaff);

          /** Bước 2 : Tiếp tục gọi API /signature-photo để lấy dữ liệu cho combobox "Ảnh ký" */
          if (user) {
            this.apiService
              .get<SignaturePhotoModel[]>(
                `${environment.PATH_API_V1}/voffice-gateway/signature-photo`,
                new HttpParams().set('staffId', user.employeeId).set('staffCode', staff.staffCode),
                environment.VOFFICE_URL,
              )
              .pipe(
                tap((list) => {
                  const options =
                    list
                      .filter((item) => this.checkSignaturePhoto(item))
                      .map((item) => new SelectModel(item.staffImageSignId, item.name!, false, item));
                  this.signImageOptionsMap.set(staff.staffCode, this.getValue(options, []));
                }),
              )
              .subscribe();
          }

          return of([
            new SelectModel(staff.staffCode, staff.staffFullName + ' (' + staff.staffCode + ')', false, this.getValue(user, staff)),
          ]);
        }),
        catchError((_) => of([])),
      );
  }

  getNewLstStaff(lstStaffValue: LstStaffModel[], user: StaffModel, staff: LstStaffModel, ObsIndex: number, departmentSignOptions: SelectModel[], defaultUserRole: any) {
    return lstStaffValue.map((item: any, formIndex: number) => {
      return {
        ...item,
        /** Sử dụng employeeId của API /voffice-gateway/user lấy từ VO để làm giá trị cho staffId */
        staffId: ObsIndex === formIndex ? user?.employeeId : item.staffId,
        /** Sử dụng fullName và employeeCode từ VO để tạo ra staffFullName lưu vào BD.
         * Mục đích : Ở màn Xem chi tiết, sử dụng staffFullName hiển thị "Người ký" */
        staffFullName: ObsIndex === formIndex && user ? staff.staffFullName : item.staffFullName,
        departmentSignOptions:
          ObsIndex === formIndex ? this.getValue(departmentSignOptions, []) : item.departmentSignOptions,
        /** Chỉ tự động điền giá trị mặc định cho combobox "Đơn vị" khi mà combobox chưa có giá trị (value) */
        departmentSignId:
          ObsIndex === formIndex && !item.departmentSignId ? defaultUserRole?.orgId : item.departmentSignId,
        userRoleId: ObsIndex === formIndex && !item.userRoleId ? defaultUserRole?.userRoleId : item.userRoleId,
        configVoStaffId: ObsIndex === formIndex ? staff.id : item.configVoStaffId,
      };
    });
  }

  checkSignaturePhoto(item: SignaturePhotoModel): boolean {
    function parseDate(dateStr: string) {
      if (!dateStr) return null;
      // Định dạng: dd/MM/yyyy HH:mm:ss
      const [datePart] = dateStr.split(' ');
      const [day, month, year] = datePart.split('/').map(Number);
      return new Date(year, month - 1, day);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fromDate = parseDate(item.fromDateActive || '');
    if (!fromDate) return false;
    fromDate.setHours(0, 0, 0, 0);

    if (!item.toDateActive) {
      return today >= fromDate;
    }
    const toDate = parseDate(item.toDateActive);
    if (!toDate) return false;
    toDate.setHours(0, 0, 0, 0);

    return today >= fromDate && today <= toDate;
  }

  checkValidEffective(fromDateStr: string | null, toDateStr: string | null): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fromDate = fromDateStr ? new Date(fromDateStr) : null;
    const toDate = toDateStr ? new Date(toDateStr) : null;
    if (!fromDate) return false;
    fromDate.setHours(0, 0, 0, 0);
    if (!toDate) {
      return today >= fromDate;
    }
    if (!toDate) return false;
    toDate.setHours(0, 0, 0, 0);
    return today >= fromDate && today <= toDate;
  }

  getBasePath(): string {
    const url = this.router.url; // e.g. /travel-expense/te-plan/tc-detail/2072
    const segments = url.split('/').filter((x) => x); // ['travel-expense', 'te-plan', 'tc-detail', '2072']
    return segments.slice(0, 2).join('/');
  }

  /**
   * @usage Thêm cá nhân ký duyệt từ Popup
   */
  onAddSigner(): void {
    this.matDialog
      .open(PopupChooseUserComponent, {
        disableClose: false,
        width: '1500px',
        maxWidth: '100vw',
        maxHeight: '90vh',
        data: {
          selected: this.formGroup.get('lstStaff')?.value,
          trackBy: 'staffCode',
          mapBy: 'code',
          selectedTreeId: this.me?.userAuthentication?.principal?.orgId,
        },
      })
      .afterClosed()
      .subscribe((selectedUsers: any[]) => {
        if (selectedUsers) {
          this._addEmployees(selectedUsers);
        }
      });
  }

  _addEmployees(employees: any[]): void {
    const newListStaff: Partial<LstStaffModel>[] = [];
    const startIndex = this._approvalCount + 1;
    const startGroup = this._maxSignGroup + 1;

    employees
      // .filter(employee => this._canAddEmployee(employee))
      .forEach((employee, index) => {
        newListStaff.push(
          employee.isFromAPI
            ? employee
            : {
                ...employee,
                signLevel: this.getValue(employee.signLevel, startIndex + index),
                signLevelParallel: this.getValue(employee.signLevelParallel, startGroup + index),
                staffId: this.getValue(employee.staffId, employee.id),
                staffCode: this.getValue(employee.staffCode, employee.code),
                staffFullName: this.getValue(employee.staffFullName, employee.fullName),
                departmentSignId: this.getValue(employee.departmentSignId, null),
                userRoleId: this.getValue(employee.userRoleId, null),
                signImage: this.getValue(employee.signImage, null),
                signImageId: this.getValue(employee.signImageId, null),
                isPromulgate: this.getValue(employee.isPromulgate, false),
                isRequire: this.getValue(employee.isRequire, false),
              },
        );
      });

    const mergedLstStaff = [...newListStaff];
    /**
     * Luồng chỉnh sửa (Bước 5) :
     * - Người dùng có thể chọn cá nhân ký duyệt từ Popup "Chọn CBNV đi công tác".
     * - Dữ liệu được chuyển đổi từ API /internal-user
     */
    this.getStaffOptionsForEachRowData(mergedLstStaff);

    this.setLstStaffValue(mergedLstStaff);
    this._calculateSignLevelParallelValues();
    this.setLastStaffPromulgate();
  }

  onDownloadFile(file: UploadModel & FileSignModel) {
    const fileName = file.name || '';
    const filePath = file.filePath || '';
    if (filePath) {
      this.apiService
        .getBlob(`${environment.PATH_API_V1}/mdm/file?filePath=${filePath}`, new HttpParams())
        .toPromise()
        .then((blob: any) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName.split('/').pop() || 'downloaded-file';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        })
        .catch((error) => {
          console.error('Download failed:', error);
        });
    } else {
      const blob = new Blob([file.binary!], { type: file.type || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  }

  onDeleteRow(event: any) {
    const lstStaffControl = this.formGroup.get('lstStaff');
    if (!lstStaffControl) {
      console.error('lstStaff control is not found');
      return;
    }
    const lstStaffControlValue = [...(lstStaffControl.value || [])];
    const index = lstStaffControlValue.findIndex((i) => i === event);
    lstStaffControlValue.splice(index, 1);
    lstStaffControl?.setValue(lstStaffControlValue);

    this._refineItems();
    this._calculateSignLevelParallelValues();

    this.signImageOptionsMap.delete(event.staffCode);
  }

  onReorderUp(event: any) {
    const lstStaffControl = this.formGroup.get('lstStaff');
    if (!lstStaffControl) {
      console.error('lstStaff control is not found');
      return;
    }
    const lstStaffControlValue = [...(lstStaffControl.value || [])];
    const index = lstStaffControlValue.findIndex((i) => i === event);
    if (index === 0) return;
    const temp = { ...lstStaffControlValue[index] };
    lstStaffControlValue[index].signLevelParallel = lstStaffControlValue[index - 1].signLevelParallel;
    lstStaffControlValue[index].signLevel = lstStaffControlValue[index - 1].signLevel;
    lstStaffControlValue[index - 1].signLevelParallel = temp.signLevelParallel;
    lstStaffControlValue[index - 1].signLevel = temp.signLevel;
    lstStaffControl?.setValue(lstStaffControlValue);
    this._refineItems();

    this.setLastStaffPromulgate();
  }

  onReorderDown(event: any) {
    const lstStaffControl = this.formGroup.get('lstStaff');
    if (!lstStaffControl) {
      console.error('lstStaff control is not found');
      return;
    }
    const lstStaffControlValue = [...(lstStaffControl.value || [])];
    const index = lstStaffControlValue.findIndex((i) => i === event);
    if (index === lstStaffControlValue.length - 1) return;
    const temp = { ...lstStaffControlValue[index] };
    lstStaffControlValue[index].signLevelParallel = lstStaffControlValue[index + 1].signLevelParallel;
    lstStaffControlValue[index].signLevel = lstStaffControlValue[index + 1].signLevel;
    lstStaffControlValue[index + 1].signLevelParallel = temp.signLevelParallel;
    lstStaffControlValue[index + 1].signLevel = temp.signLevel;
    lstStaffControl?.setValue(lstStaffControlValue);
    this._refineItems();

    this.setLastStaffPromulgate();
  }

  /**
   * @usage Người ký cuối cùng sẽ được mặc định tick vào ô "Ban hành"
   */
  setLastStaffPromulgate() {
    const lstStaffControl: LstStaffModel[] = this.formGroup.get('lstStaff')?.value || [];
    const newLstStaff = lstStaffControl?.map((staff, staffIndex: number) => {
      return {
        ...staff,
        isPromulgate: lstStaffControl.length - 1 === staffIndex,
      };
    });
    this.formGroup.get('lstStaff')?.setValue(newLstStaff);
  }

  /**
   * [Nhóm ký song song] Tính toán lựa chọn của combobox Nhóm ký song song
   */
  _calculateSignLevelParallelValues(): void {
    this.signLevelParallelValues = [];
    const maxSignGroup = this._maxSignGroup;
    for (let i = 1; i <= maxSignGroup; i++) {
      this.signLevelParallelValues = [
        ...this.signLevelParallelValues,
        {
          value: i,
          displayValue: 'Nhóm ' + i,
          rawData: i,
          disabled: false,
        },
      ];
    }
  }

  /**
   * @usage Thay đổi giá trị của nhóm ký song song
   * @deprecated Đã dùng handleSignLevelParallelChange thay thế
   */
  changeSignLevelParallel(approval: StaffModel): void {
    let items = this.formGroup.get('lstStaff')?.value || [];
    if (approval.signLevel === items[items.length - 1].signLevel) {
      // Cover trường hợp bản ghi được chọn để đổi nhóm thuộc nhóm ký cuối
      let temp = approval.signLevel;
      approval.signLevel = items[items.length - 2].signLevel;
      items[items.length - 2].signLevel = temp;
    }

    this._refineItems();
  }

  _refineItems(): void {
    // Cover trường hợp tất cả các nhóm đều chọn cùng nhau thì phần tử n-1 sẽ được đưa vào nhóm ký cuối
    let items = this.getValue(this.formGroup.get('lstStaff')?.value, []);
    if (items.every((item: StaffModel) => item.signLevelParallel === 1)) {
      items = items.map((item: StaffModel, index: number) => {
        if (index === items.length - 2) {
          return {
            ...item,
            signLevelParallel: this.getValue(item.signLevelParallel, 0) + 1,
          };
        }
        return { ...item };
      });
    }

    // sort items

    items.sort(this.sortFunc);

    // sanitize groupIndex values (must start with 1 and next by increasing 1)
    let groupIndex = 1;
    let tempGroupIndex = 0;
    items = items.map((item: StaffModel) => {
      if (tempGroupIndex === 0) {
        tempGroupIndex = this.getValue(item.signLevelParallel, 0);
      }
      if (this.getValue(item.signLevelParallel, 0) > tempGroupIndex) {
        groupIndex++;
        tempGroupIndex = item.signLevelParallel!;
      }
      return {
        ...item,
        signLevelParallel: groupIndex,
      };
    });

    // update signIndex
    items.forEach((item: StaffModel, index: number) => (item.signLevel = index + 1));

    this.setLstStaffValue(items);

    this._setSectionForLastObject();

    // TODO: Nhóm cuối cùng chỉ có duy nhất 1 phần tử

    this._calculateSignLevelParallelValues();
  }

  sortFunc = (a: StaffModel, b: StaffModel) => {
    if (a.signLevelParallel! > b.signLevelParallel!) return 1;
    if (a.signLevelParallel! < b.signLevelParallel!) return -1;
    if (a.signLevel! > b.signLevel!) return 1;
    if (a.signLevel! < b.signLevel!) return -1;
    return 0;
  };

  _setSectionForLastObject(): void {
    let items = this.formGroup.get('lstStaff')?.value || [];
    const maxSection = Math.max(...items.map((item: StaffModel) => item.signLevelParallel));
    let countMaxSection = 0;
    items.forEach((item: StaffModel) => {
      if (item.signLevelParallel === maxSection) {
        countMaxSection += 1;
      }
    });
    if (countMaxSection > 1) {
      items = items.map((item: StaffModel, index: number) => {
        if (index === items.length - 1) {
          return {
            ...item,
            signLevelParallel: (item.signLevelParallel || 0) + 1,
          };
        }
        return { ...item };
      });
    }
    this.setLstStaffValue(items);
  }

  /**
   * @usage Thiết lập giá trị của "Danh sách cá nhân ký duyệt" vào FormControl để hiển thị vào bảng
   */
  setLstStaffValue(lstStaff: Partial<LstStaffModel>[]): void {
    const hasPromulgate = lstStaff.some((item) => item.isPromulgate);
    if (!hasPromulgate && lstStaff?.length) {
      lstStaff[lstStaff.length - 1].isPromulgate = true;
    }
    this.formGroup.get('lstStaff')?.setValue(lstStaff);
  }

  /**
   * "Số hiệu" sẽ được tạo ra nếu giá trị của Combobox "Hình thức văn bản" được chọn
   */
  private getCode(typeId?: number): string {
    const addEditFormValue = this.addEditForm.value;
    const formValue = this.formGroup.value;
    if (!typeId) typeId = formValue.typeId;
    const selected = this.typeValues.find((item) => item.value === typeId);
    return `${addEditFormValue.code}/${selected?.rawData?.abbreviate}`;
  }

  getValue<T, U>(value: T, defaultValue: U) {
    return value !== null && value !== undefined ? value : defaultValue;
  }

  getValueFromList(list: any[], value: any, defaultValue: any) {
    return list.length == 1 ? value : defaultValue;
  }

  initApprovalListColumns() {
    this.approvalListColumns.push(
      ...[
        {
          columnDef: 'stt',
          header: 'stt',
          headerClassName: 'mat-column-stt width-5 min-width-40',
          className: 'mat-column-stt',
          title: (e: StaffModel) => `${this.formGroup.get('lstStaff')?.value?.indexOf(e) + 1}`,
          cell: (e: StaffModel) => {
            const values = this.formGroup.get('lstStaff')?.value as StaffModel[];
            const index = values.indexOf(e) + 1;
            e.prevSignLevelParallel = e.signLevelParallel;
            return index.toString();
          },
          isShowHeader: true,
          display: (e: StaffModel) => true,
          disabled: (e: StaffModel) => false,
          align: AlignEnum.CENTER,
        },
        {
          columnDef: 'signLevelParallel',
          header: 'signLevelParallel',
          className: 'mat-column-signLevelParallel',
          title: (e: StaffModel) => `${e.signLevelParallel}`,
          cell: (e: StaffModel) => `${e.signLevelParallel}`,
          alignHeader: AlignEnum.CENTER,
          align: AlignEnum.CENTER,
          isShowHeader: false,
          columnType: ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE,
          optionValues: (e: StaffModel) => this.signLevelParallelValues,
          onCellValueChange: (e: StaffModel) => {
            this.handleSignLevelParallelChange(e);
          },
          display: (e: StaffModel) => false,
          disabled: (e: StaffModel) => this.isView,
        },
        {
          columnDef: this.isEdit ? 'staffCode' : 'staffFullName',
          header: 'staffCode',
          className: 'mat-column-staffCode',
          title: (e: StaffModel) => this.getStaffCodeCell(e),
          cell: (e: StaffModel) => this.getStaffCodeCell(e),
          alignHeader: AlignEnum.CENTER,
          isShowHeader: true,
          display: (e: StaffModel) => true,
          columnType: (e: StaffModel) =>
            this.isView || !e?.staffOptions?.length || e.staffOptions.length == 1 ? ColumnTypeEnum.VIEW : ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE,
          optionValues: (e: StaffModel) => {
            return this.getValue(e.staffOptions, []);
          },
          onCellValueChange: (e: StaffModel) => {
            const lstStaff = this.getValue(this.formGroup.get('lstStaff')?.value, []);
            const obsIndex = lstStaff.indexOf(e);
            const staffOption = e.staffOptions?.find((staff) => staff.value === e.staffCode);
            e.staffFullName = staffOption?.rawData.fullName;
            e.staffCode = staffOption?.rawData.code;
            e.userRoleId = null;
            e.signImageId = null;
            /** Người dùng chọn 1 giá trị ở combobox "Người ký" */
            this.getDepartmentAndSignImageOptionFromVO(e, obsIndex).subscribe();
          },
        },
        {
          columnDef: this.isEdit ? 'userRoleId' : 'departmentName',
          header: 'departmentSignId',
          className: 'mat-column-departmentSignId',
          title: (e: StaffModel) => ``,
          cell: (e: StaffModel) => ``,
          alignHeader: AlignEnum.CENTER,
          align: AlignEnum.CENTER,
          isShowHeader: true,
          display: (e: StaffModel) => true,
          columnType: (e: StaffModel) =>
            this.isView || !e?.staffCode ? ColumnTypeEnum.VIEW : ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE,
          optionValues: (e: StaffModel) => {
            return this.getValue(e.departmentSignOptions, []);
          },
          onCellValueChange: (e: StaffModel) => {
            const departmentSignOptions: SelectModel[] = this.getValue(e.departmentSignOptions, []);
            e.departmentSignId = departmentSignOptions.find(
              (item: SelectModel) => item.value == e.userRoleId,
            )?.rawData.orgId;
          },
        },
        {
          columnDef: 'signImage',
          header: 'signImage',
          className: 'mat-column-signImage',
          title: (e: StaffModel) => `${e.signImage}`,
          cell: (e: StaffModel) => `${e.signImage}`,
          alignHeader: AlignEnum.CENTER,
          align: AlignEnum.CENTER,
          isShowHeader: true,
          columnType: ColumnTypeEnum.CHECKBOX,
          display: (e: StaffModel) => true,
          disabled: (e: StaffModel) => this.isView,
          isNotShowHeaderCheckbox: true,
          onCellValueChange: (e: StaffModel) => {
            const options = this.getValue(this.signImageOptionsMap.get(this.getValue(e.staffCode, 0)), []);
            const lstStaff = this.getValue(this.formGroup.get('lstStaff')?.value, []);
            const index = lstStaff.indexOf(e);
            lstStaff[index] = {
              ...e,
              /** [Ảnh ký] Khi tick vào checkbox "Hiện ảnh ký", nếu combobox "Ảnh ký" chỉ có 1 giá trị
               * thì tự động điền vào, nếu có từ 2 giá trị thì để người dùng tự chọn */
              signImageId: e.signImage && options.length === 1 ? options[0].value : null,
            };
            this.formGroup.get('lstStaff')?.setValue(lstStaff);
          },
        },
        {
          columnDef: this.isEdit ? 'signImageId' : 'signImageName',
          header: 'signImageId',
          className: 'mat-column-signImageId',
          title: (e: StaffModel) => ``,
          cell: (e: StaffModel) => ``,
          alignHeader: AlignEnum.CENTER,
          align: AlignEnum.CENTER,
          isShowHeader: true,
          columnType: (e: StaffModel) =>
            this.isView || !e?.signImage ? ColumnTypeEnum.VIEW : ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE,
          display: (e: StaffModel) => true,
          optionValues: (e: StaffModel) => {
            return [...this.getValue(this.signImageOptionsMap.get(this.getValue(e.staffCode, 0)), [])];
          },
          onCellValueChange: (e: StaffModel) => {
            const options = this.getValue(this.signImageOptionsMap.get(this.getValue(e.staffCode, 0)), []);
            e.signImageName = options?.find((staff: SelectModel) => staff.value === e.signImageId)?.displayValue;
          },
        },
        {
          columnDef: 'isPromulgate',
          header: 'isPromulgate',
          className: 'mat-column-isPromulgate',
          title: (e: StaffModel) => `${e.isPromulgate}`,
          cell: (e: StaffModel) => `${e.isPromulgate}`,
          alignHeader: AlignEnum.CENTER,
          align: AlignEnum.CENTER,
          isShowHeader: true,
          columnType: (e: StaffModel) => ColumnTypeEnum.CHECKBOX,
          onCellValueChange: (e: StaffModel) => {
            this.setLastStaffPromulgate();
          },
          display: (e: StaffModel) => true,
          disabled: (e: StaffModel) => true,
          isNotShowHeaderCheckbox: true,
        },
      ],
    );
  }

  initApprovalListButtons() {
    this.approvalListButtons.push(
      ...[
        {
          columnDef: 'detail',
          color: 'warn',
          icon: 'fas fa-arrow-up',
          iconType: IconTypeEnum.FONT_AWESOME,
          click: 'onReorderUp',
          className: 'primary content-cell-align-center',
          title: 'common.title.reorder-up',
          display: (e: any) => !this.isView,
          header: 'common.table.action.title',
          alignHeader: AlignEnum.CENTER,
          disabled: (e: StaffModel) => {
            const values = this.formGroup.get('lstStaff')?.value as StaffModel[];
            return !values?.indexOf(e);
          },
        },
        {
          columnDef: 'edit',
          color: 'warn',
          icon: 'fas fa-arrow-down',
          iconType: IconTypeEnum.FONT_AWESOME,
          click: 'onReorderDown',
          className: 'primary content-cell-align-center',
          title: 'common.title.reorder-down',
          display: (e: any) => !this.isView,
          header: 'common.table.action.title',
          alignHeader: AlignEnum.CENTER,
          disabled: (e: StaffModel) => {
            const values = this.formGroup.get('lstStaff')?.value as StaffModel[];
            return values?.indexOf(e) === values?.length - 1;
          },
        },
        {
          columnDef: 'reject',
          color: 'warn',
          icon: 'fa fa-trash',
          iconType: IconTypeEnum.FONT_AWESOME,
          click: 'onDeleteRow',
          className: 'primary content-cell-align-center',
          title: 'common.title.delete',
          display: (e: any) => !this.isView,
          disabled: (e: StaffModel) => !!e.isRequire,
          header: 'common.table.action.title',
          alignHeader: AlignEnum.CENTER,
        },
      ],
    );
  }

  /** Main entry: build context and route to cases */
  private handleSignLevelParallelChange(e: StaffModel): void {
    const values = this.formGroup.get('lstStaff')?.value as StaffModel[];
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
    const sourceQuantity = values.filter((item) => item.prevSignLevelParallel === prevSignLevelParallel)?.length;

    return {
      values,
      changedIndex,
      prevSignLevelParallel,
      currentSignLevelParallel,
      last: lastItemSignLevelParallel,
      sourceQuantity,
      e,
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
        signLevelParallel: newSignLevelParallel,
      };
    });

    return newValues;
  }
  /** Case 2: move between middle groups (TH2) */
  private computeCaseMoveBetween(ctx: any): StaffModel[] {
    const { values } = ctx;

    return values.map((item: any, index: number) => ({
      ...item,
      signLevelParallel: this.getNewSignLevelForMiddleMove(ctx, item, index),
    }));
  }

  /** Determine new sign level for each item in middle-move TH2 */
  private getNewSignLevelForMiddleMove(ctx: any, item: any, index: number): number {
    const isMoveDown = ctx.currentSignLevelParallel > ctx.prevSignLevelParallel;

    return isMoveDown ? this.handleMoveDownBetween(ctx, item, index) : this.handleMoveUpBetween(ctx, item, index);
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
          signLevelParallel: newSignLevelParallel,
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
        signLevelParallel: newSignLevelParallel,
      };
    });
  }

  /** Extend signLevelParallelValues (add 1 option) - used in TH1 when sourceQuantity >= 2 */
  private extendSignLevelOptions(lastValue: number) {
    this.signLevelParallelValues = [
      ...this.signLevelParallelValues,
      {
        displayValue: `${this.translateService.instant('common.group')} ${lastValue + 1}`,
        value: lastValue + 1,
        rawData: lastValue + 1,
        disabled: false,
      },
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
      this.formGroup.get('lstStaff')?.setValue(sorted, { emitEvent: false });
      this.setLastStaffPromulgate();
    }
  }

  getStaffCodeCell(e: StaffModel) {
    return e?.staffOptions?.length == 0 ? '' : `${this.getValue(e.staffFullName, '')} ${e.staffCode ? `(${e.staffCode})` : ''}`
  }
}
