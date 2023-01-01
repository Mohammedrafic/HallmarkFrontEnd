import { WorkCommitmentsPage } from '../work-commitment/interfaces/work-commitment-grid.interface';

export interface WorkCommitmentStateModel {
  commitmentsByPage: WorkCommitmentsPage | null;
}
