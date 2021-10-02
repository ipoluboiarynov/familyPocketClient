export interface Record {
  id?: string;
  date: string;
  type: any;
  amount: number;
  comment?: string;
  accountId: string;
  categoryId: string;
  userId: string;
  currencyId: string;
}
