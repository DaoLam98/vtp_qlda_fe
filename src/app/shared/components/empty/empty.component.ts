import {Component, Input} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {SharedModule} from 'src/app/shared';

@Component({
  selector: 'app-empty',
  standalone: true,
  templateUrl: './empty.component.html',
  imports: [SharedModule, TranslateModule],
})
export class EmptyComponent {
  @Input() data: any[] | null | undefined;
  @Input() notFoundIcon: string = 'fas fa-list-alt';
  @Input() defaultEmptyMessage: string = 'common.no-data';

  get isEmpty(): boolean {
    return !this.data || this.data.length === 0;
  }
}
