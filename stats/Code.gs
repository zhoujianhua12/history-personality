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
  const rows = values.slice(1);
  const counts = {};
  let total = 0;
  rows.forEach(r => {
    if (!r[1]) return;
    total++;
    counts[r[1]] = (counts[r[1]] || 0) + 1;
  });
  const ranking = Object.keys(counts).map(name => ({name,count:counts[name]}))
    .sort((a,b)=>b.count-a.count);
  return json_({
    ok:true,total:total,
    ranking:ranking,
    updatedAt:new Date().toISOString(),
    sheetUrl:SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SHEET_ID')).getUrl()
  });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function testSetup() {
  const sh = getSheet_();
  Logger.log(sh.getParent().getUrl());
}
