import React, { useRef } from "react";

const fmtCurrency = (value) =>
  value === undefined || value === null || value === "" ? "--" : Number(value).toFixed(2);

function Barcode({ value }) {
  const bars = String(value || "").split("").map((ch) => ch.charCodeAt(0) % 4 + 1);
  return (
    <div className="op-barcode" aria-hidden="true">
      {bars.map((w, i) => (<span key={i} style={{ width: `${w}px` }} />))}
    </div>
  );
}

export default function OPSlip({ appointment, onClose }) {
  const printRef = useRef(null);
  if (!appointment) return null;
  const a = appointment;
  const handlePrint = () => { window.print(); };
  const handleOverlayClose = () => { if (onClose) onClose(); };
  const stopShellClick = (event) => event.stopPropagation();

  return (
    <div className="op-slip-overlay" onClick={handleOverlayClose} role="dialog" aria-modal="true">
      <style>{`
        .op-slip-overlay { position: fixed; inset: 0; background: rgba(15,23,22,0.45); display: flex; align-items: center; justify-content: center; padding: 32px 16px; overflow: hidden; z-index: 11000; }
        .op-slip-shell { background: #fff; width: 100%; max-width: 420px; max-height: calc(100vh - 64px); border-radius: 10px; box-shadow: 0 20px 50px rgba(0,0,0,0.25); overflow-y: auto; box-sizing: border-box; }
        .op-slip-toolbar { position: sticky; top: 0; z-index: 1; display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; background: #0f4c46; }
        .op-slip-toolbar button { border: none; border-radius: 6px; padding: 7px 14px; font-size: 13px; font-weight: 600; cursor: pointer; }
        .op-slip-toolbar .print-btn { background: #14b8a6; color: #fff; }
        .op-slip-toolbar .close-btn { background: transparent; color: #e6f4f2; }
        .op-slip-toolbar-actions { display: flex; align-items: center; gap: 4px; }
        .op-slip-toolbar .icon-close-btn { width: 30px; height: 30px; padding: 0; border-radius: 50%; background: transparent; color: #e6f4f2; font-size: 22px; line-height: 1; }
        .op-slip-toolbar .icon-close-btn:hover { background: rgba(255,255,255,0.14); }
        .op-slip { font-family: "Courier New", "Consolas", monospace; font-size: 12.5px; color: #111; padding: 18px 20px 22px; line-height: 1.45; }
        .op-slip-header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 8px; margin-bottom: 8px; }
        .op-slip-header .clinic-name { font-size: 16px; font-weight: 800; letter-spacing: 0.3px; }
        .op-slip-header .clinic-meta { font-size: 11px; margin-top: 2px; }
        .op-slip-title { text-align: center; font-weight: 700; text-decoration: underline; margin-bottom: 10px; font-size: 12.5px; }
        .op-slip-row { display: flex; justify-content: space-between; gap: 8px; padding: 2px 0; }
        .op-slip-row .label { color: #333; white-space: nowrap; }
        .op-slip-row .value { font-weight: 700; text-align: right; }
        .op-slip hr.dash { border: none; border-top: 1px dashed #999; margin: 8px 0; }
        .op-slip-badges { display: flex; justify-content: center; gap: 24px; margin: 10px 0; }
        .op-badge { border: 2px solid #111; border-radius: 50%; width: 56px; height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .op-badge .badge-label { font-size: 8px; font-weight: 700; }
        .op-badge .badge-value { font-size: 17px; font-weight: 800; }
        .op-slip-note { font-size: 11px; margin-top: 6px; }
        .op-slip-footer { margin-top: 14px; display: flex; justify-content: space-between; font-size: 11px; }
        .op-slip-footer .signature { text-align: right; }
        .op-barcode { display: flex; align-items: flex-end; gap: 1px; height: 30px; margin: 8px auto 2px; justify-content: center; }
        .op-barcode span { background: #111; height: 100%; display: inline-block; }
        .op-slip-idline { text-align: center; font-size: 10px; letter-spacing: 2px; margin-bottom: 4px; }
        @media print {
          .op-slip-overlay { position: static; background: none; padding: 0; }
          .op-slip-shell { box-shadow: none; max-width: 100%; border-radius: 0; }
        }
      `}</style>

      <div className="op-slip-shell" onClick={stopShellClick}>
        <div className="op-slip-toolbar">
          <button className="print-btn" onClick={handlePrint} type="button">Print OP Slip</button>
          {onClose ? (
            <div className="op-slip-toolbar-actions">
              <button className="close-btn" onClick={onClose} type="button">Close</button>
              <button
                className="icon-close-btn"
                onClick={onClose}
                type="button"
                aria-label="Close OP slip"
                title="Close"
              >
                ×
              </button>
            </div>
          ) : null}
        </div>

        <div className="op-slip" ref={printRef}>
          <div className="op-slip-header">
            <div className="clinic-name">{a.clinicName}</div>
            <div className="clinic-meta">
              {a.clinicAddress}{a.clinicAddress ? <br /> : null}
              {a.clinicPhone ? `Ph: ${a.clinicPhone}` : ""}{a.regNo ? ` | Reg No: ${a.regNo}` : ""}
            </div>
          </div>

          <div className="op-slip-title">Appointment Slip &ndash; Cum &ndash; Receipt</div>

          <div className="op-slip-row"><span className="label">Pt. Name</span><span className="value">{a.patientName || "-"}</span></div>
          <div className="op-slip-row"><span className="label">UMR No</span><span className="value">{a.umrNo || "-"}</span></div>
          <div className="op-slip-row"><span className="label">Age / Sex</span><span className="value">{a.age ? `${a.age}Y` : "-"} / {a.sex || "-"}</span></div>
          <div className="op-slip-row"><span className="label">Phone</span><span className="value">{a.phone || "-"}</span></div>
          {a.address ? (<div className="op-slip-row"><span className="label">Address</span><span className="value" style={{ maxWidth: "70%" }}>{a.address}</span></div>) : null}

          <hr className="dash" />

          <div className="op-slip-row"><span className="label">Consult No</span><span className="value">{a.consultNo || "-"}</span></div>
          <div className="op-slip-row"><span className="label">Consult Date</span><span className="value">{a.consultDate || "-"}</span></div>
          <div className="op-slip-row"><span className="label">Consultant</span><span className="value">{a.consultant || "-"}</span></div>
          <div className="op-slip-row"><span className="label">Ref By</span><span className="value">{a.refBy || "-"}</span></div>
          <div className="op-slip-row"><span className="label">Department</span><span className="value">{a.department || "General"}</span></div>
          <div className="op-slip-row"><span className="label">Visit Type</span><span className="value">{a.visitType || "Normal"}</span></div>
          <div className="op-slip-row"><span className="label">Pay Mode</span><span className="value">{a.payMode || "Self"}</span></div>

          <div className="op-slip-badges">
            <div className="op-badge"><span className="badge-label">OP No.</span><span className="badge-value">{a.opNo ?? "-"}</span></div>
            <div className="op-badge"><span className="badge-label">RCPT</span><span className="badge-value">{a.receiptNo ?? "-"}</span></div>
          </div>

          <hr className="dash" />

          <div className="op-slip-row"><span className="label">Consult Fee</span><span className="value">{fmtCurrency(a.consultFee)}</span></div>
          <div className="op-slip-row"><span className="label">Cash Amt</span><span className="value">{fmtCurrency(a.cashAmt)}</span></div>
          <div className="op-slip-row"><span className="label">Due Amt</span><span className="value">{fmtCurrency(a.dueAmt)}</span></div>

          {a.validityNote ? <div className="op-slip-note">Validity: {a.validityNote}</div> : null}

          <div className="op-slip-footer">
            <div>
              <div>Create By: {a.createdBy || "-"}</div>
              <div>Create Dt: {a.createDt || "-"}</div>
            </div>
            <div className="signature">(Authorised Signatory)</div>
          </div>

          <hr className="dash" />

          <div className="op-slip-idline">{a.consultNo}</div>
          <Barcode value={a.consultNo} />
        </div>
      </div>
    </div>
  );
}
