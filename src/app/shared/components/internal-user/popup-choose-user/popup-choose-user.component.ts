import {Component, Inject, Optional, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {UserTreeComponent} from "src/app/shared/components/internal-user/user-tree/user-tree.component";
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";

@Component({
  selector: 'app-popup-choose-user',
  standalone: false,
  templateUrl: './popup-choose-user.component.html',
  styleUrl: 'popup-choose-user.component.scss'
})
export class PopupChooseUserComponent {
  @ViewChild('userTree', { static: true }) userTree!: UserTreeComponent;
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
    this.userTree.chooseEmployee();
  }
}
