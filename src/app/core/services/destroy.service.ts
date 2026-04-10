import {Injectable, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({providedIn: 'root'})
export class DestroyService extends Subject<void> implements OnDestroy {
  ngOnDestroy() {
    console.log('Destroying...');
    this.next();
    this.complete();
  }
}
