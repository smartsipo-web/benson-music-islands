# 活動管理後台

登入網址：`/admin/`。YouTube 由使用者自行上傳，這裡接收影片網址。

## 資料與發布

- `api/activities.mjs`：登入、草稿、發布、撤下、圖片及密碼變更。
- `lib/activities.mjs`：欄位驗證、YouTube 網址正規化、密碼驗證。
- 現有私有 Vercel Blob 儲存空間內使用獨立的 `benson-activities-v1/` 前綴，不改動留言與訪客紀錄。
- 單一 manifest 同時保存草稿與公開快照。ETag 條件寫入及每筆 revision 防止其他視窗覆蓋變更。
- 官網與音樂島在載入時讀取同一份公開快照。草稿及其照片不對未登入訪客開放。
- 圖片由瀏覽器縮小並轉為 JPEG，單張上限 2.5 MB，每場最多 40 張。評分單不做自動文字辨識。
- 新活動可含多個組別，各有獨立名次、分數、影片與文字評語。
- 舊有靜態戰績不搬移，此後台管理新增活動及已匯入的預告。

## 部署設定

沿用專案現有 `BLOB_READ_WRITE_TOKEN`。新增 production-only Secret `BENSON_ADMIN_PASSWORD_HASH`，格式為 `salt:scrypt_hex`（64 bytes）。初始密碼不進入程式碼或 Git。

登入後可更改密碼，新密碼雜湊存於私有 Blob；既有登入會失效。工作階段使用 HttpOnly / Secure / SameSite=Strict cookie，8 小時到期。登入限制為每個來源 IP 每 15 分鐘 8 次。所有變更需要登入及同源 JSON POST。

## 驗證

執行 `npm ci`、`npm test`、`npm run build`。活動測試使用隔離的記憶體儲存，涵蓋未登入拒絕、跨來源拒絕、影片驗證、無效日期、多組別、草稿隱私、照片隱私、發布、草稿與公開版本分離、過期 revision、撤下、密碼變更與登入限流。

實際部署需另外檢查登入、圖片讀寫、共用快照與兩個網站顯示。不要把測試活動留在公開快照。
