import { CandidateJobStatus } from "@shared/enums/order-management";
import { valuesOnly } from "@shared/utils/enum.utils";

export const OPTION_FIELDS = {
  text: 'text',
  value: 'id',
};

export const JOB_STATUS = Object.values(CandidateJobStatus)
  .filter(valuesOnly)
  .map((text, id) => ({ text, id: id }));
