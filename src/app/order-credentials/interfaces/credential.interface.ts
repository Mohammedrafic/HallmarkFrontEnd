import { CheckBox } from '@order-credentials/enums';

export type CredentialCheckboxState =  Record<string | number | symbol, CheckboxState>;

export type CheckboxState = Record<CheckBox, boolean>
