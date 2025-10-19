// Notbank API Response Types

export interface NotbankPosition {
  OMSId: number;
  AccountId: number;
  ProductSymbol: string;
  ProductId: number;
  Amount: number;
  Hold: number;
  MarginLiability: number;
  MarginLend: number;
  PendingDeposits: number;
  PendingWithdraws: number;
  TotalDayDeposits: number;
  TotalMonthDeposits: number;
  TotalYearDeposits: number;
  TotalDayDepositNotional: number;
  TotalMonthDepositNotional: number;
  TotalYearDepositNotional: number;
  TotalDayWithdraws: number;
  TotalMonthWithdraws: number;
  TotalYearWithdraws: number;
  TotalDayWithdrawNotional: number;
  TotalMonthWithdrawNotional: number;
  TotalYearWithdrawNotional: number;
  NotionalProductId: number;
  NotionalProductSymbol: string;
  NotionalValue: number;
  NotionalHoldAmount: number;
  NotionalRate: number;
  TotalDayTransferNotional: number;
  TotalDayInflowsAndOutflowsNotional: number;
  StartOfDayBalanceNotional: number;
  AvailableBalance: number;
  AvailableBalanceNotional: number;
  PendingDepositsNotional: number;
}

export interface NotbankAccountInfo {
  LedgerId: number;
  OMSID: number;
  AccountId: number;
  AccountName: string;
  AccountHandle: string | null;
  FirmId: string | null;
  FirmName: string | null;
  AccountType: string;
  FeeGroupId: number;
  ParentID: number;
  RiskType: string;
  MarginAccountStatus: string;
  VerificationLevel: number;
  VerificationLevelName: string | null;
  CreditTier: number;
  FeeProductType: string;
  FeeProduct: number;
  RefererId: number;
  LoyaltyProductId: number;
  LoyaltyEnabled: boolean;
  PriceTier: number;
  Frozen: boolean;
  DateTimeUpdated: string;
  DateTimeCreated: string;
}

export interface NotbankOrderBook {
  Asks: Array<{
    Price: number;
    Quantity: number;
  }>;
  Bids: Array<{
    Price: number;
    Quantity: number;
  }>;
}

export interface NotbankTicker {
  LastPrice: number;
  ChangePercent: number;
  Volume24H: number;
  High24H: number;
  Low24H: number;
}

export interface NotbankOrder {
  OrderId: number;
  OrderState: string | number; // Can be string like "FullyExecuted" or numeric state
  InstrumentSymbol?: string;
  Symbol?: string;
  InstrumentId?: number;
  Side: number; // 0 = Buy, 1 = Sell
  Price?: number;
  AveragePrice?: number;
  Quantity?: number;
  OrderFee?: number;
  ReceiveTime?: string;
  ClientOrderId?: number;
  OriginalOrderId?: number;
  OrderType?: number;
  TimeInForce?: number;
  StopPrice?: number;
}