import {HttpParams} from '@angular/common/http';
import {AfterViewInit, Component, ElementRef, forwardRef, Injector, Input, OnInit, ViewChild} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, NgControl} from '@angular/forms';
import {MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {MatDialog} from '@angular/material/dialog';
import {ApiService, SelectModel} from '@c10t/nice-component-library';
import {debounceTime, distinctUntilChanged, map, of, switchMap} from 'rxjs';
import {OrganizationModel} from 'src/app/modules/mdm/_models/organization.model';
import {environment} from 'src/environments/environment';
import {
  PopupChooseUserComponent
} from 'src/app/shared/components/internal-user/popup-choose-user/popup-choose-user.component';
import {EmployeeModel} from '../internal-user/internal-user.model';
import {
  PopupChooseOrganizationComponent
} from '../organization/organization-popup-choosen/organization-popup-choosen.component';

@Component({
  selector: 'app-autocomplete-dialog-field',
  standalone: false,
  templateUrl: './autocomplete-dialog-field.component.html',
  styleUrl: './autocomplete-dialog-field.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteDialogFieldComponent),
      multi: true,
    },
  ],
})
export class AutocompleteDialogFieldComponent implements ControlValueAccessor, OnInit, AfterViewInit {
  @Input() type: 'internal-user' | 'organization' = 'organization';
  @Input() placeholder: string = '';
  @Input() label: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @ViewChild('input') input!: ElementRef<HTMLInputElement>;
  @ViewChild('trigger') autocompleteTrigger!: MatAutocompleteTrigger;
  searchFormControl = new FormControl('');
  selectedFormControl = new FormControl();
  filteredOptions: SelectModel[] = [];
  ngControl!: NgControl;

  constructor(private apiService: ApiService, private matDialog: MatDialog, private injector: Injector) {
  }

  onChange = (value: number) => {
  };

  ngOnInit(): void {
    if(this.disabled) this.selectedFormControl.disable();
    this.selectedFormControl.valueChanges.subscribe((res: SelectModel) => this.onChange(res?.value));
    this.searchFormControl.valueChanges
      .pipe(
        distinctUntilChanged(),
        debounceTime(500),
        switchMap((value) => {
          if(value && value?.length > 0) {
            const params = new HttpParams().set('keyword', `%${value}%`);
            return this.apiService
              .get(`${environment.PATH_API_V1}/mdm/${this.type}?pageNumber=1&pageSize=10`, params, environment.BASE_URL)
              .pipe(map((res: any) => res.content));
          }
          return of([]);
        }),
      )
      .subscribe((res) => {
        switch(this.type) {
          case 'internal-user': {
            const data = res as EmployeeModel[];
            this.filteredOptions = data.map(
              (item) => new SelectModel(item.id, `${item.fullName} (${item.code})`, false, item),
            );
            break;
          }
          case 'organization': {
            const data = res as OrganizationModel[];
            this.filteredOptions = data.map((item) => new SelectModel(item.id, item.name || "", false, item));
            break;
          }
          default:
            break;
        }
      });
  }

  ngAfterViewInit() {
    this.ngControl = this.injector.get(NgControl);
  }

  onOpenPopup(event: Event) {
    this.matDialog
      .open((this.type == 'internal-user' ? PopupChooseUserComponent : PopupChooseOrganizationComponent) as any, {
        disableClose: false,
        width: '1000px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        data: true,
      })
      .afterClosed()
      .subscribe((res) => {
        if(res) this.setFormValue(res);
      });
    event.stopPropagation();
    this.autocompleteTrigger.closePanel();
  }

  displayFn(selected: SelectModel) {
    return selected ? selected.displayValue : '';
  }

  filter() {
    const filterValue = this.input.nativeElement.value.toLowerCase();
    if(filterValue.length == 0) this.filteredOptions = [];

    this.searchFormControl.setValue(filterValue);
  }

  writeValue(value: number): void {
    if(value)
      this.apiService
        .get(`${environment.PATH_API_V1}/mdm/${this.type}/${value}`, new HttpParams(), environment.BASE_URL)
        .subscribe((res) => this.setFormValue(res));
    else {
      this.selectedFormControl.setValue(null);
      this.searchFormControl.setValue(null);
    }
  }

  setFormValue(value: any) {
    switch(this.type) {
      case 'internal-user': {
        const item = value as EmployeeModel;
        this.selectedFormControl.setValue(new SelectModel(item.id, `${item.fullName} (${item.code})`, false, item));
        this.searchFormControl.setValue(`${item.fullName} (${item.code})`);
        break;
      }
      case 'organization': {
        const item = value as OrganizationModel;
        this.selectedFormControl.setValue(new SelectModel(item.id, item.name || "", false, item));
        this.searchFormControl.setValue(item.name);
        break;
      }
      default:
        break;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onChange = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
