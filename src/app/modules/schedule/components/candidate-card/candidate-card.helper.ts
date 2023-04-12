import { formatDate } from '@angular/common';

import { LtaAssignment, ScheduleCandidate } from '../../interface';

export const CreateTooltipForOrientation = (candidate: ScheduleCandidate, startDate: string): string => {
  const candidateOrientation = isCandidateOriented(startDate, candidate.orientationDate);

  if(candidate.orientationDate && candidateOrientation) {
    return '';
  } else if(candidate.orientationDate && !candidateOrientation) {
    return `Oriented from ${formatDate(candidate.orientationDate, 'MM/dd/yyyy', 'en-US')}`;
  }

  return 'Not Oriented';
};

export const isCandidateOriented = (startDate: string , orientationDate: string | null) => {
  if(orientationDate) {
    const startDateWithoutTime = startDate.split('T');
    const orientationDateWithoutTime = orientationDate?.split('T');

    return new Date(startDateWithoutTime[0]) > new Date(orientationDateWithoutTime[0]);
  }

  return false;
};

export const GetCandidateTypeTooltip = (
  ltaAssignment: LtaAssignment | null,
  filterStartDate: string,
  filterEndDate: string
): string => {
  if (
    !ltaAssignment
    || !isOrderDateMatchedWithFilter(ltaAssignment.startDate, ltaAssignment.endDate, filterStartDate, filterEndDate)
  ) {
    return '';
  }

  const { startDate, endDate, region, location, department } = ltaAssignment;
  const formattedStartDate = formatDate(startDate, 'MM/dd/yyyy', 'en-US');
  const formattedEndDate = formatDate(endDate, 'MM/dd/yyyy', 'en-US');

  return `${region} - ${location} - ${department}, ${formattedStartDate} - ${formattedEndDate}`;
};

const isOrderDateMatchedWithFilter = (
  orderStartDate: string,
  orderEndDate: string,
  filterStartDate: string,
  filterEndDate: string
): boolean => {
  const orderStartDateMs = getDateTime(orderStartDate);
  const orderEndDateMs = getDateTime(orderEndDate);
  const filterStartDateMs = getDateTime(filterStartDate);
  const filterEndDateMs = getDateTime(filterEndDate);

  return (orderStartDateMs >= filterStartDateMs && orderEndDateMs <= filterEndDateMs)
    || (orderEndDateMs >= filterStartDateMs && orderStartDateMs <= filterStartDateMs)
    || (orderStartDateMs <= filterEndDateMs && orderEndDateMs >= filterEndDateMs);
};

const getDateTime = (date: string): number => {
  return new Date(date).setHours(0, 0, 0);
};

export const PrepareCandidate = (candidate: ScheduleCandidate): ScheduleCandidate => {
  const updatedCandidate = {
    ...candidate,
    skill: CreateSkillText(candidate.skill),
  };

  if(candidate.workCommitments) {
    updatedCandidate.workCommitment = CreateWorkCommitmentText(candidate.workCommitments);
    updatedCandidate.workCommitmentText = CreateWorkCommitments(candidate.workCommitments);
  }

  return updatedCandidate;
};

export const CreateSkillText = (skill: string): string => {
  const skillText = skill.trim();

  if(skillText.length > 18) {
    return `${skillText.slice(0,18)}...`;
  }

  return skillText;
};

export const CreateWorkCommitments = (workCommitments: string[]): string => {
  if (workCommitments.length) {
    return  'Work Commitment: ' + workCommitments.join(', ');
  }

  return 'Work Commitment';
};

export const CreateWorkCommitmentText = (commitments: string[]) => {
  const updateWorkCommitments = commitments.join(', ').trim();

  if(updateWorkCommitments.length > 37) {
    return `${updateWorkCommitments.slice(0,37)}...`;
  }

  return updateWorkCommitments;
};
