import { IsOrganizationAgencyAreaStateModel } from '@shared/models/is-organization-agency-area-state.model';
import { MessageTypes } from '../shared/enums/message-types';
import { HeaderState } from '../shared/models/header-state.model';

export class ToggleMobileView {
  static readonly type = '[app] Toggle mobile view layout';
  constructor(public payload: boolean) { }
}

export class ToggleTheme {
  static readonly type = '[app] Toggle dark-light theme';
  constructor(public payload: boolean) { }
}

export class SetHeaderState {
  static readonly type = '[app] Set application header state';
  constructor(public payload: HeaderState) { }
}

export class ToggleSidebarState {
  static readonly type = '[app] Set side bar dock state';
  constructor(public payload: any) { }
}

export class SetIsFirstLoadState {
  static readonly type = '[app] Set isFirstLoad parameter state';
  constructor(public payload: any) { }
}

export class ShowToast {
  static readonly type = '[app] Set Toast Showing state';
  constructor(
    public type: MessageTypes,
    public messageContent: string,
    public isQuickOrder?: boolean,
    public organizationPrefix?: string,
    public publicId?: number,
  ) { }
}

export class ShowSideDialog {
  static readonly type = '[app] Set Side Dialog Showing state';
  constructor(public isDialogShown: boolean) { }
}

export class ShowFilterDialog {
  static readonly type = '[app] Set Filter Dialog Showing state';
  constructor(public isDialogShown: boolean) { }
}

export class ShowExportDialog {
  static readonly type = '[app] Set Export Dialog Showing state';
  constructor(public isDialogShown: boolean) { }
}

export class ShowCloseOrderDialog {
  static readonly type = '[app] Set Close Order Dialog Showing state';
  constructor(public isDialogShown: boolean, public isPosition: boolean = false) { }
}


export class SetIsOrganizationAgencyArea {
  static readonly type = '[app] Set Is Organization/Agency Area';
  constructor(public payload: IsOrganizationAgencyAreaStateModel) { }
}

export class ShowEmailSideDialog {
  static readonly type = '[app] Set Email Side Dialog Showing state';
  constructor(public isDialogShown: boolean) { }
}

export class ShowSmsSideDialog {
  static readonly type = '[app] Set Sms Side Dialog Showing state';
  constructor(public isDialogShown: boolean) { }
}

export class ShowOnScreenSideDialog {
  static readonly type = '[app] Set OnScreen Side Dialog Showing state';
  constructor(public isDialogShown: boolean) { }
}

export class GetAlertsForCurrentUser {
  static readonly type = '[app] Get Alerts For Current User';
  constructor(public pageNumber: number, public pageSize: number) { }
}

export class GetAlertsCountForCurrentUser {
  static readonly type = '[app] Get Alerts Count For Current User';
  constructor(public payload: any) { }
}

export class CheckScreen {
  static readonly type = '[app] Check screen';
  constructor() { }
}

export class ShouldDisableUserDropDown {
  static readonly type = '[app] Disable user dropdown';
  constructor(public payload: boolean) { }
}
export class ShowGroupEmailSideDialog {
  static readonly type = '[app] Set Email Side Dialog Showing state';
  constructor(public isDialogShown: boolean) { }
}

export class ShowDocPreviewSideDialog {
  static readonly type = '[app] Set Email Side Dialog Showing state';
  constructor(public isDocPreviewDialogShown: boolean) { }
}

export class ShowCustomSideDialog {
  static readonly type = '[app] Set Email Side Dialog Showing state';
  constructor(public isCustomDialogShown: boolean) { }
}

export class SetIrpFlag {
  static readonly type = '[app] Set Irp flag';
  constructor(public readonly irpEnabled: boolean) {}
}

export class GetDeviceScreenResolution {
  static readonly type = '[app] Get Device Screen Resolution'
}
export class ShowCustomExportDialog {
  static readonly type = '[app] Set Custom Export Dialog Showing state';
  constructor(public isDialogShown: boolean) { }
}
