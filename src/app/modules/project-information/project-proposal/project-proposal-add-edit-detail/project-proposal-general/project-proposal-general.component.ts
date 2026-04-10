import { Location } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import {
  ActionTypeEnum,
  AlignEnum,
  AuthoritiesService,
  BaseAddEditComponent,
  ButtonClickEvent,
  ButtonModel,
  ColumnModel,
  ColumnTypeEnum,
  IconTypeEnum,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import { TranslateService } from '@ngx-translate/core';
import { Config } from 'src/app/common/models/config.model';
import { SelectValuesService } from 'src/app/core/services/selectValues.service';
import { PopupChooseOrganizationComponent } from 'src/app/shared/components/organization/organization-popup-choosen/organization-popup-choosen.component';
import { Utils } from 'src/app/shared/utils/utils';
import { environment } from 'src/environments/environment';
import { FORM_CONFIG } from '../../project-proposal-search/project-proposal-search.config';
import { ProjectProposalModel } from '../../../models/project-proposal.model';
import { VIETNAMESE_REGEX } from 'src/app/shared/constants/regex.constants';

@Component({
  selector: 'app-project-proposal-general',
  templateUrl: './project-proposal-general.component.html',
  styleUrl: './project-proposal-general.component.scss',
  standalone: false,
})
export class ProjectProposalGeneralComponent extends BaseAddEditComponent implements OnChanges {
  @Input() model!: ProjectProposalModel;
  @Input() addEditForm!: FormGroup;
  @Input() organizationValues: SelectModel[] = [];
  @Input() projectTypeValues: SelectModel[] = [];
  @Input() locationValues: SelectModel[] = [];
  @Input() isView: boolean = false;
  configForm: Config;
  organizationColumns: ColumnModel[] = [];
  organizationButtons: ButtonModel[] = [];
  proposingOrganizationValuesCopy: SelectModel[] = [];
  operatingOrganizationValuesCopy: SelectModel[] = [];
  projectTypeValuesCopy: SelectModel[] = [];
  locationValuesCopy: SelectModel[] = [];
  protected readonly Utils = Utils;
  protected readonly environment = environment;
  errorMessages: Map<string, () => string> = new Map([
    ['startDateAfterEndDate', () => 'project.project-proposal.error.expectedStartDateAfterExpectedEndDate'],
  ]);
  isUpgradeRouter: boolean = false;

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected location: Location,
    protected translateService: TranslateService,
    protected utilsService: UtilsService,
    protected authoritiesService: AuthoritiesService,
    protected selectValuesService: SelectValuesService,
    protected matDialog: MatDialog,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);
    this.configForm = FORM_CONFIG;
    this.isView = this.activatedRoute.routeConfig?.data?.actionType === ActionTypeEnum._VIEW;
    this.isUpgradeRouter = this.activatedRoute.snapshot.url.some((segment) => segment.path === 'upgrade');

    this.organizationColumns.push(
      {
        columnDef: 'stt',
        header: 'stt',
        title: (e) => {
          const values = this.addEditForm.get('organizations')?.value;
          const index = values.indexOf(e) + 1;
          return index.toString();
        },
        cell: (e) => {
          const values = this.addEditForm.get('organizations')?.value;
          const index = values.indexOf(e) + 1;
          return index.toString();
        },
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'organizationName',
        header: 'name',
        title: (e) => `${e.organizationName}`,
        cell: (e) => `${e.organizationName}`,
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'organizationDescription',
        header: 'description',
        title: (e) => `${e.organizationDescription}`,
        cell: (e) => `${e.organizationDescription}`,
        columnType: this.isView ? ColumnTypeEnum.VIEW : ColumnTypeEnum.INPUT,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
        max: () => 255,
        pattern: VIETNAMESE_REGEX.source,
        isRequired: !this.isView,
      },
    );

    this.organizationButtons.push({
      columnDef: 'detail',
      color: 'primary',
      icon: 'fa fa-trash',
      iconType: IconTypeEnum.FONT_AWESOME,
      click: 'onDeleteValue',
      className: 'primary  content-cell-align-center',
      title: 'common.title.delete',
      display: (e) => !this.isView,
      header: 'common.table.action.title',
      alignHeader: AlignEnum.CENTER,
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.proposingOrganizationValuesCopy = [
      ...this.organizationValues.filter(
        (item) => item.rawData.status == 'APPROVED' || item.value == this.model?.proposingOrgId,
      ),
    ];
    this.operatingOrganizationValuesCopy = [
      ...this.organizationValues.filter(
        (item) => item.rawData.status == 'APPROVED' || item.value == this.model?.operatingOrgId,
      ),
    ];
    this.projectTypeValuesCopy = [
      ...this.projectTypeValues.filter(
        (item) => item.rawData.status == 'APPROVED' || item.value == this.model?.projectTypeId,
      ),
    ];
    this.locationValuesCopy = [
      ...this.locationValues.filter(
        (item) => item.rawData.status == 'APPROVED' || item.value == this.model?.locationId,
      ),
    ];
  }

  ngOnInit(): void {
    this.addEditForm.get('proposingOrgId')?.valueChanges.subscribe((res) => {
      const value = this.organizationValues.find((item) => item.value == res)?.rawData;
      if (value) {
        this.addEditForm.patchValue({
          proposingOrgName: value.name || null,
        });
      }
    });

    this.addEditForm.get('operatingOrgId')?.valueChanges.subscribe((res) => {
      const value = this.organizationValues.find((item) => item.value == res)?.rawData;
      if (value) {
        this.addEditForm.patchValue({
          operatingOrgName: value.name || null,
        });
      }
    });

    this.addEditForm.get('projectTypeId')?.valueChanges.subscribe((res) => {
      const value = this.projectTypeValues.find((item) => item.value == res)?.rawData;
      if (value) {
        this.addEditForm.patchValue({
          projectTypeName: value.name || null,
          projectTypeCode: value.code || null,
        });
      }
    });
    this.addEditForm.get('locationId')?.valueChanges.subscribe((res) => {
      const value = this.locationValues.find((item) => item.value == res)?.rawData;
      if (value) {
        this.addEditForm.patchValue({
          locationName: value.name || null,
        });
      }
    });
  }

  onTableAction(event: ButtonClickEvent) {
    if (event.action == 'onDeleteValue') {
      this.onDeleteValue(event.index!);
    }
  }

  onAddValue() {
    this.matDialog
      .open(PopupChooseOrganizationComponent, {
        disableClose: false,
        width: '1500px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        data: {
          selected: this.addEditForm.get('organizations')?.value,
          trackBy: 'organizationId',
        },
      })
      .afterClosed()
      .subscribe((organizations: any[]) => {
        if (organizations) {
          this.addEditForm.get('organizations')?.patchValue(
            organizations.map((item) => ({
              organizationId: item.id || item.organizationId,
              organizationCode: item.code || item.organizationCode,
              organizationName: item.name || item.organizationName,
              organizationPath: item.path || item.organizationPath,
              organizationPathName: item.pathName || item.organizationPathName,
              organizationDescription: item.organizationDescription || '',
            })),
          );
        }
      });
  }

  onDeleteValue(index: number) {
    const values = this.addEditForm.get('organizations')?.value;
    values.splice(index, 1);
    this.addEditForm.get('organizations')?.setValue(values);
  }
}
