import {Component, forwardRef, Input} from '@angular/core';
import {SelectModel} from '@c10t/nice-component-library';
import {MatDialog} from '@angular/material/dialog';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from '@angular/forms';
import { PopupChooseLocationComponent } from '../popup-choose-location/popup-choose-location.component';

@Component({
  selector: 'app-location-composite-choosen',
  templateUrl: './location-composite-choosen.component.html',
  styleUrl: './location-composite-choosen.component.scss',
  standalone: false,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CompositeChooseLocationComponent),
      multi: true,
    }
  ]
})
export class CompositeChooseLocationComponent implements ControlValueAccessor {
  @Input() fieldName?: string = 'lastModifiedBy';
  @Input() listLocation?: SelectModel[] = [];
  @Input() multiple?: boolean = false;
  @Input() selected?: SelectModel[];
  @Input() required?: boolean = false;
  @Input() disabled?: boolean = false;
  @Input() bindValue = 'id';

  locationControl = new FormControl();

  constructor(
    public matDialog: MatDialog,
  ) {
    this.locationControl.valueChanges.subscribe(value => {
      this.onChange(value);
    });
  }

  select(): void {
    const dialogRef = this.matDialog
      .open(PopupChooseLocationComponent, {
        disableClose: false,
        width: '1500px',
        maxWidth: '100vw',
        maxHeight: '90vh',
        data: {
          selected: this.listLocation?.filter((x: SelectModel) => x.value == this.locationControl.value)
            .map((x: SelectModel) => {
              return {
                ...x,
                id: x.rawData.id,
                checked: true,
              }
            }),
          trackBy: 'id',
          multiple: this.multiple,
        },
      })
    dialogRef.componentInstance.title = 'location.table.header.btnChooseLocation';
    dialogRef
      .afterClosed()
      .subscribe((selectedLocations: any[]) => {
        if(selectedLocations && selectedLocations.length > 0) {
          this.selected = selectedLocations.map((x: any) => {
            return new SelectModel(x.id, x.name, false, x)
          })
          // Cập nhật giá trị cho locationControl
          this.locationControl.setValue(selectedLocations[0][this.bindValue]);

          // Gọi onChange để thông báo cho formControl cha biết giá trị đã thay đổi
          this.onChange(selectedLocations[0][this.bindValue]);
        }
      });
  }

  writeValue(value: any): void {
    this.locationControl.setValue(value, {emitEvent: false});
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if(isDisabled) {
      this.locationControl.disable();
    } else {
      this.locationControl.enable();
    }
  }

  private onChange: (value: any) => void = () => {
  };

  private onTouched: () => void = () => {
  };
}
