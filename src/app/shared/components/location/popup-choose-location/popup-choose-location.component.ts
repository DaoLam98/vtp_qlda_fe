import {Component, Inject, Optional, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import { LocationTreeComponent } from '../location-tree/location-tree.component';

@Component({
  selector: 'app-popup-choose-location',
  standalone: false,
  templateUrl: './popup-choose-location.component.html',
  styleUrl: 'popup-choose-location.component.scss'
})
export class PopupChooseLocationComponent {
  @ViewChild('locationTree', { static: true }) locationTree!: LocationTreeComponent;
  title: string = '';

  constructor(
    protected permissionCheckingUtil: PermissionCheckingUtil,
    @Optional() public matDialogRef: MatDialogRef<any>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if(data) {
      this.title = data.title;
    }
  }

  chooseLocation() {
    this.locationTree.chooseLocation();
  }
}
