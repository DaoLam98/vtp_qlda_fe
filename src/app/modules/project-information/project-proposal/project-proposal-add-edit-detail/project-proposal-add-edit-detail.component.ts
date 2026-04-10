import { Location } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent,
  DateUtilService,
  FileTypeEnum,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import { TranslateService } from '@ngx-translate/core';
import { catchError, EMPTY, firstValueFrom, forkJoin, lastValueFrom } from 'rxjs';
import { Config } from 'src/app/common/models/config.model';
import { SelectValuesService } from 'src/app/core/services/selectValues.service';
import { VIETNAMESE_REGEX } from 'src/app/shared/constants/regex.constants';
import { FrequencyEnum } from 'src/app/shared/enums/frequency.enum';
import { EnumUtil } from 'src/app/shared/utils/enum.util';
import { PermissionCheckingUtil } from 'src/app/shared/utils/permission-checking.util';
import { Utils } from 'src/app/shared/utils/utils';
import { environment } from 'src/environments/environment';
import { ProjectProposalModel } from '../../models/project-proposal.model';
import { FORM_CONFIG } from '../project-proposal-search/project-proposal-search.config';
import { MatTabGroup } from '@angular/material/tabs';
import { HistoryType } from 'src/app/shared/enums/history-type.enum';
import { SubmissionHistoryDialogComponent } from 'src/app/shared/components/submission-history-dialog/submission-history-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { FileSignModel, LstStaffModel } from 'src/app/shared/models/sign-document.model';

@Component({
  selector: 'app-project-proposal-add-edit-detail',
  templateUrl: './project-proposal-add-edit-detail.component.html',
  styleUrls: ['./project-proposal-add-edit-detail.component.scss'],
  standalone: false,
})
export class ProjectProposalAddEditDetailComponent extends BaseAddEditComponent {
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  configForm: Config;
  model!: ProjectProposalModel;
  protected readonly Utils = Utils;
  protected readonly environment = environment;
  projectTypeValues: SelectModel[] = [];
  organizationValues: SelectModel[] = [];
  locationValues: SelectModel[] = [];
  investmentFormValues: SelectModel[] = [];
  expressionValues: SelectModel[] = [];
  informationTypeValues: SelectModel[] = [];
  frequencyValues: SelectModel[] = [];
  targetValues: SelectModel[] = [];
  assetValues: SelectModel[] = [];
  currencyValues: SelectModel[] = [];
  accountingAccountValues: SelectModel[] = [];
  isShowSignTemplate = false;
  isEmptyInvestmentTabExists = true;
  isEmptyReportTabExists = true;
  isSignRoute = false;
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
    protected dateUtilService: DateUtilService,
    protected selectValuesService: SelectValuesService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
    private matDialog: MatDialog,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);

    this.configForm = FORM_CONFIG;

    this.isSignRoute = history.state.isSign;

    this.addEditForm = this.fb.group(
      {
        // Thông tin chung
        code: [''],
        name: ['', [Validators.required, Validators.maxLength(255), Validators.pattern(VIETNAMESE_REGEX)]],
        proposingOrgId: ['', [Validators.required]],
        proposingOrgName: [''],
        operatingOrgId: ['', [Validators.required]],
        operatingOrgName: [''],
        projectTypeId: ['', [Validators.required]],
        projectTypeCode: [''],
        projectTypeName: [''],
        expectedStartDate: [null, [Validators.required]],
        expectedEndDate: [null, [Validators.required]],
        goal: ['', [Validators.required, Validators.maxLength(255)]],
        scale: ['', [Validators.required, Validators.maxLength(255)]],
        locationId: ['', [Validators.required]],
        locationName: [''],
        address: ['', [Validators.maxLength(255), Validators.pattern(VIETNAMESE_REGEX)]],
        organizations: [[]],
        status: [],
        createdDate: [],
        createdBy: [],
        lastModifiedDate: [],
        lastModifiedBy: [],
        validateActionType: [''],
        projectProposalStatus: [''],
        referenceId: [null],
        referenceName: [null],
        referenceCode: [null],
        referenceDisplay: [null],
        isUpgraded: [null],
        projectId: [null],
        isOnlyVtpApproved: [null],
        reasonUpgrade: [null],
        isValidateFull: [null],
        proposalSyncAction: [null],
        folderSignId: [null],
        folderSignParentId: [null],
        upgraded: [null],
        approvedDate: [null],
        keyGenValue: [null],

        // Thông tin đầu tư
        investorOrgId: ['', [Validators.required]],
        investorOrgName: [''],
        investmentFormId: ['', [Validators.required]],
        investmentFormName: [''],
        investmentCapitalSource: ['', [Validators.maxLength(255)]],
        expressionInvestmentId: ['', [Validators.required]],
        expressionInvestmentName: [''],
        informationTypeInvestmentId: ['', [Validators.required]],
        informationTypeInvestmentName: [''],
        frequencyInvestment: ['', [Validators.required]],
        startDateInvestment: ['', [Validators.required]],
        endDateInvestment: ['', [Validators.required]],
        totalInvestmentCapital: ['', [Validators.required]],
        totalInvestmentCapitalDisplay: ['', [Validators.required]],
        currencyId: ['', [Validators.required]],
        currencyName: [''],
        isApplyInvestment: [null],

        // Báo cáo khả thi
        expressionFeasibilityReportId: ['', [Validators.required]],
        expressionFeasibilityReportName: [''],
        informationTypeFeasibilityReportId: ['', [Validators.required]],
        informationTypeFeasibilityReportName: [''],
        frequencyFeasibilityReport: ['', [Validators.required]],
        startDateFeasibilityReport: ['', [Validators.required]],
        endDateFeasibilityReport: ['', [Validators.required]],
        isApplyFeasibility: [null],

        // Trình ký
        signDocumentDto: [],
      },
      {
        validators: [
          startBeforeEndDateValidator('expectedStartDate', 'expectedEndDate'),
          startBeforeEndDateValidator('startDateInvestment', 'endDateInvestment'),
          startBeforeEndDateValidator('startDateFeasibilityReport', 'endDateFeasibilityReport'),
        ],
      },
    );

    this.addEditForm.markAsDirty({ onlySelf: true });
    this.addEditForm.markAllAsTouched();

    EnumUtil.enum2SelectModel(FrequencyEnum, this.frequencyValues, 'EDIT');
  }

  async ngOnInit() {
    super.ngOnInit();
    await this.onGetComboBoxData();

    if (this.isEdit) {
      await this.onGetDetail();
      if (this.isSignRoute) {
        this.onSwitchSign();
      }
    }

    this.addEditForm.valueChanges.subscribe(() => {
      if (this.addEditForm.invalid || this.addEditForm.value.organizations.length == 0) {
        this.isShowSignTemplate = false;
      }
    });
  }

  async onGetDetail(isPatchValue: boolean = true) {
    this.isLoading = true;
    this.model = await firstValueFrom(
      this.apiService.get<ProjectProposalModel>(
        `${environment.PATH_API_V1}/project/project-proposal/` + this.id,
        new HttpParams(),
      ),
    );
    if (
      this.isEdit &&
      !this.isView &&
      !(
        this.model.projectProposalStatus == 'WAITING' ||
        this.model.projectProposalStatus == 'REJECTED' ||
        this.model.projectProposalStatus == 'REVOKED'
      )
    ) {
      this.router.navigate([`/project/project-proposal/detail`, this.model.id]);
    }
    if (isPatchValue) {
      this.addEditForm.patchValue({
        ...this.model,
        referenceDisplay: `${this.model.referenceCode} - ${this.model.referenceName}`,
        totalInvestmentCapitalDisplay: Utils.formatCurrencyWithComma(this.model.totalInvestmentCapital || 0),
      });
      this.downloadFile();
    }
    this.isLoading = false;
  }

  async onGetComboBoxData() {
    const getAutocompleteValuesFromModulePath = (path: string, selectedFields?: string) =>
      lastValueFrom(
        this.selectValuesService.getAutocompleteValuesFromModulePath(
          `${environment.PATH_API_V1}${path}`,
          [
            { key: 'sortBy', value: 'name' },
            { key: 'sortDirection', value: 'asc' },
          ],
          undefined,
          selectedFields,
          true,
          undefined,
          this.isEdit,
        ),
      );
    [
      this.projectTypeValues,
      this.organizationValues,
      this.locationValues,
      this.investmentFormValues,
      this.expressionValues,
      this.informationTypeValues,
      this.assetValues,
      this.accountingAccountValues,
      this.targetValues,
      this.currencyValues,
    ] = await Promise.all([
      getAutocompleteValuesFromModulePath('/mdm/project-type'),
      getAutocompleteValuesFromModulePath('/mdm/organization'),
      getAutocompleteValuesFromModulePath('/mdm/location'),
      getAutocompleteValuesFromModulePath('/mdm/investment-form'),
      getAutocompleteValuesFromModulePath('/mdm/expression'),
      getAutocompleteValuesFromModulePath('/mdm/information-type'),
      getAutocompleteValuesFromModulePath('/mdm/asset', 'id,code,name,status,assetGroupId'),
      lastValueFrom(
        this.selectValuesService.getAutocompleteValuesFromModulePath(
          `${environment.PATH_API_V1}/mdm/accounting-account`,
          [
            { key: 'sortBy', value: 'accountNumber,name' },
            { key: 'sortDirection', value: 'asc,asc' },
          ],
          undefined,
          'id,name,accountNumber,status',
          true,
          undefined,
          true,
        ),
      ),
      getAutocompleteValuesFromModulePath('/mdm/target'),
      getAutocompleteValuesFromModulePath('/mdm/currency'),
    ]);
  }

  onRedirect(item: ProjectProposalModel) {
    this.router.navigate([`/project/project-proposal/edit`, item.id]).then();
  }
  onSubmit(validateActionType: 'SAVE' | 'SEND_VO' | 'SAVE_AND_NEXT_VO', showConfirm: boolean = true) {
    // Early validation checks
    if (!this.validateOrganizations()) {
      return;
    }

    if (!this.validateSignImages(validateActionType)) {
      return;
    }

    // Prepare and execute API call
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

  private validateOrganizations(): boolean {
    if (this.addEditForm.value.organizations.length == 0) {
      this.utilsService.showError('project.project-proposal.organization.required');
      return false;
    }

    if (this.addEditForm.get('organizations')?.errors?.required) {
      this.utilsService.showError('project.project-proposal.organization.description.required');
      return false;
    }

    if (this.addEditForm.get('organizations')?.errors?.pattern) {
      this.utilsService.showError('project.project-proposal.organization.description.pattern');
      return false;
    }

    return true;
  }

  private validateSignImages(validateActionType: string): boolean {
    if (validateActionType == 'SEND_VO') {
      const lstStaff: LstStaffModel[] = this.addEditForm.value.signDocumentDto?.lstStaff || [];
      if (lstStaff.some(item => item.signImage && !item.signImageId)) {
        this.utilsService.showError('common.signDocument.signImage.required');
        return false;
      }
    }
    return true;
  }

  private prepareFormData(validateActionType: string): FormData {
    const formData = new FormData();
    const payload = new ProjectProposalModel(this.addEditForm);

    formData.append(
      'body',
      this.utilsService.toBlobJon({
        ...payload,
        validateActionType: this.isEdit ? validateActionType : undefined,
        isApplyInvestment: this.model?.isApplyInvestment,
        isApplyFeasibility: this.model?.isApplyFeasibility,
      }),
    );

    this.appendFiles(formData);
    return formData;
  }

  private appendFiles(formData: FormData): void {
    const lstFileSign = this.getValue(this.addEditForm.value.signDocumentDto?.lstFileSign, []);
    const listFileSignOther = this.getValue(this.addEditForm.value.signDocumentDto?.listFileSignOther, []);

    [...lstFileSign, ...listFileSignOther]?.forEach((file: any, index: number) => {
      if (file.binary) {
        formData.append('files', file.binary, file.name);
      }
    });
  }

  private getApiCall(formData: FormData) {
    return this.isEdit
      ? this.apiService.put(`${environment.PATH_API_V1}/project/project-proposal/${this.id}`, formData)
      : this.apiService.post(`${environment.PATH_API_V1}/project/project-proposal`, formData);
  }

  private determineAction(validateActionType: string): string {
    if (validateActionType == 'SEND_VO') {
      return 'sign';
    }
    return this.isEdit ? 'edit' : 'add';
  }

  private createSuccessHandler(validateActionType: string) {
    return (data: ProjectProposalModel, message?: string) => {
      if (this.isEdit) {
        if (validateActionType == 'SAVE_AND_NEXT_VO') {
          this.onGetDetail();
          this.utilsService.onSuccessFunc(message);
          this.onSwitchSign();
        } else {
          this.onSuccessFunc(data, message);
        }
      } else {
        this.utilsService.onSuccessFunc(message);
        this.onRedirect(data);
      }
    };
  }

  onDelete() {
    const apiCall = this.apiService.post(`${environment.PATH_API_V1}/project/project-proposal/${this.id}/reject`, {});
    this.utilsService.execute(
      apiCall,
      this.onSuccessFunc,
      `project.project-proposal.reject.success`,
      'common.title.confirm',
      undefined,
      `project.project-proposal.confirm.reject`,
      undefined,
      undefined,
      'common.button.confirm',
      'common.button.back',
    );
  }

  onInvestmentChange(event: boolean) {
    this.isEmptyInvestmentTabExists = event;
    if (!this.isSignValid) {
      this.isShowSignTemplate = false;
    }
  }

  onReportChange(event: boolean) {
    this.isEmptyReportTabExists = event;
    if (!this.isSignValid) {
      this.isShowSignTemplate = false;
    }
  }

  get isSignValid(): boolean {
    return (
      !this.isEmptyInvestmentTabExists &&
      !this.isEmptyReportTabExists &&
      this.addEditForm.valid &&
      this.addEditForm.value.organizations.length > 0 &&
      !!this.model?.isApplyInvestment &&
      !!this.model?.isApplyFeasibility
    );
  }

  back(): void {
    this.router.navigate([`/project/project-proposal`]).then();
  }

  onSwitchSign() {
    this.isShowSignTemplate = true;
    this.tabGroup.selectedIndex = 3;
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
        tableName: 'project_proposal',
      },
    });
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

  getValue<T, U>(value: T, defaultValue: U) {
    return value !== null && value !== undefined ? value : defaultValue;
  }
}

export function startBeforeEndDateValidator(startDateKey: string, endDateKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const formGroup = group as FormGroup;
    const startDate = formGroup.get(startDateKey)?.value;
    const endDate = formGroup.get(endDateKey)?.value;

    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const endDateControl = formGroup.get(endDateKey);

    if (start > end) {
      endDateControl?.setErrors({ ...(endDateControl.errors || {}), startDateAfterEndDate: true });
      return { startDateAfterEndDate: true };
    } else {
      if (endDateControl?.hasError('startDateAfterEndDate')) {
        const errors = { ...(endDateControl.errors || {}) };
        delete errors.startDateAfterEndDate;
        if (Object.keys(errors).length === 0) {
          endDateControl.setErrors(null);
        } else {
          endDateControl.setErrors(errors);
        }
      }
    }

    return null;
  };
}
