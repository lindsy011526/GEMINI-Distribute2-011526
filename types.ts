export interface PackingListItem {
  Suppliername: string;
  deliverdate: string;
  customer: string;
  licenseID: string;
  DeviceCategory: string;
  UDI: string;
  DeviceName: string;
  LotNumber: string;
  SN: string;
  ModelNum: string;
  Numbers: string;
  Unit: string;
}

export interface Agent {
  name: string;
  role: string;
  description: string;
  prompt_template: string;
}

export interface AnalysisSummary {
  totalRecords: number;
  uniqueCustomers: number;
  uniqueDevices: number;
  topCustomer: string;
  topDevice: string;
}

export enum LLMModel {
  GEMINI_FLASH = 'gemini-3-flash-preview',
  GEMINI_PRO = 'gemini-3-pro-preview',
}