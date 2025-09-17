// script.js — client-side: handle form, preview, PDF, localStorage
const form = document.getElementById('slipForm');
const previewSection = document.getElementById('preview');
const slipCard = document.getElementById('slipCard');
const downloadPdf = document.getElementById('downloadPdf');
const printBtn = document.getElementById('printBtn');
const saveRecord = document.getElementById('saveRecord');
const recordsList = document.getElementById('recordsList');
const exportAllCsv = document.getElementById('exportAllCsv');
const clearAll = document.getElementById('clearAll');
const clearFormBtn = document.getElementById('clearFormBtn');
const yearSpan = document.getElementById('year');
yearSpan.textContent = new Date().getFullYear();

function getFormData(){
  const name = document.getElementById('studentName').value.trim();
  const roll = document.getElementById('studentRoll').value.trim();
  const cls = document.getElementById('studentClass').value.trim();
  const tuition = Number(document.getElementById('tuition').value||0);
  const additional = Number(document.getElementById('additional').value||0);
  const notes = document.getElementById('notes').value.trim();
  const facilities = Array.from(document.querySelectorAll('.facility:checked')).map(cb=>({
    name: cb.value, cost: Number(cb.dataset.cost||0)
  }));
  return {name, roll, cls, tuition, additional, notes, facilities};
}

function calcTotal(data){
  const facTotal = data.facilities.reduce((s,f)=>s+f.cost,0);
  return Number(data.tuition || 0) + Number(data.additional || 0) + facTotal;
}

function renderSlip(data){
  const total = calcTotal(data);
  const facilityHtml = data.facilities.length ? `
    <div class="slip-items">
      <ul>
        ${data.facilities.map(f=>`<li><span>${f.name}</span><b>${f.cost} PKR</b></li>`).join('')}
      </ul>
    </div>` : `<div style="color:#7b8794;margin-top:8px">No facilities selected</div>`;

  return `
    <div class="slip-top">
      <div>
        <div class="slip-title">The Academy of Education</div>
        <div class="slip-meta">Fee Slip / Receipt</div>
      </div>
      <div style="text-align:right">
        <div style="font-weight:700">${new Date().toLocaleDateString()}</div>
        <div style="font-size:13px;color:#7b8794">Receipt ID: ${Date.now().toString().slice(-6)}</div>
      </div>
    </div>

    <div class="slip-section">
      <div><strong>${escapeHtml(data.name||'—')}</strong><div class="slip-meta">Student Name</div></div>
      <div style="text-align:right"><strong>${escapeHtml(data.roll||'—')}</strong><div class="slip-meta">Roll / ID</div></div>
    </div>

    <div class="slip-section" style="margin-bottom:6px">
      <div><div class="slip-meta">Class / Section</div><div>${escapeHtml(data.cls||'—')}</div></div>
      <div style="text-align:right"><div class="slip-meta">Notes</div><div>${escapeHtml(data.notes||'—')}</div></div>
    </div>

    <div style="border-top:1px dashed #eef6ff;padding-top:12px">
      <div class="slip-items">
        <ul>
          <li><span>Tuition</span><b>${Number(data.tuition||0)} PKR</b></li>
          <li><span>Additional</span><b>${Number(data.additional||0)} PKR</b></li>
        </ul>
      </div>

      ${facilityHtml}

      <div style="margin-top:12px;display:flex;justify-content:space-between">
        <div style="color:#7b8794">Amount in PKR</div>
        <div style="font-size:18px;font-weight:700">${total} PKR</div>
      </div>
    </div>
  `;
}

function escapeHtml(s){
  return String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
}

// On form submit -> preview
form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const data = getFormData();
  if(!data.name || !data.tuition){
    alert('Please enter student name and tuition.');
    return;
  }
  slipCard.innerHTML = renderSlip(data);
  previewSection.classList.remove('hidden');
  // store last preview on window for download/print
  window.currentSlip = {data, html: slipCard.innerHTML};
});

// Download PDF using html2canvas + jsPDF
downloadPdf.addEventListener('click', async ()=>{
  if(!window.currentSlip){
    alert('Please generate slip first.');
    return;
  }
  const element = slipCard;
  // Increase scale for clarity
  const canvas = await html2canvas(element, {scale: 2});
  const imgData = canvas.toDataURL('image/png');
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: 'px', format: [canvas.width, canvas.height] });
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save(`fee_slip_${Date.now().toString().slice(-6)}.pdf`);
});

// Print
printBtn.addEventListener('click', ()=>{
  if(!window.currentSlip){ alert('Generate slip first.'); return;}
  const w = window.open('', '_blank', 'width=800,height=900');
  w.document.write(`<html><head><title>Print Slip</title><style>body{font-family:Inter,Arial;padding:20px}</style></head><body>${window.currentSlip.html}</body></html>`);
  w.document.close();
  w.focus();
  w.print();
});

// Save record to localStorage
saveRecord.addEventListener('click', ()=>{
  if(!window.currentSlip){ alert('Generate slip first.'); return;}
  const key = 'academy_fee_records';
  const records = JSON.parse(localStorage.getItem(key) || '[]');
  const rec = { id: Date.now(), createdAt: new Date().toISOString(), data: window.currentSlip.data, html: window.currentSlip.html };
  records.unshift(rec);
  localStorage.setItem(key, JSON.stringify(records));
  renderRecords();
  alert('Record saved locally.');
});

// Render saved records
function renderRecords(){
  const key = 'academy_fee_records';
  const records = JSON.parse(localStorage.getItem(key) || '[]');
  recordsList.innerHTML = records.length ? records.map(r=>`
    <div class="record">
      <div>
        <div style="font-weight:700">${escapeHtml(r.data.name)}</div>
        <div style="color:#7b8794;font-size:13px">${new Date(r.createdAt).toLocaleString()}</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <button class="btn small" onclick='viewRecord("${r.id}")'>View</button>
        <button class="btn ghost small" onclick='deleteRecord("${r.id}")'>Delete</button>
      </div>
    </div>`).join('') : '<div style="color:#7b8794">No records saved yet.</div>';
}

// Utility to view a record (open preview)
window.viewRecord = function(id){
  const key = 'academy_fee_records';
  const records = JSON.parse(localStorage.getItem(key) || '[]');
  const rec = records.find(r=>String(r.id) === String(id));
  if(!rec) return alert('Record not found');
  slipCard.innerHTML = rec.html;
  previewSection.classList.remove('hidden');
  window.currentSlip = { data: rec.data, html: rec.html };
};

// Delete a record
window.deleteRecord = function(id){
  if(!confirm('Delete this record?')) return;
  const key = 'academy_fee_records';
  let records = JSON.parse(localStorage.getItem(key) || '[]');
  records = records.filter(r=>String(r.id) !== String(id));
  localStorage.setItem(key, JSON.stringify(records));
  renderRecords();
};

// Clear form
clearFormBtn.addEventListener('click', ()=>{
  form.reset();
  document.querySelectorAll('.facility').forEach(cb=>cb.checked=false);
});

// Export all to CSV
exportAllCsv.addEventListener('click', ()=>{
  const key = 'academy_fee_records';
  const records = JSON.parse(localStorage.getItem(key) || '[]');
  if(!records.length) return alert('No records to export.');
  const headers = ['Name','Roll','Class','Tuition','Additional','Facilities','Notes','Total','CreatedAt'];
  const rows = records.map(r=>{
    const d = r.data;
    const fac = (d.facilities||[]).map(f=>f.name+'('+f.cost+')').join('; ');
    const total = calcTotal(d);
    return [d.name,d.roll,d.cls,d.tuition,d.additional,fac,d.notes,total,r.createdAt];
  });
  const csv = [headers.join(','), ...rows.map(r=>r.map(c=>`"${String(c||'').replace(/"/g,'""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download = `academy_records_${new Date().toISOString().slice(0,10)}.csv`; a.click();
  URL.revokeObjectURL(url);
});

// Clear all records
clearAll.addEventListener('click', ()=>{
  if(!confirm('Clear all saved records?')) return;
  localStorage.removeItem('academy_fee_records');
  renderRecords();
});

// load records on page start
renderRecords();
