import { RowNode } from "@ag-grid-community/core";
import { BulkTypeAction } from "@shared/enums/bulk-type-action.enum";

export interface BulkActionConfig {
  approve?: boolean;
  edit?: boolean;
  delete?: boolean;
  export?: boolean;
  activate?: boolean;
}

export interface BulkActionDataModel {
  type: BulkTypeAction,
  items: RowNode[],
}
