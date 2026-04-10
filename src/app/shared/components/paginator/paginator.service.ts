import {Injectable} from '@angular/core';
import {MatPaginatorIntl} from '@angular/material/paginator';
import {TranslateService} from '@ngx-translate/core';

@Injectable()
export class PaginatorService extends MatPaginatorIntl {
  itemsPerPageLabel = this.translateService.instant('MatPaginator.itemsPerPageLabel');
  nextPageLabel = this.translateService.instant('MatPaginator.nextPageLabel');
  previousPageLabel = this.translateService.instant('MatPaginator.previousPageLabel');

  constructor(private translateService: TranslateService) {
    super();
  }

  getRangeLabel = (page: number, pageSize: number, length: number) => {
    return '';
  };
}
