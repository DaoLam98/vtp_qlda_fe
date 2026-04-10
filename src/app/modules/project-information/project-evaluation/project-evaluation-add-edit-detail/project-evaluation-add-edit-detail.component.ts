import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent,
  FileTypeEnum,
  SelectModel,
  UtilsService
} from "@c10t/nice-component-library";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, Validators} from "@angular/forms";
import {Location} from "@angular/common";
import {TranslateService} from "@ngx-translate/core";
import {SelectValuesService} from "src/app/core/services/selectValues.service";
import {MatDialog} from "@angular/material/dialog";
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {VIETNAMESE_REGEX} from "src/app/shared/constants/regex.constants";
import {ActionTypeEnum} from "src/app/shared";
import {catchError, EMPTY, firstValueFrom, forkJoin, lastValueFrom} from "rxjs";
import {environment} from "src/environments/environment";
import {HttpParams} from "@angular/common/http";
import {FORM_CONFIG} from "src/app/modules/mdm/module/module-search/module-search.config";
import {Config} from "src/app/common/models/config.model";
import { MatTabGroup } from '@angular/material/tabs';
import { FileSignModel, LstStaffModel } from 'src/app/shared/models/sign-document.model';
import { HistoryType } from 'src/app/shared/enums/history-type.enum';
import { SubmissionHistoryDialogComponent } from 'src/app/shared/components/submission-history-dialog/submission-history-dialog.component';
import { ProjectEvaluationModel } from '../../models/project-evaluation.model';

@Component({
  selector: 'app-project-evaluation-add-edit-detail',
  templateUrl: './project-evaluation-add-edit-detail.component.html',
  styleUrl: './project-evaluation-add-edit-detail.component.scss',
  standalone: false,
})
export class ProjectEvaluationAddEditDetailComponent extends BaseAddEditComponent implements OnInit{
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  model!: ProjectEvaluationModel;
  assetValues: SelectModel[] = [];
  targetValues: SelectModel[] = [];
  accountingAccountValues: SelectModel[] = [];
  configForm: Config;
  isShowSignTemplate = false;
  isEmptyInvestmentTabExists = true;
  isEmptyImplStatusTabExists = true;
  isEmptyEffectivenessTabExists = true;
  isLoading = false;

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder,
    protected location: Location,
    protected translateService: TranslateService,
    protected apiService: ApiService,
    protected utilsService: UtilsService,
    protected authoritiesService: AuthoritiesService,
    protected router: Router,
    protected selectValuesService: SelectValuesService,
    protected route: ActivatedRoute,
    protected matDialog: MatDialog,
    protected permissionCheckingUtil: PermissionCheckingUtil,
    protected cdr: ChangeDetectorRef,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);
    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.addEditForm = this.fb.group({
      id: [''],
      projectId: [''],
      projectCode: [''],
      projectName: [''],
      reportName: ['', [Validators.pattern(VIETNAMESE_REGEX)]],
      code: [''],
      name: [''],
      description: ['', [Validators.pattern(VIETNAMESE_REGEX)]],
      sapCode: [''],
      projectTypeName: [''],
      proposal: [''],
      proposingOrgName: [''],
      operatingOrgName: [''],
      expectedStartDate: [null],
      expectedEndDate: [null],
      evaluationStartDate: [null],
      evaluationEndDate: [null],
      status: [''],
      scale: [''],
      address: [''],
      goal: [''],
      locationName: [''],
      createdBy: [''],
      createdDate: [null],
      lastModifiedBy: [''],
      lastModifiedDate: [null],
      organizations: [[]],
      projectProposals: [],
      projectEvalStatus: [null],

      // Thông tin đầu tư và khả thi
      investorOrgId: [''],
      investorOrgCode: [''],
      investorOrgName: [''],
      investmentFormId: [''],
      investmentFormCode: [''],
      investmentFormName: [''],
      investmentCapitalSource: [''],
      informationTypeInvestmentId: [''],
      informationTypeInvestmentCode: [''],
      informationTypeInvestmentName: [''],
      totalInvestmentCapital: [],
      expressionInvestmentId: [''],
      expressionInvestmentCode: [''],
      expressionInvestmentName: [''],
      startDateInvestment: [''],
      endDateInvestment: [''],
      frequencyInvestment: [''],
      currencyName: [''],
      currencyId: [''],
      currencyCode: [''],

      // danh gia hieu qua
      effectivenessExpressionId: [''],
      effectivenessExpressionName: [null],
      effectivenessExpressionCode: [null],
      effectivenessStartDate: [null],
      effectivenessEndDate: [null],
      isApplyEffectiveness: [null],

      // tinh hinh thuc hien
      implStatusExpressionId: [''],
      implStatusExpressionName: [null],
      implStatusExpressionCode: [null],
      implStatusStartDate: [null],
      implStatusEndDate: [null],
      projectEvalActionType: [null],
      isApplyImplStatus: [null],

      // trình ký
      signDocumentDto: [],
    });

    this.isView = this.activatedRoute.routeConfig?.data?.actionType === ActionTypeEnum._VIEW;
  }

  async ngOnInit() {
    super.ngOnInit();
    await this.onGetDataValue();
    if (this.isEdit) {
      this.onGetDetail()
    }
  }

  async onGetDetail(isPatchValue: boolean = true) {
    this.isLoading = true;
    this.model = await firstValueFrom(
      this.apiService.get<ProjectEvaluationModel>(
        `${environment.PATH_API_V1}/project/project-evaluation/` + this.id,
        new HttpParams(),
      ),
    );
    if (isPatchValue) {
      this.addEditForm.patchValue(this.model);
      this.downloadFile();
    }
    this.isLoading = false;
  }

  async onGetDataValue() {
    [
      this.assetValues,
      this.accountingAccountValues,
      this.targetValues
    ] = await Promise.all([
      lastValueFrom(
        this.selectValuesService.getAutocompleteValuesFromModulePath(
          `${environment.PATH_API_V1}/mdm/asset`,
          [
            { key: 'sortBy', value: 'name' },
            { key: 'sortDirection', value: 'asc' },
          ],
          undefined,
          undefined,
          true,
          undefined,
          this.isEdit,
        ),
      ),
      lastValueFrom(
        this.selectValuesService.getAutocompleteValuesFromModulePath(
          `${environment.PATH_API_V1}/mdm/accounting-account`,
          [
            { key: 'sortBy', value: 'name' },
            { key: 'sortDirection', value: 'asc' },
          ],
          undefined,
          undefined,
          true,
          undefined,
          this.isEdit,
        ),
      ),
      lastValueFrom(
        this.selectValuesService.getAutocompleteValuesFromModulePath(
          `${environment.PATH_API_V1}/mdm/target`,
          [
            { key: 'sortBy', value: 'name' },
            { key: 'sortDirection', value: 'asc' },
          ],
          undefined,
          undefined,
          true,
          undefined,
          this.isEdit,
        ),
      )
    ])
  }

  onSubmit(validateActionType: 'SAVE' | 'SEND_VO' | 'SAVE_AND_NEXT_VO', showConfirm: boolean = true) {
    if (!this.validateSignImages(validateActionType)) {
      return;
    }

    const formData = this.prepareFormData(validateActionType);
    const apiCall = this.getApiCall(formData);
    const action = this.determineAction(validateActionType);
    const onSuccessFunc = this.createSuccessHandler(validateActionType);

    this.utilsService.execute(
      apiCall,
      onSuccessFunc,
      `common.${action}.success`,
      showConfirm ? 'common.title.confirm' : '',
      undefined,
      `common.confirm.${action}`,
      undefined,
      undefined,
      'common.button.confirm',
      'common.button.back',
    );
  }

  private validateSignImages(validateActionType: string): boolean {
    if (validateActionType !== 'SEND_VO') {
      return true;
    }

    const lstStaff: LstStaffModel[] = this.addEditForm.value.signDocumentDto?.lstStaff || [];
    if (lstStaff.some(item => item.signImage && !item.signImageId)) {
      this.utilsService.showError('common.signDocument.signImage.required');
      return false;
    }

    return true;
  }

  private prepareFormData(validateActionType: string): FormData {
    const formData = new FormData();
    const payload = new ProjectEvaluationModel(this.addEditForm);

    formData.append(
      'body',
      this.utilsService.toBlobJon({
        ...payload,
        projectEvalActionType: this.isEdit ? validateActionType : undefined,
        isApplyEffectiveness: this.model?.isApplyEffectiveness,
        isApplyImplStatus: this.model?.isApplyImplStatus,
      }),
    );

    this.appendSignFiles(formData);
    return formData;
  }

  private appendSignFiles(formData: FormData): void {
    const lstFileSign = this.addEditForm.value.signDocumentDto?.lstFileSign || [];
    const listFileSignOther = this.addEditForm.value.signDocumentDto?.listFileSignOther || [];

    [...lstFileSign, ...listFileSignOther]?.forEach((file: any) => {
      if (file.binary) {
        formData.append('files', file.binary, file.name);
      }
    });
  }

  private getApiCall(formData: FormData) {
    return this.isEdit
      ? this.apiService.put(`${environment.PATH_API_V1}/project/project-evaluation/${this.id}`, formData)
      : this.apiService.post(`${environment.PATH_API_V1}/project/project-evaluation`, formData);
  }

  private determineAction(validateActionType: string): string {
    if (validateActionType === 'SEND_VO') {
      return 'sign';
    }
    return this.isEdit ? 'edit' : 'add';
  }

  private createSuccessHandler(validateActionType: string) {
    return (data: ProjectEvaluationModel, message?: string) => {
      if (this.isEdit) {
        this.handleEditSuccess(validateActionType, data, message);
      } else {
        this.handleAddSuccess(data, message);
      }
    };
  }

  private handleEditSuccess(
    validateActionType: string,
    data: ProjectEvaluationModel,
    message?: string
  ): void {
    if (validateActionType === 'SAVE_AND_NEXT_VO') {
      this.onGetDetail();
      this.utilsService.onSuccessFunc(message);
      this.onSwitchSign();
    } else {
      this.onSuccessFunc(data, message);
    }
  }

  private handleAddSuccess(data: ProjectEvaluationModel, message?: string): void {
    this.utilsService.onSuccessFunc(message);
    this.onRedirect(data);
  }

  onRedirect(item: ProjectEvaluationModel) {
    this.router.navigate([`/project/project-evaluation/edit`, item.id]).then();
  }

  onDelete() {
    const apiCall = this.apiService.post(`${environment.PATH_API_V1}/project/project-evaluation/${this.id}/reject`, {});
    this.utilsService.execute(
      apiCall,
      this.onSuccessFunc,
      `project.project-evaluation.reject.success`,
      'common.title.confirm',
      undefined,
      `project.project-evaluation.confirm.reject`,
      undefined,
      undefined,
      'common.button.confirm',
      'common.button.back',
    );
  }

  onSwitchSign() {
    this.isShowSignTemplate = true;
    this.tabGroup.selectedIndex = 4;
  }

  onInvestmentChange(event: boolean) {
    this.isEmptyInvestmentTabExists = event;
    if (!this.isSignValid) {
      this.isShowSignTemplate = false;
    }
  }

  onImplStatusChange(event: boolean) {
    this.isEmptyImplStatusTabExists = event;
    if (!this.isSignValid) {
      this.isShowSignTemplate = false;
    }
  }

  onEffectivenessChange(event: boolean) {
    this.isEmptyEffectivenessTabExists = event;
    if (!this.isSignValid) {
      this.isShowSignTemplate = false;
    }
  }

  get isSignValid(): boolean {
    return (
      !this.isEmptyInvestmentTabExists &&
      !this.isEmptyImplStatusTabExists &&
      !this.isEmptyEffectivenessTabExists &&
      this.addEditForm.valid &&
      !!this.model?.isApplyEffectiveness &&
      !!this.model?.isApplyImplStatus
    );
  }

  downloadFile() {
    const lstFileSign = (this.addEditForm.value.signDocumentDto?.lstFileSign || []) as FileSignModel[];
    const listFileSignOther = (this.addEditForm.value.signDocumentDto?.listFileSignOther || []) as FileSignModel[];
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
          const file = new File([blob], fileInfo.name!, { type: FileTypeEnum.PDF });

          return {
            name: fileInfo.name,
            id: fileInfo.id,
            previewValue: null,
            type: FileTypeEnum.PDF,
            binary: file,
            filePath: fileInfo.filePathVss,
          };
        });

        const signDocumentDtoValue = this.addEditForm.value.signDocumentDto;
        this.addEditForm.get('signDocumentDto')?.patchValue({ ...signDocumentDtoValue, lstFileSign: files });
      });
    }

    if (filesAppendixObs?.length) {
      forkJoin(filesAppendixObs).subscribe((blobs) => {
        const files = blobs.map((blob, index) => {
          const fileInfo = listFileSignOther[index];
          const file = new File([blob], fileInfo.name!, { type: FileTypeEnum.PDF });

          return {
            name: fileInfo.name,
            id: fileInfo.id,
            previewValue: null,
            type: FileTypeEnum.PDF,
            binary: file,
            filePath: fileInfo.filePathVss,
          };
        });
        const signDocumentDtoValue = this.addEditForm.value.signDocumentDto;
        this.addEditForm.get('signDocumentDto')?.patchValue({ ...signDocumentDtoValue, listFileSignOther: files });
      });
    }
  }

  onOpenDialog() {
    this.matDialog.open(SubmissionHistoryDialogComponent, {
      width: '80vw',
      height: '85vh',
      maxWidth: '80vw',
      maxHeight: '100vh',
      data: {
        crrId: this.id,
        type: HistoryType.VOFFICE_HISTORY,
        tableName: 'project_eval',
      },
    });
  }

  back(): void {
    this.router.navigate(['/project/project-evaluation']);
  }
}
