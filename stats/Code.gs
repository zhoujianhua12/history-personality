const SHEET_NAME = '参与数据';
const ADMIN_TOKEN = 'HP_ADMIN_2026_CHANGE_ME';

function getSheet_() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('SHEET_ID');
  let ss;
  if (id) {
    try { ss = SpreadsheetApp.openById(id); } catch (e) {}
  }
  if (!ss) {
    ss = SpreadsheetApp.create('历史上的你｜参与统计');
    props.setProperty('SHEET_ID', ss.getId());
  }
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['时间','结果人物','匹配度','历史角色','八维画像','测试次数ID']);
  }
  return sh;
}

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const sh = getSheet_();
    const result = data.result || {};
    const top = Array.isArray(result.top) ? result.top : [];
    const first = top[0] || {};
    const role = result.role && result.role.name ? result.role.name : '';
    const vector = Array.isArray(result.vector) ? result.vector.join(',') : '';
    const attemptId = String(data.attemptId || Utilities.getUuid());
    sh.appendRow([new Date(), String(first.name || ''), Number(first.match || 0), role, vector, attemptId]);
    return json_({ok:true});
  } catch (err) {
    return json_({ok:false,error:String(err)});
  }
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.admin !== ADMIN_TOKEN) return json_({ok:true,service:'history-personality-stats'});
  const sh = getSheet_();
  const values = sh.getDataRange().getValues();
  const rows = values.slice(1).filter(r => r[1]);
  const counts = {};
  rows.forEach(r => counts[r[1]] = (counts[r[1]] || 0) + 1);
  const ranking = Object.keys(counts).map(name => ({name,count:counts[name]}))
    .sort((a,b)=>b.count-a.count);
  const topRows = rows.slice(-50).reverse().map(r => ({
    time: Utilities.formatDate(new Date(r[0]), Session.getScriptTimeZone() || 'Asia/Shanghai', 'yyyy-MM-dd HH:mm'),
    name:String(r[1]), match:Number(r[2]||0), role:String(r[3]||'')
  }));
  return HtmlService.createHtmlOutput(dashboardHtml_(rows.length, ranking, topRows))
    .setTitle('历史上的你｜后台统计');
}

function dashboardHtml_(total, ranking, recent) {
  const rankHtml = ranking.map((x,i)=>'<tr><td>'+(i+1)+'</td><td>'+esc_(x.name)+'</td><td>'+x.count+'</td><td>'+((x.count/Math.max(total,1))*100).toFixed(1)+'%</td></tr>').join('');
  const recentHtml = recent.map(x=>'<tr><td>'+esc_(x.time)+'</td><td>'+esc_(x.name)+'</td><td>'+x.match+'%</td><td>'+esc_(x.role)+'</td></tr>').join('');
  return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>历史上的你｜后台统计</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;background:#f6f1e7;color:#222;margin:0;padding:24px}.wrap{max-width:900px;margin:auto}.hero,.card{background:#fff;border-radius:20px;padding:24px;margin-bottom:18px;box-shadow:0 8px 24px rgba(0,0,0,.06)}h1{margin:0 0 8px}.num{font-size:46px;font-weight:900}.muted{color:#777}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:11px 8px;border-bottom:1px solid #eee}th{font-weight:800}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}@media(max-width:600px){.grid{grid-template-columns:1fr}body{padding:12px}}</style></head><body><div class="wrap"><div class="hero"><h1>历史上的你｜参与统计</h1><div class="muted">只统计完成测试并提交结果的参与记录</div></div><div class="grid"><div class="card"><div class="muted">累计参与次数</div><div class="num">'+total+'</div></div><div class="card"><div class="muted">不同结果人物</div><div class="num">'+ranking.length+'</div></div></div><div class="card"><h2>人物结果统计</h2><table><tr><th>排名</th><th>人物</th><th>次数</th><th>占比</th></tr>'+rankHtml+'</table></div><div class="card"><h2>最近参与</h2><table><tr><th>时间</th><th>结果人物</th><th>匹配度</th><th>历史角色</th></tr>'+recentHtml+'</table></div></div></body></html>';
}

function esc_(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function testSetup() {
  const sh = getSheet_();
  Logger.log(sh.getParent().getUrl());
}
