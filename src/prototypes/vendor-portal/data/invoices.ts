/**
 * Invoice mock data — VP 视角
 *
 * Invoice 由供应商录入，无系统编号（使用供应商自填的 invoiceNo）。
 * 一个 Settlement / Statement 可关联多张 Invoice（不同税率拆单、分批开票）。
 */

export interface Invoice {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  amount: number;
  currency: 'PHP';
  documentFileName?: string;
  linkedSettlementApNo?: string;
  linkedStatementNo?: string;
  remark?: string;
}

export const INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNo: 'INV-2026-00157',
    invoiceDate: '2026-04-15',
    amount: 35000,
    currency: 'PHP',
    documentFileName: 'INV-2026-00157.pdf',
    linkedStatementNo: 'PHVS26041501',
    remark: 'VAT-exempt portion',
  },
  {
    id: 'inv-2',
    invoiceNo: 'INV-2026-00158',
    invoiceDate: '2026-04-15',
    amount: 14900,
    currency: 'PHP',
    documentFileName: 'INV-2026-00158.pdf',
    linkedStatementNo: 'PHVS26041501',
    remark: 'VAT-able portion',
  },
  {
    id: 'inv-3',
    invoiceNo: 'INV-2026-00161',
    invoiceDate: '2026-04-16',
    amount: 49800,
    currency: 'PHP',
    documentFileName: 'INV-2026-00161.pdf',
    linkedSettlementApNo: 'ApS260416002',
  },
];
