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
  constructor(public type: MessageTypes, public messageContent: string) { }
}

export class ShowSideDialog {
  static readonly type = '[app] Set Side Dialog Showing state';
  constructor(public isDialogShown: boolean) { }
}
