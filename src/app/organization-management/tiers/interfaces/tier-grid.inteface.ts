import { ICellRendererParams } from '@ag-grid-community/core';
import { TierDetails } from '@shared/components/tiers-dialog/interfaces';

export interface TierFilters {
  pageNumber: number;
  pageSize: number;
}

export interface TierPriorityDTO {
  organizationTierId: number;
  priority: number;
  orderBy: string | null;
  pageNumber: number;
  pageSize: number;
}

export interface TierGridColumns extends ICellRendererParams {
 edit?: (tier: TierDetails) => TierDetails;
}
