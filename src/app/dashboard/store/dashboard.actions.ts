import type { PanelModel } from '@syncfusion/ej2-angular-layouts';

const dashboardStatePrefix: string = '[dashboard]';

export class GetDashboardData {
  static readonly type = `${dashboardStatePrefix} Get Dashboard Data`;
}

export class SaveDashboard {
  static readonly type = `${dashboardStatePrefix} Save Dashboard`;
  constructor(public payload: PanelModel[]) {}
}

export class SetPanels {
  static readonly type = `${dashboardStatePrefix} Set panels`;
  constructor(public payload: PanelModel[]) {}
}

export class ResetState {
  static readonly type = `${dashboardStatePrefix} Reset state`;
}

export class IsMobile {
  static readonly type = `${dashboardStatePrefix} Is Mobile`;
  constructor(public payload: boolean) {}
}

export class SetFilteredItems {
  static readonly type = `${dashboardStatePrefix} Set Filtered Items`;
  constructor(public payload: any) {}
}
