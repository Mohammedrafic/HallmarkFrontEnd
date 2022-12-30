import { MasterCommitment } from "@shared/models/commitment.model";

export class GetCommitmentByPage {
  static readonly type = '[master commitment] Get Commitment by Page';
  constructor(public pageNumber: number, public pageSize: number) { }
}

export class SaveCommitment {
  static readonly type = '[master commitment] Save Commitment';
  constructor(public payload: MasterCommitment){}
}

export class RemoveCommitment {
  static readonly type = '[master commitment] Remove Commitment';
  constructor(public id: number){}
}

export class SaveCommitmentError {
  static readonly type = '[master commitment] Save Commitment Error';
}

export class SaveCommitmentSuccess {
  static readonly type = '[master commitment] Save Commitment Success';
}

export class UpdateCommitmentSuccess {
    static readonly type = '[master commitment] Update Commitment Success';
  }
