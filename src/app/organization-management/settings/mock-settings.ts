import { OrganizationSettingsGet } from '@shared/models/organization-settings.model';

export const MockSettings: OrganizationSettingsGet[] = [
  {
    settingKey: "InternalAgencyApplies",
    name: "Internal Agency Applies",
    controlType: 1,
    value: "true",
    valueOptions: [],
    organizationId: 1,
    overridableByOrganization: true,
    overridableByRegion: true,
    overridableByLocation: true,
    overridableByDepartment: true,
    orderPosition: 1,
    validations: [],
    children: [
      {
        settingKey: "InternalAgencyApplies",
        value: "false",
        organizationId: 2,
        regionId: 3,
        regionName: "Region 1"
      },
      {
        settingKey: "InternalAgencyApplies",
        value: "false",
        organizationId: 2,
        regionId: 3,
        regionName: "Region 1",
        locationId: 5,
        locationName: "wer wer"
      },
      {
        settingKey: "InternalAgencyApplies",
        value: "false",
        organizationId: 2,
        regionId: 3,
        regionName: "Region 1",
        locationId: 5,
        locationName: "wer wer",
        departmentId: 18,
        departmentName: "Department 1"
      }
    ]
  },
  {
    settingKey: "BillingContactEmails",
    name: "Billing contact E-mail recipients",
    controlType: 2,
    value: "test@mail",
    valueOptions: [],
    organizationId: 2,
    overridableByOrganization: true,
    overridableByRegion: true,
    overridableByLocation: true,
    overridableByDepartment: true,
    orderPosition: 2,
    children: [],
    validations: [
      { key: 5, value: null }
    ]
  },
  {
    settingKey: "NetPaymentTerms",
    name: "Net Payment Terms",
    controlType: 2,
    value: "40",
    organizationId: 2,
    overridableByOrganization: true,
    overridableByRegion: true,
    overridableByLocation: true,
    overridableByDepartment: true,
    orderPosition: 12,
    children: [],
    validations: [
      {
        key: 1,
        value: null
      },
      {
        key: 2,
        value: "10"
      },
      {
        key: 4,
        value: null
      }
    ],
    valueOptions: []
  },
  {
    settingKey: "EnableLTAConcept",
    name: "Enable LTA Concept",
    controlType: 3,
    value: "INT",
    valueOptions: [
      { key: "Manual", value: "MAN" },
      { key: "Interfaces", value: "INT" }
    ],
    organizationId: 2,
    overridableByOrganization: true,
    overridableByRegion: true,
    overridableByLocation: true,
    overridableByDepartment: true,
    orderPosition: 3,
    validations: [],
    children: []
  },
  {
    settingKey: "EnableInvoiceInterface",
    name: "Enable Invoice Interface",
    controlType: 5,
    value: "2022-05-14T21:00:00.000Z",
    valueOptions: [],
    organizationId: 2,
    overridableByOrganization: true,
    overridableByRegion: false,
    overridableByLocation: false,
    overridableByDepartment: false,
    orderPosition: 5,
    validations: [],
    children: []
  },
  {
    settingKey: "OrderLockAndUnlock",
    name: "Order lock and unlock",
    controlType: 1,
    value: "false",
    valueOptions: [],
    organizationId: 2,
    overridableByOrganization: false,
    overridableByRegion: true,
    overridableByLocation: true,
    overridableByDepartment: true,
    orderPosition: 6,
    validations: [],
    children: []
  },
  {
    settingKey: "JobDistributionOptions",
    name: "Job Distribution Options",
    controlType: 4,
    value: "SAG;FCS;FCO",
    valueOptions: [
      {
        key: "SAG",
        value: "Selective Agency"
      },
      {
        key: "FCA",
        value: "First Choice and All agencies"
      },
      {
        key: "FCS",
        value: "First Choice and Selective Agencies"
      },
      {
        key: "FCO",
        value: "FC Only"
      }
    ],
    organizationId: 2,
    overridableByOrganization: true,
    overridableByRegion: true,
    overridableByLocation: true,
    overridableByDepartment: true,
    orderPosition: 11,
    children: [],
    validations: [],
  }
]
