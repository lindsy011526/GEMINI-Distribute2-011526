import { Agent, PackingListItem } from './types';

export const SAMPLE_CSV = `Suppliername,deliverdate,customer,licenseID,DeviceCategory,UDI,DeviceName,LotNumber,SN,ModelNum,Numbers,Unit
B00079,45968,C05278,衛部醫器輸字第033951號,E.3610植入式心律器之脈搏產生器,00802526576331,“波士頓科技”英吉尼心臟節律器,890057,,L111,1,組
B00079,45967,C06030,衛部醫器輸字第033951號,E.3610植入式心律器之脈搏產生器,00802526576331,“波士頓科技”英吉尼心臟節律器,872177,,L111,1,組
B00079,45967,C00123,衛部醫器輸字第033951號,E.3610植入式心律器之脈搏產生器,00802526576331,“波士頓科技”英吉尼心臟節律器,889490,,L111,1,組
B00079,45966,C06034,衛部醫器輸字第033951號,E.3610植入式心律器之脈搏產生器,00802526576331,“波士頓科技”英吉尼心臟節律器,889253,,L111,1,組
B00079,45964,C05363,衛部醫器輸字第029100號,E.3610植入式心律器之脈搏產生器,00802526576461,“波士頓科技”艾科雷心臟節律器,869531,,L311,1,組
B00079,45964,C06034,衛部醫器輸字第033951號,E.3610植入式心律器之脈搏產生器,00802526576331,“波士頓科技”英吉尼心臟節律器,889230,,L111,1,組
B00079,45964,C05278,衛部醫器輸字第029100號,E.3610植入式心律器之脈搏產生器,00802526576485,“波士頓科技”艾科雷心臟節律器,182310,,L331,1,組
B00079,45960,C00123,衛部醫器輸字第033951號,E.3610植入式心律器之脈搏產生器,00802526576324,“波士頓科技”英吉尼心臟節律器,915900,,L110,1,組
B00079,45947,C06034,衛部醫器輸字第030901號,E.3610植入式心律器之脈搏產生器,00802526594069,“波士頓科技”恩璽植入式心律去顫器,710753,,D433,1,組
B00079,45946,C06028,衛部醫器輸字第029675號,E.3610植入式心律器之脈搏產生器,00802526576447,“波士頓科技”艾科雷心臟節律器,809748,,L301,1,組
B00018,45930,C00993,衛部醫器輸字第034223號,E.3610植入式心律器之脈搏產生器,05415067031990,“雅培”給力植入式心律去顫器,,810134078,CDVRA500Q,1,個
B00018,45930,C03618,衛部醫器輸字第026580號,E.3610植入式心律器之脈搏產生器,05414734509596,“雅培”恩德拉第心臟節律器,,5161842,PM1172,1,個
B00047,45930,C00547,衛部醫器輸字第030166號,E.3610植入式心律器之脈搏產生器,00763000612207,“美敦力”維希亞磁振造影植入式心臟整流去顫器,,PLX622672S,DVFB2D4,1,組
B00047,45930,C00543,衛部醫器輸字第030761號,E.3610植入式心律器之脈搏產生器,00763000955809,“美敦力” 博視達磁振造影植入式心臟再同步節律器,,RNU615713S,W1TR04,1,組
B00159,45930,C02000,衛部醫器輸字第026582號,E.3610植入式心律器之脈搏產生器,05414734509589,“雅培”安速拉第心臟節律器,,5136600,PM2272,1,個
B00047,45930,C00515,衛部醫器輸字第032275號,E.3610植入式心律器之脈搏產生器,00763000630089,“美敦力”艾視達磁振造影植入式心臟節律器,,FNB275172G,ATDR01,1,組`;

// 31 Agents for Medical Device Distribution Analysis (Traditional Chinese)
export const AGENTS_LIST: Agent[] = [
  { name: "總結分析師", role: "Summary Analyst", description: "生成整體數據的執行摘要", prompt_template: "請根據以下裝箱單數據，提供一份詳細的執行摘要，重點關注供應商績效和客戶分佈：\n{{input}}" },
  { name: "異常偵測員", role: "Anomaly Detector", description: "識別異常的批號或交付模式", prompt_template: "分析以下數據中的異常值，例如異常的訂單量、不連續的批號或重複的SN：\n{{input}}" },
  { name: "供應鏈路徑專家", role: "Supply Chain Expert", description: "可視化並解釋產品流向", prompt_template: "描述從供應商到客戶的產品流向，並指出任何潛在的瓶頸或過度依賴的節點：\n{{input}}" },
  { name: "合規性檢查員", role: "Compliance Officer", description: "檢查許可證與UDI格式", prompt_template: "檢查以下數據中的許可證ID和UDI格式是否符合標準醫療器材規範，列出潛在問題：\n{{input}}" },
  { name: "銷售趨勢預測師", role: "Trend Forecaster", description: "預測未來的需求趨勢", prompt_template: "基於交付日期，分析銷售趨勢並預測下個季度的需求：\n{{input}}" },
  { name: "庫存優化顧問", role: "Inventory Consultant", description: "建議最佳庫存水平", prompt_template: "根據出貨頻率，建議每個型號的最佳安全庫存量：\n{{input}}" },
  { name: "客戶分層分析師", role: "Customer Segmenter", description: "根據購買量對客戶進行分類", prompt_template: "將客戶分為高價值、中等價值和低頻客戶，並建議相應的服務策略：\n{{input}}" },
  { name: "產品生命週期分析師", role: "Product Lifecycle", description: "分析產品型號的新舊更替", prompt_template: "分析不同型號的交付時間，識別哪些產品可能正在逐步淘汰或新近推出：\n{{input}}" },
  { name: "地理分佈專家", role: "Geo Analyst", description: "分析客戶的地理集中度", prompt_template: "雖然沒有具體地址，請根據客戶代碼模式推斷並描述銷售的集中度風險：\n{{input}}" },
  { name: "批號追溯專員", role: "Lot Tracer", description: "追蹤特定批號的分佈", prompt_template: "列出所有涉及多個客戶的批號，並評估若發生召回時的影響範圍：\n{{input}}" },
  { name: "序列號完整性檢查", role: "SN Validator", description: "驗證序列號的唯一性", prompt_template: "檢查序列號是否有重複或格式錯誤，這對於植入式設備至關重要：\n{{input}}" },
  { name: "季節性分析師", role: "Seasonality Expert", description: "識別購買的季節性模式", prompt_template: "分析交付日期是否存在季節性波動或特定時間段的高峰：\n{{input}}" },
  { name: "競爭產品分析師", role: "Competitor Analyst", description: "比較不同設備名稱的表現", prompt_template: "比較不同設備名稱（如'英吉尼'與'艾科雷'）的市場份額和增長率：\n{{input}}" },
  { name: "交付效率評估員", role: "Efficiency Auditor", description: "評估交付頻率與規模", prompt_template: "評估訂單是傾向於小批量高頻率還是大批量低頻率，並評論其物流效率：\n{{input}}" },
  { name: "風險管理顧問", role: "Risk Manager", description: "識別供應鏈中斷風險", prompt_template: "識別對單一供應商或單一客戶過度依賴的風險點：\n{{input}}" },
  { name: "數據清洗機器人", role: "Data Cleaner", description: "格式化並修復髒數據", prompt_template: "將以下原始CSV數據轉換為乾淨的JSON格式，並修復明顯的拼寫錯誤：\n{{input}}" },
  { name: "醫療類別分類員", role: "Category Classifier", description: "按醫療器材類別分組", prompt_template: "按'DeviceCategory'匯總數據，並計算每個類別的總收入佔比（假設單位為1）：\n{{input}}" },
  { name: "授權期限監控", role: "License Monitor", description: "監控許可證ID的使用頻率", prompt_template: "分析哪些許可證ID最常被使用，並檢查是否有過時的許可證格式：\n{{input}}" },
  { name: "UDI解析專家", role: "UDI Parser", description: "解碼UDI含義", prompt_template: "解釋以下UDI編碼可能包含的生產標識符信息（如GTIN部分）：\n{{input}}" },
  { name: "退貨預測模型", role: "Return Predictor", description: "基於歷史模式預測潛在問題", prompt_template: "雖然沒有退貨數據，但請根據批號分散程度預測潛在的質量控制風險區域：\n{{input}}" },
  { name: "定價策略顧問", role: "Pricing Strategist", description: "分析單位與數量的關係", prompt_template: "分析'Unit'和'Numbers'列，建議是否有捆綁銷售的機會：\n{{input}}" },
  { name: "關鍵客戶經理", role: "Key Account Mgr", description: "為大客戶生成報告", prompt_template: "為購買量最大的前3名客戶撰寫專屬的季度業務回顧草案：\n{{input}}" },
  { name: "供應商績效分析", role: "Supplier Auditor", description: "評估供應商的穩定性", prompt_template: "評估供應商（Suppliername）的發貨穩定性：\n{{input}}" },
  { name: "產品關聯分析師", role: "Association Miner", description: "發現共同購買的產品", prompt_template: "分析哪些型號經常在同一天被運送給同一客戶：\n{{input}}" },
  { name: "庫存週轉計算器", role: "Turnover Calc", description: "估算庫存流動速度", prompt_template: "基於交付間隔，估算產品的流動速度：\n{{input}}" },
  { name: "監管報告生成器", role: "Reg Report Gen", description: "生成FDA/TFDA風格報告", prompt_template: "生成一份符合監管機構要求的產品分佈清單草稿：\n{{input}}" },
  { name: "植入物追蹤專員", role: "Implant Tracker", description: "專注於植入式設備的詳細記錄", prompt_template: "過濾出所有'植入式'設備，並建立嚴格的批號-客戶映射表：\n{{input}}" },
  { name: "緊急訂單分析", role: "Urgent Order Analyst", description: "識別可能的緊急補貨", prompt_template: "識別非規律性的、小批量的快速交付，這可能代表緊急手術需求：\n{{input}}" },
  { name: "型號迭代顧問", role: "Model Migration", description: "建議型號升級路徑", prompt_template: "根據舊型號的庫存消耗，建議何時推廣新型號：\n{{input}}" },
  { name: "數據隱私審查員", role: "Privacy Auditor", description: "檢查敏感數據洩露", prompt_template: "檢查數據中是否包含不應出現的患者隱私信息（如未經處理的SN關聯）：\n{{input}}" },
  { name: "執行長助理", role: "CEO Assistant", description: "一句話商業洞察", prompt_template: "用一句話總結這份數據對公司戰略的最大啟示：\n{{input}}" }
];

export const parseCSV = (csvText: string): PackingListItem[] => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const result: PackingListItem[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i].split(',');
    if (currentLine.length < headers.length) continue; // Skip malformed lines
    
    const obj: any = {};
    for (let j = 0; j < headers.length; j++) {
      let val = currentLine[j] ? currentLine[j].trim() : '';
      // Remove quotes if present
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1);
      }
      // Handle the specific double quote issue in the sample data (e.g., "“波士頓科技”...")
      val = val.replace(/“/g, '').replace(/”/g, '');
      
      obj[headers[j]] = val;
    }
    result.push(obj as PackingListItem);
  }
  return result;
};