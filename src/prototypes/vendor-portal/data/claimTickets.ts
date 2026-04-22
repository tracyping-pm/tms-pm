/**
 * Claim Ticket mock data — VP 视角
 *
 * 参考：src/docs/prds/S38 Claim Ticket.md
 *
 * 编号规则：国别 + CT + YYMMDD + 4 流水 + 2 随机码
 * VP 视角仅展示与该供应商（Coca-Cola Bottlers PH Inc.）相关的 ticket。
 */

export type ClaimStatus =
  | 'Ongoing Validation'
  | 'Claim team review'
  | 'Pending Vendor Confirm'
  | 'Vendor Disputed'
  | 'For Deduction'
  | 'Completed'
  | 'Canceled';

export type DeductionState = 'Deducted' | 'For Deduction' | 'Not Linked AP' | 'Written Off';

export interface ClaimTicket {
  ticketNo: string;
  claimTypeL1: 'Internal' | 'External';
  claimTypeL2: string;
  claimAmount: number;
  currency: 'PHP';
  claimant: string;
  responsibleParty: string;
  isWaybillBased: boolean;
  relatedWaybill?: string;
  claimDetails?: string;
  deductionForVendor: DeductionState;
  status: ClaimStatus;
  creationTime: string;
  creator: string;
  linkedSettlementApNo?: string;
  linkedStatementNo?: string;
  resolutionNote?: string;
}

export const CLAIM_TICKETS: ClaimTicket[] = [
  {
    ticketNo: 'PHCT26041501AB',
    claimTypeL1: 'External',
    claimTypeL2: 'Delivery Claims / Damaged Goods',
    claimAmount: 3200,
    currency: 'PHP',
    claimant: 'Coca-Cola Bottlers PH Inc.',
    responsibleParty: 'Vendor',
    isWaybillBased: true,
    relatedWaybill: 'WB2604002',
    claimDetails: '客户签收时反馈外包装破损 3 箱，按单箱 1067 PHP 赔付。已附现场照片。',
    deductionForVendor: 'For Deduction',
    status: 'Pending Vendor Confirm',
    creationTime: '2026-04-15 14:22',
    creator: 'TMS Claim Team',
  },
  {
    ticketNo: 'PHCT26041002CD',
    claimTypeL1: 'External',
    claimTypeL2: 'KPI Claims / Late Delivery',
    claimAmount: 1500,
    currency: 'PHP',
    claimant: 'Coca-Cola Bottlers PH Inc.',
    responsibleParty: 'Vendor',
    isWaybillBased: true,
    relatedWaybill: 'WB2604004',
    claimDetails: 'Delivery SLA 超时 6 小时，按合同条款扣款。',
    deductionForVendor: 'Deducted',
    status: 'Completed',
    creationTime: '2026-04-10 09:15',
    creator: 'TMS Claim Team',
    linkedSettlementApNo: 'ApS260416002',
    resolutionNote: 'Vendor 已确认，纳入对账单扣款。',
  },
  {
    ticketNo: 'PHCT26040803EF',
    claimTypeL1: 'Internal',
    claimTypeL2: 'Fuel Advance Recovery',
    claimAmount: 5000,
    currency: 'PHP',
    claimant: 'Inteluck Corporation',
    responsibleParty: 'Vendor',
    isWaybillBased: false,
    claimDetails: '3 月预付油卡额度超出实际用量，需回收 5000 PHP。',
    deductionForVendor: 'For Deduction',
    status: 'Pending Vendor Confirm',
    creationTime: '2026-04-08 16:40',
    creator: 'Inteluck Finance',
  },
  {
    ticketNo: 'PHCT26040704GH',
    claimTypeL1: 'External',
    claimTypeL2: 'Delivery Claims / Shortage',
    claimAmount: 2800,
    currency: 'PHP',
    claimant: 'Coca-Cola Bottlers PH Inc.',
    responsibleParty: 'Vendor',
    isWaybillBased: true,
    relatedWaybill: 'WB2604003',
    claimDetails: '客户清点发现短少 2 箱，Vendor 表示装车前已按单核对。',
    deductionForVendor: 'For Deduction',
    status: 'Vendor Disputed',
    creationTime: '2026-04-07 11:05',
    creator: 'TMS Claim Team',
    resolutionNote: 'Vendor 提交争议：装车签收单已盖章确认数量无误。',
  },
  {
    ticketNo: 'PHCT26040605IJ',
    claimTypeL1: 'External',
    claimTypeL2: 'Vehicle Damage',
    claimAmount: 8500,
    currency: 'PHP',
    claimant: 'Coca-Cola Bottlers PH Inc.',
    responsibleParty: 'Vendor',
    isWaybillBased: false,
    claimDetails: '仓库月台碰撞，Vendor 承担修复费用。',
    deductionForVendor: 'Not Linked AP',
    status: 'Claim team review',
    creationTime: '2026-04-06 08:30',
    creator: 'TMS Claim Team',
  },
  {
    ticketNo: 'PHCT26040506KL',
    claimTypeL1: 'Internal',
    claimTypeL2: 'Toll Fee Adjustment',
    claimAmount: 450,
    currency: 'PHP',
    claimant: 'Inteluck Corporation',
    responsibleParty: 'Vendor',
    isWaybillBased: true,
    relatedWaybill: 'WB2604001',
    claimDetails: 'Toll 预付差额冲销。',
    deductionForVendor: 'Written Off',
    status: 'Canceled',
    creationTime: '2026-04-05 13:12',
    creator: 'Inteluck Finance',
  },
];
