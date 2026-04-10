import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatPaginatorIntl, PageEvent} from '@angular/material/paginator';
import {PaginatorService} from './paginator.service';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  standalone: false,
  providers: [{
    provide: MatPaginatorIntl,
    useClass: PaginatorService
  }],
})
export class PaginatorComponent {
  @Input() pageSizeOptions = [5, 10, 20, 30, 50, 100];
  @Input() pageSize = 10;
  @Input() length = 100;
  @Input() pageIndex = 0;
  @Output() page = new EventEmitter<PageEvent>();
  errorMessages: Map<string, (e?: any) => string> = new Map([
    ['max', () => ''],
    ['min', () => ''],
  ]);
  pageIndexFormControl = new FormControl(1);

  get totalPages() {
    return Math.ceil(this.length / this.pageSize);
  }

  pageChange(event: PageEvent) {
    this.pageIndexFormControl.patchValue(event.pageIndex + 1);
    this.pageSize = event.pageSize;
    this.page.emit(event);
  }

  pageIndexChange() {
    const value = this.pageIndexFormControl.value || 1;
    if(value > this.totalPages) {
      this.pageIndex = this.totalPages - 1;
    } else if(value < 1) {
      this.pageIndex = 0;
    } else {
      this.pageIndex = value - 1;
    }
    this.pageIndexFormControl.patchValue(this.pageIndex + 1);
    this.page.emit({
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      length: this.length,
    });
  }
}
