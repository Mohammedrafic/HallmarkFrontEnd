export class ToggleMobileView {
  static readonly type = '[app] Toggle mobile view layout';
  constructor(public payload: boolean) { }
}

export class ToggleTheme {
  static readonly type = '[app] Toggle dark-light theme';
  constructor(public payload: boolean) { }
}

export class SetSidebarMenu {
  static readonly type = '[app] Set side bar menu content';
  constructor(public payload: any) { }
}