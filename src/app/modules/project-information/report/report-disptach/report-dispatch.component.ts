import { Component } from '@angular/core';
import {FORM_CONFIG} from "src/app/modules/project-information/report/report-detail/report-detail.config";
import {Config} from "src/app/common/models/config.model";
import {AlignEnum, ColumnModel} from "@c10t/nice-component-library";
import {ReportUtils} from "src/app/modules/project-information/report/report.utils";
import {FormBuilder, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-report-dispatch',
  standalone: false,
  templateUrl: './report-dispatch.component.html',
  styles: ''
})
export class ReportDispatchComponent {
  configForm: Config
  columns: ColumnModel[] = []
  superHeaders: ColumnModel[][] = [];
  formAdvanceSearch: FormGroup
    constructor(protected formBuilder: FormBuilder) {
      this.configForm = FORM_CONFIG;
      this.formAdvanceSearch = formBuilder.group(
        this.configForm.filterForm!.reduce((result: any, item) => {
          result[item.name] = [item.isMultiSelect ? [] : '', item.validate ?? []];
          return result;
        }, {}),
        {
          validators: [ReportUtils.startBeforeEndDateValidator('startDate', 'endDate')],
        },
      );
      this.columns = [
        {
          columnDef: 'stt-none-display',
          header: 'stt',
          title: (e: any) => `${e.index || ''}`,
          cell: (e: any) => `${e.index || ''}`,
          className: 'width-10',
          headerClassName: 'mat-column-none-display',
          align: AlignEnum.CENTER,
          rowSpan: 1,
          colSpan: 1,
        },
        {
          columnDef: 'dispatcherOrganizationName-none-display',
          header: 'dispatcherOrganizationName',
          title: (e: any) => `${e.dispatcherOrganizationName || ''}`,
          cell: (e: any) => `${e.dispatcherOrganizationName || ''}`,
          className: 'mat-column-dispatcherOrganizationName',
          headerClassName: 'mat-column-none-display',
          alignHeader: AlignEnum.CENTER,
          align: AlignEnum.LEFT,
        },
        {
          columnDef: 'driverOrganizationName-none-display',
          header: 'driverOrganizationName',
          title: (e: any) => `${e.driverOrganizationName || ''}`,
          cell: (e: any) => `${e.driverOrganizationName || ''}`,
          className: 'mat-column-driverOrganizationName',
          headerClassName: 'mat-column-none-display',
          alignHeader: AlignEnum.CENTER,
          align: AlignEnum.LEFT,
        },
        // tổng điều vận
        {
          columnDef: 'dispatchTotalByQuantity',
          header: 'dispatchTotalByQuantity',
          title: (e: any) => `${e.dispatchTotalByQuantity || ''}`,
          cell: (e: any) => `${e.dispatchTotalByQuantity || ''}`,
          className: 'mat-column-dispatchTotalByQuantity',
          alignHeader: AlignEnum.CENTER,
          align: AlignEnum.RIGHT,
        },
        {
          columnDef: 'dispatchTotalByKm',
          header: 'dispatchTotalByKm',
          title: (e: any) => `${e.dispatchTotalByKm || ''}`,
          cell: (e: any) => `${e.dispatchTotalByKm || ''}`,
          className: 'mat-column-dispatchTotalByKm',
          alignHeader: AlignEnum.CENTER,
          align: AlignEnum.RIGHT,
        },
        // nội thành
        {
          columnDef: 'dispatchCityCentersByQuantity',
          header: 'dispatchCityCentersByQuantity',
          title: (e: any) => `${e.dispatchCityCentersByQuantity || ''}`,
          cell: (e: any) => `${e.dispatchCityCentersByQuantity || ''}`,
          className: 'mat-column-dispatchCityCentersByQuantity',
          alignHeader: AlignEnum.CENTER,
          align: AlignEnum.RIGHT,
        },
        {
          columnDef: 'dispatchCityCentersByKm',
          header: 'dispatchCityCentersByKm',
          title: (e: any) => `${e.dispatchCityCentersByKm || ''}`,
          cell: (e: any) => `${e.dispatchCityCentersByKm || ''}`,
          className: 'mat-column-dispatchCityCentersByKm',
          alignHeader: AlignEnum.CENTER,
          align: AlignEnum.RIGHT,
        },
        // sân bay
        {
          columnDef: 'dispatchAirportsByQuantity',
          header: 'dispatchAirportsByQuantity',
          title: (e: any) => `${e.dispatchAirportsByQuantity || ''}`,
          cell: (e: any) => `${e.dispatchAirportsByQuantity || ''}`,
          className: 'mat-column-dispatchAirportsByQuantity',
          alignHeader: AlignEnum.CENTER,
          align: AlignEnum.RIGHT,
        },
        {
          columnDef: 'dispatchAirportsByKm',
          header: 'dispatchAirportsByKm',
          title: (e: any) => `${e.dispatchAirportsByKm || ''}`,
          cell: (e: any) => `${e.dispatchAirportsByKm || ''}`,
          className: 'mat-column-dispatchAirportsByKm',
          alignHeader: AlignEnum.CENTER,
          align: AlignEnum.RIGHT,
        },
        // các tỉnh
        {
          columnDef: 'dispatchProvincesByQuantity',
          header: 'dispatchProvincesByQuantity',
          title: (e: any) => `${e.dispatchProvincesByQuantity || ''}`,
          cell: (e: any) => `${e.dispatchProvincesByQuantity || ''}`,
          className: 'mat-column-dispatchProvincesByQuantity',
          alignHeader: AlignEnum.CENTER,
          align: AlignEnum.RIGHT,
        },
        {
          columnDef: 'dispatchProvincesByKm',
          header: 'dispatchProvincesByKm',
          title: (e: any) => `${e.dispatchProvincesByKm || ''}`,
          cell: (e: any) => `${e.dispatchProvincesByKm || ''}`,
          className: 'mat-column-dispatchProvincesByKm',
          alignHeader: AlignEnum.CENTER,
          align: AlignEnum.RIGHT,
        },
      ]
      this.superHeaders = [
        [
          {
            columnDef: 'stt',
            header: 'stt',
            title: (_e: any) => '',
            cell: (_e: any) => '',
            rowSpan: 2,
            colSpan: 1,
            align: AlignEnum.CENTER,
          },
          {
            columnDef: 'dispatcherOrganizationName',
            header: 'dispatcherOrganizationName',
            title: (_e: any) => '',
            cell: (_e: any) => '',
            alignHeader: AlignEnum.CENTER,
            rowSpan: 2,
          },
          {
            columnDef: 'driverOrganizationName',
            header: 'driverOrganizationName',
            title: (_e: any) => '',
            cell: (_e: any) => '',
            alignHeader: AlignEnum.CENTER,
            rowSpan: 2,
          },
          {
            columnDef: 'dispatchTotal',
            header: 'dispatchTotal',
            title: (_e: any) => '',
            cell: (_e: any) => '',
            alignHeader: AlignEnum.CENTER,
            colSpan: 2,
          },
          {
            columnDef: 'CityCenterTotal',
            header: 'CityCenterTotal',
            title: (_e: any) => '',
            cell: (_e: any) => '',
            alignHeader: AlignEnum.CENTER,
            colSpan: 2,
          },
          {
            columnDef: 'AirportsTotal',
            header: 'AirportsTotal',
            title: (_e: any) => '',
            cell: (_e: any) => '',
            alignHeader: AlignEnum.CENTER,
            colSpan: 2,
          },
          {
            columnDef: 'ProvincesTotal',
            header: 'ProvincesTotal',
            title: (_e: any) => '',
            cell: (_e: any) => '',
            alignHeader: AlignEnum.CENTER,
            colSpan: 2,
          },
        ],
      ]
    }
}
