import {Injectable} from '@angular/core';
import {AuthoritiesService} from '@c10t/nice-component-library';
import {environment} from 'src/environments/environment';

@Injectable({providedIn: 'root'})
export class PermissionCheckingUtil {

  constructor(protected authoritiesService: AuthoritiesService) {
  }

  hasAddPermission(module: string, screenName: string): boolean {
    return this.isSystemAdmin() || this.authoritiesService.hasAuthority(
      `POST${environment.PATH_API_V1}/${module}/${screenName}`);
  }

  hasViewDetailPermission(module: string, screenName: string): boolean {
    return this.isSystemAdmin() || this.authoritiesService.hasAuthority(
      `GET${environment.PATH_API_V1}/${module}/${screenName}/{id}`);
  }

  hasViewEditPermission(module: string, screenName: string): boolean {
    return this.isSystemAdmin() || this.authoritiesService.hasAuthority(
      `PUT${environment.PATH_API_V1}/${module}/${screenName}/{id}`);
  }

  hasViewApprovePermission(module: string, screenName: string): boolean {
    return this.isSystemAdmin() || this.authoritiesService.hasAuthority(
      `POST${environment.PATH_API_V1}/${module}/${screenName}/{sIds}/approve`);
  }

  hasViewRejectPermission(module: string, screenName: string): boolean {
    return this.isSystemAdmin() || this.authoritiesService.hasAuthority(
      `POST${environment.PATH_API_V1}/${module}/${screenName}/{sIds}/reject`);
  }

  isSystemAdmin(): boolean {
    return this.authoritiesService.hasAuthority('SYSTEM_ADMIN')
  }

  hasSaveDraftPermission(module: string, screenName: string): boolean {
    return this.isSystemAdmin() || this.authoritiesService.hasAuthority(
      `POST${environment.PATH_API_V1}/${module}/${screenName}/{userTask}/save-draft`);
  }

  hasCompleteTaskPermission(module: string, screenName: string): boolean {
    return this.isSystemAdmin() || this.authoritiesService.hasAuthority(
      `POST${environment.PATH_API_V1}/${module}/${screenName}/{userTask}/complete-task`)
  }

  hasStartPermission(module: string, screenName: string): boolean {
    return this.isSystemAdmin() || this.authoritiesService.hasAuthority(
      `POST${environment.PATH_API_V1}/${module}/${screenName}/{processId}/start`);
  }

  hasCheckBudgetPermission(module: string, screenName: string): boolean {
    return this.isSystemAdmin() || this.authoritiesService.hasAuthority(
      `POST${environment.PATH_API_V1}/${module}/${screenName}/sap/budget-check`);
  }

  hasExportExcelPermission(module: string, screenName: string): boolean {
    return this.isSystemAdmin() || this.authoritiesService.hasAuthority(
      `POST${environment.PATH_API_V1}/${module}/${screenName}/export-excel/{template-code}`);
  }

  hasAssigneeUserTaskPermission(module: string, screenName: string): boolean {
    return this.isSystemAdmin() || this.authoritiesService.hasAuthority(
      `POST${environment.PATH_API_V1}/${module}/${screenName}/{id}/assignee/{task-definition-key}`);
  }

  hasRetryServiceTaskPermission(module: string, screenName: string): boolean {
    return this.isSystemAdmin() || this.authoritiesService.hasAuthority(
      `POST${environment.PATH_API_V1}/${module}/${screenName}/service-task-failed/{jobId}/retry`);
  }

  isCreatedPlanUser(createdBy: string | null | undefined): boolean {
    const crrUser = this.authoritiesService.me?.userAuthentication?.principal?.username;
    return crrUser === createdBy;
  }

  isHasDownloadFolderPermission(module: string, screenName: string): boolean {
    return this.isSystemAdmin() || this.authoritiesService.hasAuthority(
      `POST${environment.PATH_API_V1}/${module}/${screenName}/download/{id}`);
  }
}
