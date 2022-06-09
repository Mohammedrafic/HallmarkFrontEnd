// TODO: remove this file data after BE implementation
import { OrderManagementPage } from '@shared/models/order-management.model';

export let data: OrderManagementPage = {
  hasNextPage: false,
  hasPreviousPage: false,
  pageNumber: 1,
  totalCount: 0,
  totalPages: 0,
  items: [
    {
      id: 1, statusText: 'open', jobTitle: 'TH\/CNACTP', skillName: 'Certified Nursing Assistant',
      openPositions: 2, locationName: 'Thone - Johnson Memorial Hospital', departmentName: 'Emergency Department',
      orderType: 0, billRate: 10.00, candidates: 4, startDate: '2022-06-02T21:12:40.075981+00:00',departmentId: 1, locationId: 1,organizationId: 1,regionId: 1, regionName:'test',skillId: 1, status: 2
    },
    {
      id: 2, statusText: 'incomplete', jobTitle: 'TH\/CNACTP', skillName: 'Certified Nursing Assistant',
      openPositions: 2, locationName: 'Thone - Johnson Memorial Hospital', departmentName: 'Emergency Department',
      orderType: 0, billRate: 10.00, candidates: 4, startDate: '03/03/2022', departmentId: 1, locationId: 1,organizationId: 1,regionId: 1, regionName:'test',skillId: 1, status: 2
    },
    {
      id: 3, statusText: 'in progress', jobTitle: 'TH\/CNACTP', skillName: 'Certified Nursing Assistant',
      openPositions: 2, locationName: 'Thone - Johnson Memorial Hospital', departmentName: 'Emergency Department',
      orderType: 0, billRate: 10.00, candidates: 4, startDate: '03/03/2022', departmentId: 1, locationId: 1,organizationId: 1,regionId: 1, regionName:'test',skillId: 1, status: 2
    },
    {
      id: 4, statusText: 'pending', jobTitle: 'TH\/CNACTP', skillName: 'Certified Nursing Assistant',
      openPositions: 2, locationName: 'Thone - Johnson Memorial Hospital', departmentName: 'Emergency Department',
      orderType: 0,billRate: 10.00, candidates: 4, startDate: '03/03/2022', departmentId: 1, locationId: 1,organizationId: 1,regionId: 1, regionName:'test',skillId: 1, status: 2
    },
    {
      id: 5, statusText: 'accepted', jobTitle: 'TH\/CNACTP', skillName: 'Certified Nursing Assistant',
      openPositions: 2, locationName: 'Thone - Johnson Memorial Hospital', departmentName: 'Emergency Department',
      orderType: 0, billRate: 10.00, candidates: 4, startDate: '03/03/2022', departmentId: 1, locationId: 1,organizationId: 1,regionId: 1, regionName:'test',skillId: 1, status: 2
    }
  ]
}
