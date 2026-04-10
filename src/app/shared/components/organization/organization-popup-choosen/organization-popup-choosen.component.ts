import {Component, Optional, ViewChild} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {
  OrganizationTreeComponent
} from "src/app/shared/components/organization/organization-tree/organization-tree.component";
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";

@Component({
  selector: 'app-organization-popup-choosen',
  templateUrl: './organization-popup-choosen.component.html',
  styleUrl: './organization-popup-choosen.component.scss',
  standalone: false
})
export class PopupChooseOrganizationComponent {
  @ViewChild('organizationTree', {static: true}) organizationTree!: OrganizationTreeComponent;

  constructor(
    protected permissionCheckingUtil: PermissionCheckingUtil,
    @Optional() public matDialogRef: MatDialogRef<any>
  ) {
  }

  chooseOrganization() {
    this.organizationTree.chooseOrganization();
  }
}
