import { FieldType } from '@core/enums';
import { CredentialType } from '@shared/models/credential-type.model';
import { CredentialFilterDataSources } from '@shared/models/credential.model';

export interface Option {
  text: string;
  value: string | number;
}

export interface CredentialDTO {
  name: string;
  credentialTypeId: number;
  expireDateApplicable: boolean;
  comment: string;
  irpComment?: string;
  includeInIRP?: boolean;
  includeInVMS?: boolean;
  system?: string;
  id?: number;
  isPublic: boolean;
}

export interface CredentialInputConfig {
  field: string;
  title: string;
  disabled: boolean;
  required: boolean;
  type: FieldType;
  show?: boolean;
  dataSource?: Option[] | CredentialType[];
}

export interface CredentialListConfig {
  title: string;
  required: boolean;
  class: string;
  fields: CredentialInputConfig[];
}

export interface CredentialsListState {
  credentialDataSources: CredentialFilterDataSources | null
}

export interface SelectedSystemsFlag {
  isIRP: boolean;
  isVMS: boolean;
}
