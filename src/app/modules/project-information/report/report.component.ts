import { Component, Injector } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ApiService,
  AuthoritiesService,
  BaseSearchComponent,
  FormStateService,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import { TranslateService } from '@ngx-translate/core';
import { lastValueFrom } from 'rxjs';
import { SelectValuesService } from 'src/app/core/services/selectValues.service';
import { FrequencyEnum } from 'src/app/shared/enums/frequency.enum';
import { EnumUtil } from 'src/app/shared/utils/enum.util';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  standalone: false,
})
export class ReportComponent extends BaseSearchComponent {
  projectTypeValues: SelectModel[] = [];
  organizationValues: SelectModel[] = [];
  projectValues: SelectModel[] = [];
  informationTypeValues: SelectModel[] = [];
  frequencyValues: SelectModel[] = [];
  hasExportPermission = false;
  constructor(
    protected router: Router,
    protected apiService: ApiService,
    protected utilsService: UtilsService,
    protected formStateService: FormStateService,
    protected translateService: TranslateService,
    protected injector: Injector,
    protected activatedRoute: ActivatedRoute,
    protected authoritiesService: AuthoritiesService,
    protected formBuilder: FormBuilder,
    protected selectValuesService: SelectValuesService,
  ) {
    super(
      router,
      apiService,
      utilsService,
      formStateService,
      translateService,
      injector,
      activatedRoute,
      authoritiesService,
      formBuilder.group({}),
    );
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.hasExportPermission =
      this.authoritiesService.hasAuthority('SYSTEM_ADMIN') ||
      this.authoritiesService.hasAuthority(`POST${environment.PATH_API_V1}/project/report/export`);
    this.onGetComboBoxData();
  }

  async onGetComboBoxData() {
    EnumUtil.enum2SelectModel(FrequencyEnum, this.frequencyValues, 'EDIT');
    const getAutocompleteValuesFromModulePath = (
      path: string,
      listParam: { key: string; value: any }[] = [],
      selectedFields?: string,
      getAllOptions?: boolean,
    ) =>
      lastValueFrom(
        this.selectValuesService.getAutocompleteValuesFromModulePath(
          `${environment.PATH_API_V1}${path}`,
          [{ key: 'sortBy', value: 'name' }, { key: 'sortDirection', value: 'asc' }, ...listParam],
          undefined,
          selectedFields,
          true,
          undefined,
          getAllOptions,
        ),
      );
    [this.projectTypeValues, this.organizationValues, this.projectValues, this.informationTypeValues] =
      await Promise.all([
        getAutocompleteValuesFromModulePath('/mdm/project-type'),
        getAutocompleteValuesFromModulePath('/mdm/organization', [{ key: 'orgType', value: 'COMPANY' }]),
        getAutocompleteValuesFromModulePath('/project/project', [], 'id,code,name,projectTypeId', true),
        getAutocompleteValuesFromModulePath('/mdm/information-type', [{ key: 'isPeriodControl', value: true }]),
      ]);
  }
}
