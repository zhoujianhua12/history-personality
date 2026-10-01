# 历史上的你｜参与统计

## 作用
- 每次完成测试自动记录一次参与
- 统计累计参与次数
- 统计每个历史人物被测出的次数
- 提供手机可打开的后台统计页面
- 原来的本地测试记录功能继续保留

## 部署后台
1. 打开 https://script.google.com/
2. 新建一个 Apps Script 项目。
3. 打开本仓库的 stats/Code.gs，把全部代码复制进去。
4. 保存。
5. 点 Deploy → New deployment。
6. 类型选择 Web app。
7. Execute as 选择 Me。
8. Who has access 选择 Anyone。
9. 点 Deploy，复制生成的 Web app URL。
10. 回到 index.html，把：
   PASTE_APPS_SCRIPT_WEB_APP_URL_HERE
   替换成刚才的 Web app URL。
11. 提交后重新打开网页测试。

## 后台
部署完成后，在 Web app URL 后面加：
?admin=HP_ADMIN_2026_CHANGE_ME

例如：
WEB_APP_URL?admin=HP_ADMIN_2026_CHANGE_ME

建议部署后立即把 Code.gs 里的 ADMIN_TOKEN 改成你自己的随机密码，再重新部署。

Google 官方文档：
https://developers.google.com/apps-script/guides/web
