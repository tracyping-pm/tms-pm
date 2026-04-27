import React, { useMemo, useState } from 'react';
import {
  VENDORS,
  WAYBILLS,
  COUNTRY_ENTITIES,
  ENTITY_LABEL,
  TAX_OPTIONS_BY_ENTITY,
  type Vendor,
  type CompanyEntity,
  type CountryCode,
  type Currency,
  type Waybill,
} from '../data/mockData';
import { Card, Field, formatAmount, formatMoney, Stat } from './UI';

interface Props {
  onCancel: () => void;
  onSaved: () => void;
}

type AllocationMode = 'TotalAmount' | 'Percentage';

const ALLOCATABLE_STATUS: Waybill['status'][] = ['Planning', 'Pending', 'In Transit'];

export default function ApplicationCreate({ onCancel, onSaved }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1
  const [vendorId, setVendorId] = useState<string>('');
  const [country, setCountry] = useState<CountryCode | ''>('');
  const [entity, setEntity] = useState<CompanyEntity | ''>('');

  // Step 2
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Step 3
  const [mode, setMode] = useState<AllocationMode>('TotalAmount');
  const [prepaidAmount, setPrepaidAmount] = useState<string>('');
  const [prepaidRatio, setPrepaidRatio] = useState<string>('50');
  const [taxInclusive, setTaxInclusive] = useState<boolean>(false);
  const [vatRate, setVatRate] = useState<number>(0);
  const [whtRate, setWhtRate] = useState<number>(0);
  const [proofName, setProofName] = useState<string>('');

  const vendor: Vendor | undefined = useMemo(() => VENDORS.find(v => v.id === vendorId), [vendorId]);
  const entityOptions = country ? COUNTRY_ENTITIES[country] : [];
  const taxOptions = entity ? TAX_OPTIONS_BY_ENTITY[entity] : { vat: [0], wht: [0] };

  const candidateWaybills = useMemo(
    () => WAYBILLS.filter(w =>
      w.vendorId === vendorId &&
      ALLOCATABLE_STATUS.includes(w.status) &&
      !w.applicationNo
    ),
    [vendorId]
  );

  const selectedWaybills = useMemo(
    () => candidateWaybills.filter(w => selected.has(w.waybillNo)),
    [candidateWaybills, selected]
  );

  const sumBasic = selectedWaybills.reduce((s, w) => s + w.basicAmount, 0);
  const currency: Currency = (vendor?.defaultCurrency ?? 'USD') as Currency;

  // Effective prepaid amount
  const effectiveAmount = useMemo(() => {
    if (mode === 'TotalAmount') return Number(prepaidAmount) || 0;
    return sumBasic * (Number(prepaidRatio) / 100 || 0);
  }, [mode, prepaidAmount, prepaidRatio, sumBasic]);

  const netAmount = taxInclusive ? effectiveAmount / (1 + vatRate / 100) : effectiveAmount;
  const vatAmount = netAmount * (vatRate / 100);
  const whtAmount = netAmount * (whtRate / 100);
  const totalPayable = netAmount + vatAmount - whtAmount;

  // Allocation preview
  const allocations = useMemo(() => {
    if (sumBasic === 0 || effectiveAmount === 0) return [];
    return selectedWaybills.map(w => ({
      waybillNo: w.waybillNo,
      basicAmount: w.basicAmount,
      allocated: Number(((w.basicAmount / sumBasic) * effectiveAmount).toFixed(2)),
    }));
  }, [selectedWaybills, sumBasic, effectiveAmount]);

  // Validation
  const errors: Record<string, string> = {};
  if (step === 1) {
    if (!vendorId) errors.vendor = 'Please choose a vendor.';
    if (!country) errors.country = 'Please choose a country.';
    if (!entity) errors.entity = 'Please choose an entity.';
  }
  if (step === 2) {
    if (selectedWaybills.length === 0) errors.waybills = 'At least one waybill must be selected.';
    const currencies = new Set(selectedWaybills.map(w => w.currency));
    if (currencies.size > 1) errors.waybills = 'All selected waybills must share the same currency.';
  }
  if (step === 3) {
    if (mode === 'TotalAmount') {
      if (!prepaidAmount || Number(prepaidAmount) <= 0) errors.amount = 'Please enter prepaid amount.';
      if (Number(prepaidAmount) > sumBasic) errors.amount = `Total prepaid amount must be ≤ Σ Basic Amount (${formatMoney(sumBasic, currency)}).`;
    } else {
      if (!prepaidRatio || Number(prepaidRatio) <= 0 || Number(prepaidRatio) > 100) errors.ratio = 'Ratio must be in (0, 100].';
    }
    if (!proofName) errors.proof = 'Please upload at least one proof document.';
  }

  function toggleSelected(waybillNo: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(waybillNo)) next.delete(waybillNo);
      else next.add(waybillNo);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === candidateWaybills.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(candidateWaybills.map(w => w.waybillNo)));
    }
  }

  function handleVendorChange(id: string) {
    const v = VENDORS.find(x => x.id === id);
    setVendorId(id);
    setSelected(new Set());
    if (v) {
      setCountry(v.country);
      setEntity(v.defaultEntity);
      const tax = TAX_OPTIONS_BY_ENTITY[v.defaultEntity];
      setVatRate(tax.vat[tax.vat.length - 1]);
      setWhtRate(tax.wht[tax.wht.length - 1]);
    } else {
      setCountry('');
      setEntity('');
    }
  }

  function handleEntityChange(e: CompanyEntity) {
    setEntity(e);
    const tax = TAX_OPTIONS_BY_ENTITY[e];
    setVatRate(tax.vat[tax.vat.length - 1]);
    setWhtRate(tax.wht[tax.wht.length - 1]);
  }

  return (
    <>
      <div className="ppa-page-header">
        <div>
          <div className="ppa-page-title">Create Partial Payment Application</div>
          <div className="ppa-page-sub">为一个 Vendor 的若干运单批量发起预付款申请，提交后 TMS 将同步至 HR Payment Request</div>
        </div>
        <button className="ppa-btn" onClick={onCancel}>Cancel</button>
      </div>

      <div className="ppa-steps">
        <div className={`ppa-step ${step === 1 ? 'active' : step > 1 ? 'done' : ''}`}>
          <span className="ppa-step-num">{step > 1 ? '✓' : '1'}</span>
          <div>
            <div>Select Vendor & Entity</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>Country drives default tax</div>
          </div>
        </div>
        <div className={`ppa-step ${step === 2 ? 'active' : step > 2 ? 'done' : ''}`}>
          <span className="ppa-step-num">{step > 2 ? '✓' : '2'}</span>
          <div>
            <div>Pick Waybills</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>Planning / Pending / In Transit</div>
          </div>
        </div>
        <div className={`ppa-step ${step === 3 ? 'active' : ''}`}>
          <span className="ppa-step-num">3</span>
          <div>
            <div>Amount, Tax & Proof</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>Allocation auto-calc</div>
          </div>
        </div>
      </div>

      {step === 1 && (
        <Card title="Step 1 · Select Vendor and Entity">
          <Field label="Vendor" required error={errors.vendor}>
            <select className="ppa-select" style={{ minWidth: 320 }} value={vendorId} onChange={e => handleVendorChange(e.target.value)}>
              <option value="">— Choose vendor —</option>
              {VENDORS.map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.country})</option>
              ))}
            </select>
          </Field>
          <Field label="Country" required hint="Mirrors HR `departmentCountry`. Only PH / TH / Group are supported by HR." error={errors.country}>
            <select className="ppa-select" value={country} onChange={e => setCountry(e.target.value as any)}>
              <option value="">— Choose —</option>
              <option value="PH">PH</option>
              <option value="TH">TH</option>
              <option value="Group">Group</option>
            </select>
          </Field>
          <Field label="Company Entity" required hint="Determines VAT/WHT options. Maps to HR `companyEntity`." error={errors.entity}>
            <select className="ppa-select" style={{ minWidth: 320 }} value={entity} onChange={e => handleEntityChange(e.target.value as CompanyEntity)} disabled={!country}>
              <option value="">— Choose —</option>
              {entityOptions.map(e => (
                <option key={e} value={e}>{ENTITY_LABEL[e]}</option>
              ))}
            </select>
          </Field>
          <Field label="Currency">
            <span className="ppa-mono">{vendor?.defaultCurrency ?? '-'}</span>
            <span className="hint" style={{ marginLeft: 8 }}>Inherited from vendor; all selected waybills must share this currency.</span>
          </Field>

          <div className="ppa-divider" />
          <div style={{ textAlign: 'right' }}>
            <button
              className="ppa-btn primary"
              onClick={() => setStep(2)}
              disabled={Object.keys(errors).length > 0}
            >Next</button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card
          title="Step 2 · Pick Waybills"
          tip={`Vendor: ${vendor?.name ?? '-'} · Currency: ${currency}`}
        >
          {candidateWaybills.length === 0 ? (
            <div className="ppa-table-empty">No allocatable waybills under this vendor.</div>
          ) : (
            <>
              <table className="ppa-table">
                <thead>
                  <tr>
                    <th style={{ width: 32 }}>
                      <input
                        type="checkbox"
                        className="ppa-checkbox"
                        checked={selected.size === candidateWaybills.length}
                        onChange={toggleAll}
                      />
                    </th>
                    <th>Waybill No.</th>
                    <th>Status</th>
                    <th>Route</th>
                    <th className="num">Basic Amount</th>
                    <th className="num">Handling Fee</th>
                    <th>Currency</th>
                  </tr>
                </thead>
                <tbody>
                  {candidateWaybills.map(w => (
                    <tr key={w.waybillNo}>
                      <td className="center">
                        <input
                          type="checkbox"
                          className="ppa-checkbox"
                          checked={selected.has(w.waybillNo)}
                          onChange={() => toggleSelected(w.waybillNo)}
                        />
                      </td>
                      <td className="ppa-mono">{w.waybillNo}</td>
                      <td>{w.status}</td>
                      <td>{w.origin} → {w.destination}</td>
                      <td className="num">{formatAmount(w.basicAmount)}</td>
                      <td className="num">{formatAmount(w.handlingFee)}</td>
                      <td>{w.currency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="ppa-divider" />
              <div className="ppa-stats-row">
                <Stat label="Selected" value={selectedWaybills.length} sub={`out of ${candidateWaybills.length}`} />
                <Stat label="Σ Basic Amount" value={formatMoney(sumBasic, currency)} sub="Will be the prepayment cap" />
              </div>
              {errors.waybills && <div className="ppa-form-error" style={{ marginTop: 8 }}>{errors.waybills}</div>}
            </>
          )}
          <div className="ppa-divider" />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button className="ppa-btn" onClick={() => setStep(1)}>← Back</button>
            <button
              className="ppa-btn primary"
              onClick={() => setStep(3)}
              disabled={Object.keys(errors).length > 0 || selectedWaybills.length === 0}
            >Next</button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <>
          <Card title="Step 3 · Amount & Tax" tip={`Σ Basic = ${formatMoney(sumBasic, currency)}`}>
            <Field label="Allocation Mode" required>
              <label style={{ marginRight: 16 }}>
                <input type="radio" checked={mode === 'TotalAmount'} onChange={() => setMode('TotalAmount')} /> Total Amount
              </label>
              <label>
                <input type="radio" checked={mode === 'Percentage'} onChange={() => setMode('Percentage')} /> Percentage
              </label>
            </Field>
            {mode === 'TotalAmount' ? (
              <Field label="Prepaid Amount" required hint={`Must be ≤ ${formatMoney(sumBasic, currency)}`} error={errors.amount}>
                <input className="ppa-input" type="number" min={0} value={prepaidAmount} onChange={e => setPrepaidAmount(e.target.value)} />
                <span style={{ marginLeft: 8 }}>{currency}</span>
              </Field>
            ) : (
              <Field label="Prepaid Ratio" required hint="Percent of Basic Amount, 0 < ratio ≤ 100" error={errors.ratio}>
                <input className="ppa-input" type="number" min={0} max={100} value={prepaidRatio} onChange={e => setPrepaidRatio(e.target.value)} />
                <span style={{ marginLeft: 8 }}>%</span>
              </Field>
            )}

            <Field label="Tax-Inclusive">
              <label>
                <input type="checkbox" checked={taxInclusive} onChange={e => setTaxInclusive(e.target.checked)} />
                <span style={{ marginLeft: 8 }}>Prepaid amount already includes VAT</span>
              </label>
            </Field>
            <Field label="VAT Rate" required hint="Defaults to highest configured rate; editable">
              <select className="ppa-select" value={vatRate} onChange={e => setVatRate(Number(e.target.value))}>
                {taxOptions.vat.map(v => <option key={v} value={v}>{v}%</option>)}
              </select>
            </Field>
            <Field label="WHT Rate" required>
              <select className="ppa-select" value={whtRate} onChange={e => setWhtRate(Number(e.target.value))}>
                {taxOptions.wht.map(v => <option key={v} value={v}>{v}%</option>)}
              </select>
            </Field>
            <Field label="Proof" required hint="Mock upload — single PDF/JPG; HR `documentIds[]`" error={errors.proof}>
              <input
                className="ppa-input"
                type="text"
                placeholder="Click here to mock upload..."
                style={{ minWidth: 320 }}
                value={proofName}
                onChange={e => setProofName(e.target.value)}
                onFocus={() => { if (!proofName) setProofName('Vendor_Request_Letter.pdf'); }}
              />
            </Field>
          </Card>

          <Card title="Calculation Preview">
            <div className="ppa-stats-row" style={{ marginBottom: 12 }}>
              <Stat label="Net Amount" value={formatMoney(netAmount, currency)} sub={taxInclusive ? 'Backed out of tax-inclusive' : 'Same as prepaid'} />
              <Stat label="VAT Amount" value={formatMoney(vatAmount, currency)} sub={`${vatRate}% × Net`} />
              <Stat label="WHT Amount" value={formatMoney(whtAmount, currency)} sub={`${whtRate}% × Net (deducted)`} />
              <Stat label="Total Payable to HR" value={formatMoney(totalPayable, currency)} sub="net + VAT − WHT" />
            </div>

            <div className="ppa-section-title">Allocation Preview (per waybill)</div>
            <table className="ppa-table">
              <thead>
                <tr>
                  <th>Waybill No.</th>
                  <th className="num">Basic Amount Snapshot</th>
                  <th className="num">Allocated Amount</th>
                  <th>Resulting Prepay Status</th>
                </tr>
              </thead>
              <tbody>
                {allocations.length === 0 && (
                  <tr><td colSpan={4} className="ppa-table-empty">Fill in amount/ratio to see allocation.</td></tr>
                )}
                {allocations.map(a => (
                  <tr key={a.waybillNo}>
                    <td className="ppa-mono">{a.waybillNo}</td>
                    <td className="num">{formatAmount(a.basicAmount)}</td>
                    <td className="num">{formatAmount(a.allocated)}</td>
                    <td><span className="ppa-badge pending-sync">Pending Sync</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
            <button className="ppa-btn" onClick={() => setStep(2)}>← Back</button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="ppa-btn" disabled={Object.keys(errors).length > 0} onClick={onSaved}>Save as Draft</button>
              <button className="ppa-btn primary" disabled={Object.keys(errors).length > 0} onClick={onSaved}>Save & Submit to HR</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
