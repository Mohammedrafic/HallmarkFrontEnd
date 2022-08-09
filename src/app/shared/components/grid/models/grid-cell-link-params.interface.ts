import { ICellRendererParams } from '@ag-grid-community/core';
import { NavigationExtras } from '@angular/router';

export interface GridCellLinkParams extends ICellRendererParams {
  link: string | null;
  navigationExtras?: NavigationExtras;
}
