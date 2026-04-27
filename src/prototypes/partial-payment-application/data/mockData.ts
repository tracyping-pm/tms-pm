// Mock data for Partial Payment Application prototype.
// Mirrors HR enums (PaymentStatusShowEnum / PayeeTypeEnum / PaymentDefinitionEnum / CountryEnum)
// from /Volumes/data/workspace/hr_frontend/src/enums/index.ts

export type CountryCode = 'PH' | 'TH' | 'Group';
export type CompanyEntity =
  | 'INTELUCK'
  | 'PRA_JIAD'
  | 'MONGKHON'
  | 'THAILAND'
  | 'HOLDING'
  | 'PTE'
  | 'SHENZEHN'
  | 'CHENGDU'
  | 'VIETNAM'
  | 'MALAYSIA';

export type Currency = 'USD' | 'PHP' | 'THB' | 'SGD' | 'CNY';

export type ApplicationStatus =
  | 'Draft'
  | 'Synced'
  | 'Paid'
  | 'Rejected'
  | 'Cancelled';

export type HrPaymentStatus =
  | 'Pending Approval'
  | 'Pending Review'
  | 'Pending FA Approval'
  | 'Pending Release'
  | 'Released'
  | 'Closed'
  | 'Withdrawn'
  | 'Released Error'
  | 'Rejected'
  | null;

export type WaybillPrepayStatus =
  | 'Pending Sync'
  | 'Pending HR'
  | 'Effective'
  | 'Released'
  | null;

export interface Vendor {
  id: string;
  name: string;
  country: CountryCode;
  defaultEntity: CompanyEntity;
  defaultCurrency: Currency;
}

export interface Waybill {
  id: string;
  waybillNo: string;
  vendorId: string;
  status: 'Planning' | 'Pending' | 'In Transit' | 'Delivered' | 'Cancelled';
  basicAmount: number;
  handlingFee: number;
  currency: Currency;
  origin: string;
  destination: string;
  prepayStatus: WaybillPrepayStatus;
  paidInAdvance: number;
  applicationNo?: string;
}

export interface PartialPaymentItem {
  applicationNo: string;
  waybillNo: string;
  basicAmountSnapshot: number;
  allocatedAmount: number;
  transferredFrom?: string;
}

export interface PartialPaymentApplication {
  applicationNo: string;
  vendorId: string;
  vendorName: string;
  countryCode: CountryCode;
  companyEntity: CompanyEntity;
  currency: Currency;
  allocationMode: 'TotalAmount' | 'Percentage';
  prepaidAmount: number;
  prepaidRatio?: number;
  taxInclusive: boolean;
  vatRate: number; // percent (e.g. 7 = 7%)
  whtRate: number;
  netAmount: number;
  vatAmount: number;
  whtAmount: number;
  totalPayable: number;
  documents: { id: number; name: string }[];
  status: ApplicationStatus;
  hrPaymentNumber?: string;
  hrPaymentStatus: HrPaymentStatus;
  hrLastSyncedAt?: string;
  createdAt: string;
  createdBy: string;
  submittedAt?: string;
  paidAt?: string;
  items: PartialPaymentItem[];
}

// HR tax rate options — mirrored from src/utils/payments.ts:48-168
export const TAX_OPTIONS_BY_ENTITY: Record<
  CompanyEntity,
  { vat: number[]; wht: number[] }
> = {
  INTELUCK:   { vat: [0, 12], wht: [0, 1, 2, 5, 10, 12, 15, 25] },
  PRA_JIAD:   { vat: [0, 12], wht: [0, 1, 2, 5, 10, 12, 15, 25] },
  MONGKHON:   { vat: [0, 12], wht: [0, 1, 2, 5, 10, 12, 15, 25] },
  THAILAND:   { vat: [0, 7],  wht: [0, 1, 2, 3, 5] },
  HOLDING:    { vat: [0],     wht: [0] },
  PTE:        { vat: [0, 9],  wht: [0, 10, 15, 17] },
  SHENZEHN:   { vat: [0, 1, 3, 6, 9, 10, 13], wht: [0, 3, 10, 20, 25, 30, 35, 45] },
  CHENGDU:    { vat: [0, 1, 3, 6, 9, 13],     wht: [0, 3, 10, 20, 25, 30, 35, 45] },
  VIETNAM:    { vat: [0, 5, 10], wht: [0, 5, 10] },
  MALAYSIA:   { vat: [0, 5, 6, 10], wht: [0, 10, 15] },
};

export const ENTITY_LABEL: Record<CompanyEntity, string> = {
  INTELUCK: 'Inteluck Corporation (PH)',
  PRA_JIAD: 'Pra Jiad Logistics Corporation (PH)',
  MONGKHON: 'Mongkhon Logistics Corporation (PH)',
  THAILAND: 'Inteluck (Thailand) Co., Ltd',
  HOLDING:  'Inteluck Holding Inc',
  PTE:      'Inteluck Pte Ltd. (SG)',
  SHENZEHN: 'Shenzhen Yunmang Data Technology Co., Ltd',
  CHENGDU:  'Chengdu Tuling Zhiyun Technology Co., Ltd',
  VIETNAM:  'Inteluck Vietnam Co. Ltd',
  MALAYSIA: 'Inteluck Malaysia Sdn. Bhd.',
};

export const COUNTRY_ENTITIES: Record<CountryCode, CompanyEntity[]> = {
  PH: ['INTELUCK', 'PRA_JIAD', 'MONGKHON'],
  TH: ['THAILAND'],
  Group: ['HOLDING', 'PTE', 'SHENZEHN', 'CHENGDU', 'VIETNAM', 'MALAYSIA'],
};

// ----- Seed data -----

export const VENDORS: Vendor[] = [
  { id: 'V001', name: 'Bangkok Express Logistics', country: 'TH', defaultEntity: 'THAILAND', defaultCurrency: 'THB' },
  { id: 'V002', name: 'Manila Freight Co.',         country: 'PH', defaultEntity: 'INTELUCK', defaultCurrency: 'PHP' },
  { id: 'V003', name: 'Cebu Trans Lines',           country: 'PH', defaultEntity: 'PRA_JIAD', defaultCurrency: 'PHP' },
  { id: 'V004', name: 'Chiang Mai Carriers',        country: 'TH', defaultEntity: 'THAILAND', defaultCurrency: 'THB' },
];

export const WAYBILLS: Waybill[] = [
  // V001 - Bangkok Express
  { id: 'W001', waybillNo: 'WB-TH-26041501', vendorId: 'V001', status: 'In Transit', basicAmount: 12000, handlingFee: 800, currency: 'THB', origin: 'Bangkok', destination: 'Chonburi', prepayStatus: 'Effective', paidInAdvance: 6000, applicationNo: 'PPA-TH-20260420-001' },
  { id: 'W002', waybillNo: 'WB-TH-26041502', vendorId: 'V001', status: 'Pending', basicAmount: 9500,  handlingFee: 600, currency: 'THB', origin: 'Bangkok', destination: 'Rayong',   prepayStatus: 'Effective', paidInAdvance: 4750, applicationNo: 'PPA-TH-20260420-001' },
  { id: 'W003', waybillNo: 'WB-TH-26041503', vendorId: 'V001', status: 'Pending', basicAmount: 8500,  handlingFee: 500, currency: 'THB', origin: 'Bangkok', destination: 'Pattaya',  prepayStatus: 'Pending HR', paidInAdvance: 4250, applicationNo: 'PPA-TH-20260425-002' },
  { id: 'W004', waybillNo: 'WB-TH-26042001', vendorId: 'V001', status: 'Planning', basicAmount: 14000, handlingFee: 900, currency: 'THB', origin: 'Bangkok', destination: 'Phuket',   prepayStatus: null, paidInAdvance: 0 },
  { id: 'W005', waybillNo: 'WB-TH-26042002', vendorId: 'V001', status: 'Planning', basicAmount: 10500, handlingFee: 700, currency: 'THB', origin: 'Bangkok', destination: 'Krabi',    prepayStatus: null, paidInAdvance: 0 },
  { id: 'W006', waybillNo: 'WB-TH-26042003', vendorId: 'V001', status: 'Planning', basicAmount: 7800,  handlingFee: 500, currency: 'THB', origin: 'Bangkok', destination: 'Hat Yai',  prepayStatus: null, paidInAdvance: 0 },
  // V002 - Manila Freight
  { id: 'W101', waybillNo: 'WB-PH-26041801', vendorId: 'V002', status: 'In Transit', basicAmount: 18000, handlingFee: 1000, currency: 'PHP', origin: 'Manila', destination: 'Cebu',   prepayStatus: 'Pending HR', paidInAdvance: 9000, applicationNo: 'PPA-PH-20260422-001' },
  { id: 'W102', waybillNo: 'WB-PH-26041802', vendorId: 'V002', status: 'Pending', basicAmount: 22000, handlingFee: 1200, currency: 'PHP', origin: 'Manila', destination: 'Davao',  prepayStatus: 'Pending HR', paidInAdvance: 11000, applicationNo: 'PPA-PH-20260422-001' },
  { id: 'W103', waybillNo: 'WB-PH-26042001', vendorId: 'V002', status: 'Planning',   basicAmount: 15500, handlingFee: 800,  currency: 'PHP', origin: 'Manila', destination: 'Iloilo', prepayStatus: null, paidInAdvance: 0 },
];

export const APPLICATIONS: PartialPaymentApplication[] = [
  {
    applicationNo: 'PPA-TH-20260420-001',
    vendorId: 'V001',
    vendorName: 'Bangkok Express Logistics',
    countryCode: 'TH',
    companyEntity: 'THAILAND',
    currency: 'THB',
    allocationMode: 'Percentage',
    prepaidAmount: 10750,
    prepaidRatio: 50,
    taxInclusive: false,
    vatRate: 7,
    whtRate: 1,
    netAmount: 10750,
    vatAmount: 752.5,
    whtAmount: 107.5,
    totalPayable: 11395,
    documents: [{ id: 9001, name: 'Vendor_Request_Letter.pdf' }],
    status: 'Paid',
    hrPaymentNumber: 'PAY-202604-00875',
    hrPaymentStatus: 'Released',
    hrLastSyncedAt: '2026-04-21 14:32',
    createdAt: '2026-04-20 09:15',
    createdBy: 'Suchart W.',
    submittedAt: '2026-04-20 10:02',
    paidAt: '2026-04-21 14:30',
    items: [
      { applicationNo: 'PPA-TH-20260420-001', waybillNo: 'WB-TH-26041501', basicAmountSnapshot: 12000, allocatedAmount: 6000 },
      { applicationNo: 'PPA-TH-20260420-001', waybillNo: 'WB-TH-26041502', basicAmountSnapshot: 9500,  allocatedAmount: 4750 },
    ],
  },
  {
    applicationNo: 'PPA-TH-20260425-002',
    vendorId: 'V001',
    vendorName: 'Bangkok Express Logistics',
    countryCode: 'TH',
    companyEntity: 'THAILAND',
    currency: 'THB',
    allocationMode: 'TotalAmount',
    prepaidAmount: 4250,
    taxInclusive: false,
    vatRate: 7,
    whtRate: 1,
    netAmount: 4250,
    vatAmount: 297.5,
    whtAmount: 42.5,
    totalPayable: 4505,
    documents: [{ id: 9002, name: 'Proof_2026-04-25.pdf' }],
    status: 'Synced',
    hrPaymentNumber: 'PAY-202604-00921',
    hrPaymentStatus: 'Pending FA Approval',
    hrLastSyncedAt: '2026-04-26 11:00',
    createdAt: '2026-04-25 16:20',
    createdBy: 'Suchart W.',
    submittedAt: '2026-04-25 16:48',
    items: [
      { applicationNo: 'PPA-TH-20260425-002', waybillNo: 'WB-TH-26041503', basicAmountSnapshot: 8500, allocatedAmount: 4250 },
    ],
  },
  {
    applicationNo: 'PPA-PH-20260422-001',
    vendorId: 'V002',
    vendorName: 'Manila Freight Co.',
    countryCode: 'PH',
    companyEntity: 'INTELUCK',
    currency: 'PHP',
    allocationMode: 'Percentage',
    prepaidAmount: 20000,
    prepaidRatio: 50,
    taxInclusive: false,
    vatRate: 12,
    whtRate: 2,
    netAmount: 20000,
    vatAmount: 2400,
    whtAmount: 400,
    totalPayable: 22000,
    documents: [{ id: 9003, name: 'PH_Vendor_Letter.pdf' }],
    status: 'Synced',
    hrPaymentNumber: 'PAY-202604-00903',
    hrPaymentStatus: 'Pending Release',
    hrLastSyncedAt: '2026-04-26 09:18',
    createdAt: '2026-04-22 13:45',
    createdBy: 'Maria R.',
    submittedAt: '2026-04-22 14:10',
    items: [
      { applicationNo: 'PPA-PH-20260422-001', waybillNo: 'WB-PH-26041801', basicAmountSnapshot: 18000, allocatedAmount: 9000 },
      { applicationNo: 'PPA-PH-20260422-001', waybillNo: 'WB-PH-26041802', basicAmountSnapshot: 22000, allocatedAmount: 11000 },
    ],
  },
  {
    applicationNo: 'PPA-PH-20260418-003',
    vendorId: 'V003',
    vendorName: 'Cebu Trans Lines',
    countryCode: 'PH',
    companyEntity: 'PRA_JIAD',
    currency: 'PHP',
    allocationMode: 'TotalAmount',
    prepaidAmount: 8000,
    taxInclusive: false,
    vatRate: 12,
    whtRate: 2,
    netAmount: 8000,
    vatAmount: 960,
    whtAmount: 160,
    totalPayable: 8800,
    documents: [],
    status: 'Rejected',
    hrPaymentNumber: 'PAY-202604-00832',
    hrPaymentStatus: 'Rejected',
    hrLastSyncedAt: '2026-04-19 10:24',
    createdAt: '2026-04-18 11:20',
    createdBy: 'Maria R.',
    submittedAt: '2026-04-18 11:50',
    items: [],
  },
];
