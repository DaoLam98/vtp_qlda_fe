import {Component, Injector} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {
  ApiService,
  AuthoritiesService,
  BaseSearchComponent,
  FormStateService,
  UtilsService,
} from '@c10t/nice-component-library';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent extends BaseSearchComponent {
  isEdit: boolean = true;
  isDefault: boolean = true;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected apiService: ApiService,
    protected utilsService: UtilsService,
    protected uiStateService: FormStateService,
    protected translateService: TranslateService,
    protected injector: Injector,
    protected activatedRoute: ActivatedRoute,
    protected authoritiesService: AuthoritiesService,
  ) {
    super(
      router,
      apiService,
      utilsService,
      uiStateService,
      translateService,
      injector,
      activatedRoute,
      authoritiesService,
      formBuilder.group({
        bpmnJs: ['']
      }),
    );
  }

  onSubmit() {
    console.log(this.searchForm.get('bpmnJs')?.value);
  }
}
