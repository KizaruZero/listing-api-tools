const fs = require('fs');
const ExcelJS = require('exceljs');

const HAR_FILE = 'dev.evoqx.id-user.har';
const OUTPUT_FILE = 'api-list.xlsx';
const TEMP_JSON = 'api-data.json';

// =======================
// LOAD HAR
// =======================
const har = JSON.parse(fs.readFileSync(HAR_FILE));

// =======================
// LOAD EXISTING DATA
// =======================
let existingData = new Map();

if (fs.existsSync(TEMP_JSON)) {
  const old = JSON.parse(fs.readFileSync(TEMP_JSON));
  old.forEach(item => {
    const key = item.method + item.endpoint;
    existingData.set(key, item);
  });
}

// =======================
// HELPERS
// =======================

// 🔹 detect service
function detectService(url) {
  if (url.includes('general-api')) return 'General Management';
  if (url.includes('account-api')) return 'Account Management';
  if (url.includes('invoice-api')) return 'Invoice Management';
  if (url.includes('vendor-api')) return 'Vendor Management';
  return 'Unknown';
}

// 🔹 normalize endpoint
function normalizeEndpoint(url) {
  let endpoint = url.split('.net')[1] || url;

  // 🔥 REMOVE QUERY PARAMS
  endpoint = endpoint.split('?')[0];

  // replace numeric ID
  endpoint = endpoint.replace(/\/\d+/g, '/{id}');

  // replace UUID
  endpoint = endpoint.replace(/[0-9a-fA-F-]{36}/g, '{uuid}');

  return endpoint;
}

// 🔹 detect auth
function detectAuth(headers) {
  const hasAuth = headers.some(h =>
    h.name.toLowerCase() === 'authorization'
  );
  return hasAuth ? 'Y' : 'N';
}

// =======================
// PROCESS HAR
// =======================
har.log.entries.forEach(entry => {
  const req = entry.request;
  const url = req.url;
  const method = req.method;

  if (!url.includes('/api/')) return;

  const service = detectService(url);
  const endpoint = normalizeEndpoint(url);
  const auth = detectAuth(req.headers);

  const key = method + endpoint;

  if (!existingData.has(key)) {
    existingData.set(key, {
      service,
      method,
      endpoint,
      auth
    });
  }
});

// =======================
// SAVE JSON (incremental)
// =======================
fs.writeFileSync(
  TEMP_JSON,
  JSON.stringify([...existingData.values()], null, 2)
);

// =======================
// GROUP BY SERVICE
// =======================
const grouped = {};

existingData.forEach(api => {
  if (!grouped[api.service]) {
    grouped[api.service] = [];
  }
  grouped[api.service].push(api);
});

// =======================
// GENERATE EXCEL (MULTI SHEET)
// =======================
(async () => {
  const workbook = new ExcelJS.Workbook();

  Object.keys(grouped).forEach(service => {
    const sheet = workbook.addWorksheet(service);

    sheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Service', key: 'service', width: 20 },
      { header: 'Method', key: 'method', width: 10 },
      { header: 'Endpoint', key: 'endpoint', width: 40 },
      { header: 'Auth Required', key: 'auth', width: 15 }
    ];

    let i = 1;

    grouped[service].forEach(api => {
      sheet.addRow({
        no: i++,
        ...api
      });
    });
  });

  await workbook.xlsx.writeFile(OUTPUT_FILE);

  console.log('✅ Excel updated (multi-sheet + normalized)');
})();