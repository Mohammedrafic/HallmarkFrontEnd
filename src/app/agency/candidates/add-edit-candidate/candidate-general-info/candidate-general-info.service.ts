import { Injectable } from '@angular/core';

import { CandidateStatus, CreatedCandidateStatus } from "@shared/enums/status";
import { valuesOnly } from "@shared/utils/enum.utils";

@Injectable()
export class CandidateGeneralInfoService {

  public getStatuses(isCandidateCreated: boolean | null): { text: string, id: number }[] {
    return Object.values(isCandidateCreated ? CreatedCandidateStatus : CandidateStatus)
      .filter(valuesOnly)
      .map((text, id) => ({ text, id }))
      .sort((a, b) => a.text.localeCompare(b.text));
  }
}
