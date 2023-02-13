import { ICellRendererParams } from "@ag-grid-community/core";
import { CandidateWorkCommitment } from "../models/candidate-work-commitment.model";

export interface CommitmentGridColumns extends ICellRendererParams {
  today?: Date;
  edit?: (commitment: CandidateWorkCommitment) => CandidateWorkCommitment;
  delete?: (commitment: CandidateWorkCommitment) => CandidateWorkCommitment;
}