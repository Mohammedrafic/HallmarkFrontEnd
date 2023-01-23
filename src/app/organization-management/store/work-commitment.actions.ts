import { WORK_COMMITMENT_ACTIONS } from '../enums/work-commitment.enum';
import { WorkCommitmentDTO } from '../work-commitment/interfaces';

export namespace WorkCommitment {
  export class GetCommitmentsByPage {
    static readonly type = WORK_COMMITMENT_ACTIONS.GET_COMMITMENTS_BY_PAGE;
    constructor(public pageNumber: number, public pageSize: number) {}
  }

  export class SaveCommitment {
    static readonly type = WORK_COMMITMENT_ACTIONS.SAVE_COMMITMENT;
    constructor(public payload: WorkCommitmentDTO, public isEdit: boolean) {}
  }

  export class DeleteCommitment {
    static readonly type = WORK_COMMITMENT_ACTIONS.DELETE_COMMITMENT;
    constructor(public id: number) {}
  }

  export class UpdatePageAfterSuccessAction {
    static readonly type = WORK_COMMITMENT_ACTIONS.SAVE_COMMITMENT;
  }
}
