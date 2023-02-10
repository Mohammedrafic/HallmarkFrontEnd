export type PreservedFilters = {
  organizations?: number[],
  regions: number[],
  locations: number[],
  contactEmails?: string | null,
};

export type PreservedFiltersGlobal = {
  regions: string[],
  locations: string[]
};
