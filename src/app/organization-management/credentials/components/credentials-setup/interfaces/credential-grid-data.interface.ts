import { CredentialCheckBox } from '../enums/credentials-checkboxes.enum';

export type CheckboxNames = 'isActive' | 'reqSubmission' | 'reqOnboard';

export type CredentialCheckboxState =  Record<string | number | symbol, CheckboxState>;

export type CheckboxState = Record<CredentialCheckBox, boolean>
