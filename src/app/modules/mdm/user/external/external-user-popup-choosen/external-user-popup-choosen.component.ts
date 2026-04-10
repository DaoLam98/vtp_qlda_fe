import {Component, Inject, Optional, ViewChild} from '@angular/core';
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ExternalUserComponent} from "src/app/modules/mdm/user/external/external-user.component";

@Component({
  selector: 'app-external-user-popup-choosen',
  standalone: false,
  templateUrl: './external-user-popup-choosen.component.html',
  styleUrl: 'external-user-popup-choosen.component.scss'
})
export class PopupChooseExternalUserComponent {
  @ViewChild('externalUser', { static: true }) externalUser!: ExternalUserComponent;
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

  chooseEmployee() {
    this.externalUser.chooseEmployee();
  }
}
