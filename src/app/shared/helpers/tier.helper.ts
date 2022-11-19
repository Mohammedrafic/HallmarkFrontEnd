export const createDepartmentsTier = (
  organizationId: number,
  regionIds?: number[],
  locationIds?: number[],
  departmentIds?: number[]) => {
  return {
    organizationId: organizationId ?? null,
    regionIds: regionIds ?? [],
    locationIds: locationIds ?? [],
    departmentIds: departmentIds ?? [],
  }
}
