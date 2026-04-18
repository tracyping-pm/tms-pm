/**
 * Waybill 详情 mock — 用于 SettlementDetail / StatementDetail 的展开行
 *
 * billingLines 中 `editedBy: 'TMS Ops'` 的项表示 TMS 运营端对该结算项做过编辑，
 * 展开行需要以 "Original → Current" 黄底对比展示，便于 VP 核对。
 */

export interface BillingLine {
  item: string;
  originalAmount: number;
  currentAmount: number;
  editedBy?: 'TMS Ops';
  editedAt?: string;
  reason?: string;
}

export interface WaybillDetail {
  no: string;
  positionTime: string;
  deliveryTime: string;
  unloadingTime?: string;
  origin: string;
  destination: string;
  truckType: string;
  truckPlate?: string;
  driver?: string;
  pod?: string;
  receipt?: string;
  billingLines: BillingLine[];
  relatedClaimTickets?: string[];
  notes?: string;
}

export const WAYBILL_DETAILS: Record<string, WaybillDetail> = {
  WB2604001: {
    no: 'WB2604001',
    positionTime: '2026-04-01 09:20',
    deliveryTime: '2026-04-02 14:30',
    unloadingTime: '2026-04-02 16:05',
    origin: 'PH-NCR-Manila / Port Area',
    destination: 'PH-Cavite-Imus / DC',
    truckType: '10W Wing Van',
    truckPlate: 'ABC-1234',
    driver: 'Juan Dela Cruz',
    pod: 'POD-WB2604001.jpg',
    receipt: 'OR-WB2604001.pdf',
    billingLines: [
      { item: 'Paid in Advance', originalAmount: 0, currentAmount: 0 },
      { item: 'Basic (Remaining)', originalAmount: 15000, currentAmount: 15000 },
      { item: 'Additional Charge', originalAmount: 500, currentAmount: 500 },
    ],
    relatedClaimTickets: ['PHCT26040506KL'],
  },
  WB2604002: {
    no: 'WB2604002',
    positionTime: '2026-04-02 07:10',
    deliveryTime: '2026-04-03 18:00',
    unloadingTime: '2026-04-03 19:40',
    origin: 'PH-NCR-Manila / Port Area',
    destination: 'PH-Laguna-Calamba / Plant 2',
    truckType: '6W Fwd',
    truckPlate: 'XYZ-5678',
    driver: 'Pedro Santos',
    pod: 'POD-WB2604002.jpg',
    billingLines: [
      { item: 'Paid in Advance', originalAmount: 2000, currentAmount: 2000 },
      {
        item: 'Basic (Remaining)',
        originalAmount: 9500,
        currentAmount: 10000,
        editedBy: 'TMS Ops',
        editedAt: '2026-04-16 15:42',
        reason: 'Approved via ApM260416001 — price modification',
      },
      {
        item: 'Vendor Exception Fee',
        originalAmount: 800,
        currentAmount: 1200,
        editedBy: 'TMS Ops',
        editedAt: '2026-04-16 15:42',
        reason: 'Approved via ApM260416001 — exception fee uplift',
      },
    ],
    relatedClaimTickets: ['PHCT26041501AB'],
    notes: 'TMS 侧基于 Modification Request 调整了 Basic 与 Exception 金额。',
  },
  WB2604003: {
    no: 'WB2604003',
    positionTime: '2026-04-03 10:00',
    deliveryTime: '2026-04-04 12:00',
    origin: 'PH-NCR-Manila / Port Area',
    destination: 'PH-Batangas / Lima',
    truckType: '10W Wing Van',
    truckPlate: 'DEF-2345',
    driver: 'Antonio Reyes',
    billingLines: [
      { item: 'Basic (Remaining)', originalAmount: 16800, currentAmount: 16800 },
      { item: 'Additional Charge', originalAmount: 1200, currentAmount: 1200 },
    ],
    relatedClaimTickets: ['PHCT26040704GH'],
  },
  WB2604004: {
    no: 'WB2604004',
    positionTime: '2026-04-04 11:00',
    deliveryTime: '2026-04-05 16:00',
    unloadingTime: '2026-04-05 17:30',
    origin: 'PH-Cavite-Imus',
    destination: 'PH-NCR-Taguig',
    truckType: '6W Fwd',
    truckPlate: 'GHI-6789',
    driver: 'Ramon Cruz',
    pod: 'POD-WB2604004.jpg',
    billingLines: [
      { item: 'Basic (Remaining)', originalAmount: 7800, currentAmount: 7800 },
      { item: 'Additional Charge', originalAmount: 300, currentAmount: 300 },
      { item: 'Vendor Claim', originalAmount: 500, currentAmount: 500 },
    ],
    relatedClaimTickets: ['PHCT26041002CD'],
  },
  WB2604005: {
    no: 'WB2604005',
    positionTime: '2026-04-05 08:30',
    deliveryTime: '2026-04-06 10:30',
    origin: 'PH-Laguna-Calamba',
    destination: 'PH-NCR-Quezon City',
    truckType: '10W Wing Van',
    billingLines: [
      { item: 'Basic (Remaining)', originalAmount: 14200, currentAmount: 14200 },
    ],
  },
  WB2604006: {
    no: 'WB2604006',
    positionTime: '2026-04-06 13:00',
    deliveryTime: '2026-04-07 08:00',
    unloadingTime: '2026-04-07 09:15',
    origin: 'PH-Batangas / Lima',
    destination: 'PH-Cavite-Imus / DC',
    truckType: '10W Wing Van',
    truckPlate: 'JKL-9012',
    driver: 'Miguel Garcia',
    pod: 'POD-WB2604006.jpg',
    billingLines: [
      { item: 'Basic (Remaining)', originalAmount: 15500, currentAmount: 15500 },
      { item: 'Additional Charge', originalAmount: 800, currentAmount: 800 },
    ],
  },
};
