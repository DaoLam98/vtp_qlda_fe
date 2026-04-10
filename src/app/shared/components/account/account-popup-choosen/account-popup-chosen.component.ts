import {Component, Input, Optional, ViewChild} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {PermissionCheckingUtil} from 'src/app/shared/utils/permission-checking.util';
import { AccountTreeComponent } from 'src/app/shared/components/account/account-tree/account-tree.component';

@Component({
  selector: 'app-account-popup-chosen',
  templateUrl: './account-popup-chosen.component.html',
  styleUrl: './account-popup-chosen.component.scss',
  standalone: false
})
export class PopupChooseAccountComponent {
  @Input() title: string = 'employee.table.header.btnChooseOrganization';
  @ViewChild('accountTree', {static: true}) accountTree!: AccountTreeComponent;

  constructor(
    protected permissionCheckingUtil: PermissionCheckingUtil,
    @Optional() public matDialogRef: MatDialogRef<any>
  ) {
  }

  chooseAccount() {
    this.accountTree.chooseAccount();
  }
}
