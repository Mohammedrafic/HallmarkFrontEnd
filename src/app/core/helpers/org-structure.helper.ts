export const getIRPOrgItems = 
  <T>(items: T[]): 
    T[] => (items as []).filter(item => item['includeInIRP']);
