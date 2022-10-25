export const getCandidatePositionId = (organizationPrefix: string, publicId: number, positionId: number): string => {
  if (organizationPrefix) {
    return `${organizationPrefix}-${publicId}-${positionId}`;
  } else {
    return `${publicId}-${positionId}`;
  }
};

export const getOrderPublicId = (organizationPrefix: string, publicId: number): string => {
  return `${organizationPrefix}-${publicId}`;
};
