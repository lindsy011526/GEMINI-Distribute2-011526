# GUDID Chronicles: Master Architectural Specification & Design Document

**Version:** 2.1.0 (Advanced Filtering & Agent Integration)
**Target Platform:** Web (React 19, TypeScript, Tailwind CSS)
**AI Engine:** Google Gemini Pro/Flash (via @google/genai SDK)
**Visualization Engines:** Recharts (Statistical), D3.js (Network Physics)

---

## 1. Executive Summary & Product Vision

**GUDID Chronicles** is a next-generation Medical Device Supply Chain Analytics platform designed to bridge the gap between raw logistical data and actionable strategic intelligence. In the highly regulated medical device sector, distinct challenges arise from the need to track Unique Device Identification (UDI) codes, regulatory license IDs (e.g., TFDA/FDA), and complex lot-level distribution across hospitals and clinics.

The application serves as a "Digital Twin" of the distribution chain. It ingests raw packing lists (CSV format) and instantly transforms them into an interactive dashboard featuring dynamic filtering, statistical graphing, and a physics-based force-directed graph representing the supply chain network.

Beyond traditional analytics, GUDID Chronicles integrates a **GenAI Agent Headquarters**. This module deploys a squad of 31 specialized AI agents—ranging from "Compliance Officers" to "Seasonal Analysts"—who act upon the filtered dataset to provide narrative insights, anomaly detection, and strategic forecasting using Google's Gemini models.

This document serves as the comprehensive source of truth for the application's design, logic, and user experience, intended for advanced AI model ingestion (OPAL) to facilitate rapid replication or scaling.

---

## 2. User Experience (UX) Narrative & Workflow

The user journey is designed to be linear yet cyclical, encouraging an "Upload -> Analyze -> Refine -> Consult" workflow.

### 2.1. Phase 1: Ingestion & Parsing
The user lands on a clean, minimal interface styled with a "Slate" and "Blue" color palette (`bg-slate-50`). The primary interaction point is the **Data Ingestion** panel.
*   **Input Mechanism:** A file uploader accepts `.csv` files, or the user can paste raw CSV text directly into a text area.
*   **Immediate Feedback:** Upon file selection or text entry, the application uses a client-side parser to convert the CSV string into a structured JSON array of `PackingListItem` objects.
*   **Robustness:** The parser is resilient to common CSV errors, such as trailing commas, inconsistent quoting (handling double quotes within values), and whitespace issues.

### 2.2. Phase 2: The Analytical Dashboard (The "Control Room")
Once data is loaded, the view defaults to the **Data Dashboard**.
*   **KPI Ticker:** The top of the dashboard features four high-impact cards displaying `Total Records`, `Active Customers` (unique count), `Unique Devices` (unique count), and `Total Units Shipped` (summation). These update instantly based on active filters.
*   **Dynamic Filtering Engine:** A sophisticated filter bar allows the user to slice the data. Users select a field (e.g., "Customer") and then a specific value (e.g., "General Hospital").
    *   *UX Detail:* The "Value" dropdown is reactive; it only populates with values available in the dataset for the selected field, sorted alphabetically.
    *   *Visual Feedback:* When a filter is active, a "Clear Filter" button appears, and an informational banner alerts the user that visualizations are showing a subset of data.
*   **Tabular Data:** Three specific tables provide granular views:
    1.  **Recent Transactions:** A chronological view of the latest shipments.
    2.  **Category Stats:** A breakdown of `DeviceCategory` counts.
    3.  **Regulatory Licenses:** A leaderboard of the most frequently used license IDs, critical for compliance monitoring.

### 2.3. Phase 3: Visual Intelligence
The dashboard renders four statistical charts and one physics simulation:
1.  **Customer Volume (Bar Chart):** Visualizes the top 10 customers by order frequency.
2.  **Category Distribution (Pie Chart):** Shows the market share of different medical device categories.
3.  **Delivery Timeline (Line Chart):** plots shipment frequency over time to identify trends or seasonality.
4.  **Model Frequency (Vertical Bar Chart):** Identifies the highest-velocity product models.
5.  **Supply Chain Network (D3 Force Graph):** A complex, interactive node-link diagram.
    *   *Nodes:* Suppliers (Orange), Devices (Green), Customers (Blue).
    *   *Physics:* Nodes repel each other (charge -300) while links pull connected entities together. Users can drag nodes to untangle the network and visualize relationships visually.

### 2.4. Phase 4: The Agent Headquarters
The user switches tabs to the **Agent Headquarters**.
*   **Context Awareness:** If the user applied a filter in the Dashboard (e.g., filtered for "Pacemakers"), the Agent Headquarters displays a warning that the AI will analyze only the *filtered* dataset. This allows for hyper-targeted analysis (e.g., "Analyze anomalies ONLY for Customer X").
*   **Agent Selection:** The user selects from 31 specialized personas.
*   **Prompt Customization:** The system pre-loads a professionally engineered prompt template for that agent. The user can modify this prompt before execution.
*   **Model Selection:** Users choose between `Gemini 3 Flash` (for speed) or `Gemini 3 Pro` (for complex reasoning).
*   **Execution:** The system constructs a prompt combining the User's Instruction + The JSON Data Context + System Instructions. The result is streamed back and rendered in a Markdown-friendly window.

---

## 3. Functional Specifications: Technical Deep Dive

### 3.1. Data Structures & Typing
The application is strictly typed using TypeScript interfaces to ensure data integrity across the pipeline.

**Core Entity: `PackingListItem`**
```typescript
interface PackingListItem {
  Suppliername: string;    // e.g., "B00079"
  deliverdate: string;     // e.g., "45968" (Excel serial) or ISO date
  customer: string;        // e.g., "C05278"
  licenseID: string;       // e.g., "衛部醫器輸字第033951號"
  DeviceCategory: string;  // e.g., "Pacemaker Pulse Generator"
  UDI: string;             // e.g., "00802526576331" (GTIN-14)
  DeviceName: string;      // e.g., "Boston Scientific Ingenio"
  LotNumber: string;       // e.g., "890057"
  SN: string;              // Serial Number (optional)
  ModelNum: string;        // e.g., "L111"
  Numbers: string;         // Quantity (parsed as string, converted to int for math)
  Unit: string;            // e.g., "Set", "Pcs"
}
```

**Core Entity: `Agent`**
```typescript
interface Agent {
  name: string;            // Display Name (e.g., "總結分析師")
  role: string;            // English Role (e.g., "Summary Analyst")
  description: string;     // Short tooltip description
  prompt_template: string; // The engineering structure for the LLM query
}
```

### 3.2. Filtering Logic & State Management
The application utilizes React's `useState` for UI control and `useMemo` for performance optimization.

*   **State Variables:**
    *   `csvInput`: Raw string data.
    *   `packingData`: The full parsed array.
    *   `filterField`: The column key selected for filtering.
    *   `filterValue`: The specific value selected.
*   **Memoized Filter Logic:**
    To prevent UI lag during re-renders (e.g., when dragging a graph node), the filtered dataset is memoized.
    ```typescript
    const filteredData = useMemo(() => {
        if (!filterField || !filterValue) return packingData;
        return packingData.filter(item => item[filterField] === filterValue);
    }, [packingData, filterField, filterValue]);
    ```
    This ensures that the expensive filter operation only runs when the criteria actually change, not when unrelated state updates occur.

### 3.3. Visualization Engines

#### 3.3.1. Recharts Implementation
The charts use `Recharts` for declarative, React-component-based rendering.
*   **Data Transformation:** Raw `PackingListItem` arrays are transformed into aggregated objects `{ name: string, value: number }` before being passed to components.
*   **Sorting:** All chart data is sorted descending by value to ensure the most relevant data is on the left/top.
*   **Styling:** A consistent color palette (`#0088FE`, `#00C49F`, `#FFBB28`, `#FF8042`) is used across Pie and Bar charts for visual cohesion. Tooltips are enabled for granular data inspection.

#### 3.3.2. D3.js Force Directed Graph
The `SupplyChainGraph` component bypasses React's virtual DOM for the actual node rendering, utilizing a `ref` to an SVG element and manipulating it directly with D3.js.
*   **Node Extraction:** The code iterates through the data to extract unique Suppliers, Devices, and Customers, assigning them Group IDs (1, 2, 3).
*   **Link Creation:** Logic creates links: `Supplier -> Device` and `Device -> Customer`.
*   **Simulation Physics:**
    *   `d3.forceManyBody().strength(-300)`: Creates a strong repulsion between nodes, preventing overlap and creating a "spread out" network.
    *   `d3.forceLink().distance(100)`: Sets a standard length for connections, creating readable edges.
    *   `d3.forceCenter()`: Keeps the graph centered in the viewport.
*   **Interactivity:** A d3 drag behavior is attached to nodes (`d3.drag()`), allowing users to manipulate the graph layout in real-time. The simulation creates an "organic" feel where the supply chain "settles" into a stable state.

### 3.4. The AI Orchestration Layer

#### 3.4.1. Service Architecture
The interaction with the LLM is encapsulated in `geminiService.ts`.
*   **Initialization:** It initializes the `GoogleGenAI` client securely using `process.env.API_KEY`.
*   **Content Generation:** It uses `ai.models.generateContent`.
*   **System Instructions:** It passes a system instruction (`"You are {agent.name}, a specialized..."`) to prime the model's persona before the actual data is processed.

#### 3.4.2. Prompt Engineering Strategy
The application employs a "Few-Shot" or "Context-Injection" strategy.
1.  **Persona Definition:** Defined by the `Agent` object.
2.  **Context Injection:** The filtered JSON data (up to a safe token limit, currently sliced to 50 items for demo performance) is injected into the `{{input}}` placeholder.
3.  **Task Definition:** The `prompt_template` contains the specific query (e.g., "Analyze the following data for anomalies...").

---

## 4. The Agent Persona Library (Detailed Specification)

The core intelligence of GUDID Chronicles resides in its 31 distinct agent definitions. These are hardcoded in `constants.ts` but designed to be modular.

### 4.1. Strategic & Overview Agents
1.  **Summary Analyst (總結分析師):** Focuses on high-level volume metrics, top performers, and general health of the supply chain.
2.  **CEO Assistant (執行長助理):** Extracts "One Big Thing"—the single most critical insight for executive leadership.
3.  **Trend Forecaster (銷售趨勢預測師):** Analyzes `deliverdate` sequences to predict future demand spikes.
4.  **Seasonality Expert (季節性分析師):** Looks for cyclical patterns (e.g., end-of-quarter pushes).

### 4.2. Operational & Logistics Agents
5.  **Supply Chain Expert (供應鏈路徑專家):** Maps the flow from B000xx (Supplier) to C00xxx (Customer). Identifies bottlenecks.
6.  **Inventory Consultant (庫存優化顧問):** Analyzes `Numbers` vs. frequency to suggest Safety Stock levels.
7.  **Efficiency Auditor (交付效率評估員):** Checks order consolidation. Are we shipping 1 unit 10 times, or 10 units 1 time?
8.  **Turnover Calculator (庫存週轉計算器):** Estimates velocity of stock movement.
9.  **Urgent Order Analyst (緊急訂單分析):** Detects small, irregular shipments that might indicate emergency surgeries.
10. **Supplier Auditor (供應商績效分析):** Evaluates reliability of `Suppliername` entities.

### 4.3. Compliance & Risk Agents
11. **Compliance Officer (合規性檢查員):** Validates `licenseID` format (e.g., ensuring "衛部醫器" prefix).
12. **License Monitor (授權期限監控):** Checks for license diversity and potential expiration risks based on ID patterns.
13. **Risk Manager (風險管理顧問):** Identifies Single Points of Failure (SPOF) in the supplier network.
14. **Privacy Auditor (數據隱私審查員):** Heuristic scan for potential PII leakage in free-text fields.
15. **Reg Report Gen (監管報告生成器):** Formats output specifically for FDA/TFDA submission.

### 4.4. Product & Quality Agents
16. **Anomaly Detector (異常偵測員):** Statistical outlier detection for quantity or lot numbers.
17. **Lot Tracer (批號追溯專員):** Critical for recalls. Maps a specific `LotNumber` to all `Customers`.
18. **SN Validator (序列號完整性檢查):** Checks `SN` field for duplicates (critical for implants).
19. **Product Lifecycle (產品生命週期分析師):** Identifies if older `ModelNum`s are fading out.
20. **Category Classifier (醫療類別分類員):** Aggregates data by `DeviceCategory`.
21. **UDI Parser (UDI解析專家):** Attempts to decode the GS1/HIBCC logic within the `UDI` string.
22. **Return Predictor (退貨預測模型):** Correlates lot dispersion with potential quality issues.
23. **Implant Tracker (植入物追蹤專員):** Filters specifically for devices categorized as "Implantable".
24. **Model Migration (型號迭代顧問):** Analysis of product substitution patterns.

### 4.5. Sales & Customer Agents
25. **Customer Segmenter (客戶分層分析師):** RFC (Recency, Frequency, Monetary) proxy analysis using quantity.
26. **Geo Analyst (地理分佈專家):** Infers geography from Customer ID clusters.
27. **Competitor Analyst (競爭產品分析師):** Benchmarks `DeviceName` performance against inferred competitors.
28. **Pricing Strategist (定價策略顧問):** Analyzes `Unit` types (Set vs. Pcs) for bundling opportunities.
29. **Key Account Mgr (關鍵客戶經理):** Generates QBR (Quarterly Business Review) narratives for top clients.
30. **Association Miner (產品關聯分析師):** Market Basket Analysis—what items ship together?

### 4.6. Data Utility Agents
31. **Data Cleaner (數據清洗機器人):** Suggests JSON formatting and identifies dirty data rows.

---

## 5. UI Design System & Component Architecture

The visual language of GUDID Chronicles is professional, clinical, and data-dense.

### 5.1. Color Palette
*   **Background:** `bg-slate-50` (soft, professional grey-white).
*   **Primary Brand:** Gradient `from-blue-600 to-indigo-600`. Used for headers, active tabs, and primary action buttons.
*   **Accents:**
    *   *Emerald (Green):* Active Customers / Success states.
    *   *Orange:* Units / Suppliers (in D3).
    *   *Indigo:* Devices / Customers (in D3).
    *   *Red:* Clear Filter / Error states.

### 5.2. Layout Structure
*   **Header:** Sticky top, containing the Logo (🧬) and Tab Navigation (`Data Dashboard` vs `Agent Headquarters`).
*   **Main Container:** Centered `max-w-7xl`, responsive padding `px-4 sm:px-6 lg:px-8`.
*   **Card Design:** `bg-white`, `rounded-xl`, `shadow-sm`, `border border-gray-100`. This "card" metaphor is used for KPIs, Charts, Tables, and the Agent Executor.

### 5.3. CSS Animations
*   **`animate-fade-in`:** A utility class to smooth the transition when switching tabs or applying filters.
*   **Hover Effects:** Buttons and table rows feature subtle background shifts (`hover:bg-gray-50`) to indicate interactivity.
*   **Loading States:** The Agent Executor button features a spinning SVG circle when `isLoading` is true, and the button gradient shifts to grey.

---

## 6. Data Dictionary (Internal Schema)

For the purpose of AI analysis, the application understands the following specific column semantics:

*   **Suppliername:** The entity originating the shipment.
*   **deliverdate:** The temporal anchor. Can be Excel serial (e.g., 45968) or string.
*   **customer:** The destination entity. Analyzed for demand patterns.
*   **licenseID:** The regulatory approval key. Analyzed for compliance.
*   **DeviceCategory:** High-level grouping (e.g., "Pacemaker").
*   **UDI:** The global unique identifier.
*   **DeviceName:** The commercial trade name.
*   **LotNumber:** The production batch. Critical for traceability.
*   **SN:** The individual unit identifier.
*   **ModelNum:** The manufacturer's catalog number.
*   **Numbers:** The quantity of units in the specific line item.
*   **Unit:** The unit of measure (UOM).

---

## 7. Future Roadmap & OPAL Directives

When extending this system, the following modules are planned:

1.  **PDF Ingestion:** Integration of a client-side PDF parser (e.g., `pdf.js`) to scrape packing lists from scanned documents.
2.  **Live API Connection:** Replacing the `GeminiService` REST-like call with the Gemini Live API for real-time, conversational interrogation of the dataset (WebSocket based).
3.  **Geo-Mapping:** Integration with Google Maps Platform to plot `Customer` locations on a physical map if address data is available.
4.  **Persistent Storage:** Moving from client-side state to a local database (IndexedDB) or cloud backend (Firebase) to save analysis history.

---

**End of Specification**
