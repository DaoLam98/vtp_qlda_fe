import {BaseModel} from '@c10t/nice-component-library';

export class UserInfoDto extends BaseModel {
  access_token?: string = '';
  expires_in?: string = '';
  refresh_expires_in?: string = '';
  refresh_token?: string = '';
  token_type?: string = '';
  client_id?: string = '';
  grant_type?: string = '';
  'not-before-policy'?: number | null = null;
  session_state?: number | null = null;
  scope?: string = '';
}
