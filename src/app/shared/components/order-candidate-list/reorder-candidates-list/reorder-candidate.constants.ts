import { CandidatStatus } from '@shared/enums/applicant-status.enum';

export const OPTION_FIELDS = {
  text: 'text',
  value: 'id',
};

export const ReOrderBillRate = [
  {
    text: 'Onboard',
    id: CandidatStatus.OnBoard,
  },
  {
    text: 'Rejected',
    id: CandidatStatus.Rejected,
  },
];

export const ReOrderOfferedBillRate = [
  {
    text: 'Offered Bill Rate',
    id: CandidatStatus.OfferedBR,
  },
  {
    text: 'Rejected',
    id: CandidatStatus.Rejected,
  },
];
