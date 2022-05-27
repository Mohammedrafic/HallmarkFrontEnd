import { PanelModel } from "@syncfusion/ej2-angular-layouts";

export class GetDashboardPanels {
  static readonly type = '[dashboard] Get Dashboard Panel';
}

export class AddDashboardPanel {
  static readonly type = '[dashboard] Add Dashboard Panel';
  constructor(public payload: PanelModel[]) {}
}

export class DashboardPanelIsMoved {
  static readonly type = '[dashboard] Dashboard Panel Is Moved';
  constructor(public payload: PanelModel[]) {}
}

export class SaveDashboard {
  static readonly type = '[dashboard] Save Dashboard';
}
