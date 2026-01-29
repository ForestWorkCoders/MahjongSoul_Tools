# 玩家資料提取器

## 前置需求：
- 雀魂游覽器版

## 檔案簡介
- `get_all.js` 是提取牌譜資料中最基本的單位
- `extract_paipu.js` 是從 `get_all.js` 延伸出來的處理功能，并且輸出為一個 `.csv` 檔案。

## 使用方法
1. 在雀魂游覽器版登入你的賬號
2. 進入 inspect mode (`ctrl + shift + I`) 
3. 複製 `extract_paipu.js` 的内容，然後在 `processRecords()` 那裏自行改成你所需要的牌譜鏈接。
4. 牌譜鏈接需要以陣列 (array) 的形式輸入。
