import {HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ApiService, SelectModel} from '@c10t/nice-component-library';
import {TranslateService} from '@ngx-translate/core';
import { BehaviorSubject, map, Observable, of, startWith } from 'rxjs';
import {environment} from 'src/environments/environment';

@Injectable({providedIn: 'root'})
export class TargetService {
  constructor(
    protected translateService: TranslateService,
    protected apiService: ApiService,
  ) {
  }
  selectOption: BehaviorSubject<any> = new BehaviorSubject('');
  translate: BehaviorSubject<any> = new BehaviorSubject('');

}
