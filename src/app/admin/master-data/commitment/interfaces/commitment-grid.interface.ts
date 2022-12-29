import { ICellRendererParams } from "@ag-grid-community/core";
import { MasterCommitment } from "@shared/models/commitment.model";

export interface CommitmentGridColumns extends ICellRendererParams {
  edit?: (tier: MasterCommitment) => MasterCommitment;
}