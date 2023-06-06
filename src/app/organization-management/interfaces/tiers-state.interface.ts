import { TiersPage } from '@shared/components/tiers-dialog/interfaces';
import { MasterCommitmentsPage } from '@shared/models/commitment.model';

export interface TiersStateModel {
  tiersByPage: TiersPage | null;
  commitmentsPage: MasterCommitmentsPage | null;
  isCommitmentLoading: boolean;
}
