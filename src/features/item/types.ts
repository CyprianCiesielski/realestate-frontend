export interface Item {
  id: number;
  name: string;
  status: string;
  state: string;
  description?: string;
  deadline?: string;
  startDate: string;
  lastChangeDate: string;
  webViewLink?: string;
  googleFileId?: string;
}
