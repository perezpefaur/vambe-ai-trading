import { MarketData, Portfolio, Position, Trade } from "@/lib/types";
import {
  NotbankAccountInfo,
  NotbankOrder,
  NotbankOrderBook,
  NotbankPosition,
  NotbankTicker,
} from "@/lib/types/notbank";
import { NotbankClient } from "notbank";

export class NotbankTradingClient {
  private client: any;
  private accountService: any;
  private tradingService: any;
  private instrumentService: any;
  private apiPublicKey: string;
  private apiSecretKey: string;
  private userId: string;
  private accountId: number;
  private isAuthenticated: boolean = false;

  constructor(
    apiPublicKey: string,
    apiSecretKey: string,
    userId: string = "",
    accountId?: number
  ) {
    this.apiPublicKey = apiPublicKey;
    this.apiSecretKey = apiSecretKey;
    this.userId = userId;
    this.accountId = accountId || 0; // Will be set during auth if not provided
    this.client = NotbankClient.Factory.createRestClient();
  }

  private async authenticate() {
    if (this.isAuthenticated) return;

    try {
      await this.client.authenticateUser({
        ApiPublicKey: this.apiPublicKey,
        ApiSecretKey: this.apiSecretKey,
        UserId: this.userId,
      });

      this.accountService = this.client.getAccountService();
      this.tradingService = this.client.getTradingService();
      this.instrumentService = this.client.getInstrumentService();

      // Use provided account ID or try to get it from user info
      if (!this.accountId) {
        try {
          const userInfo = await this.client.getUserInfo();
          console.log("User info:", userInfo);

          if (userInfo && userInfo.AccountId) {
            this.accountId = userInfo.AccountId;
          } else {
            // Try to get account info as fallback
            const accountInfo = await this.accountService.getAccountInfo();
            console.log("Account info from getAccountInfo:", accountInfo);
            this.accountId = accountInfo.AccountId;
          }
        } catch (err) {
          console.log("Error getting account info:", err);
          throw new Error(
            "Account ID is required. Please provide NOTBANK_ACCOUNT_ID in environment variables."
          );
        }
      }

      console.log("Using AccountId:", this.accountId);
      this.isAuthenticated = true;
    } catch (error) {
      console.error("Authentication failed:", error);
      throw error;
    }
  }

  async getMarketData(symbols: string[]): Promise<MarketData[]> {
    await this.authenticate();

    try {
      const marketData: MarketData[] = [];

      for (const symbol of symbols) {
        const orderBook = await this.tradingService.getOrderBook({
          Market_Pair: symbol.replace("/", ""),
          Depth: 1,
          Level: 1,
        });

        const ticker = await this.tradingService.getTickerHistory({
          InstrumentId: await this.getInstrumentId(symbol),
          Count: 1,
        });

        const lastTicker = ticker && ticker.length > 0 ? ticker[0] : null;

        marketData.push({
          symbol,
          price:
            orderBook.Asks && orderBook.Asks.length > 0
              ? orderBook.Asks[0].Price
              : lastTicker?.LastPrice || 0,
          change24h: lastTicker?.ChangePercent || 0,
          volume24h: lastTicker?.Volume24H || 0,
          high24h: lastTicker?.High24H || 0,
          low24h: lastTicker?.Low24H || 0,
        });
      }

      return marketData;
    } catch (error) {
      console.error("Error fetching market data:", error);
      // Return mock data for development
      return symbols.map((symbol) => ({
        symbol,
        price: Math.random() * 50000 + 10000,
        change24h: (Math.random() - 0.5) * 10,
        volume24h: Math.random() * 1000000,
        high24h: Math.random() * 55000 + 10000,
        low24h: Math.random() * 45000 + 10000,
      }));
    }
  }

  async getPortfolio(): Promise<Portfolio> {
    await this.authenticate();

    try {
      // Get all positions including pending
      const allPositions: NotbankPosition[] =
        await this.accountService.getAccountPositions({
          AccountId: this.accountId,
          IncludePending: true,
        });

      // Find USD/USDT position for cash balance (not crypto with USD notional)
      const cashPosition = allPositions.find(
        (position: NotbankPosition) =>
          position.ProductSymbol === "USD" || position.ProductSymbol === "USDT"
      );

      console.log("cashPosition", cashPosition);

      // If we have a USD position, use its amount, otherwise user is fully invested
      let cashBalance = 0;
      if (cashPosition) {
        cashBalance = cashPosition.Amount || cashPosition.AvailableBalance || 0;
      } else {
        // No USD position found, user is fully invested in crypto
        console.log("No USD position found, user is fully invested");
        cashBalance = 0;
      }

      console.log("Actual USD cashBalance:", cashBalance);

      // Filter positions with actual holdings (Amount > 0)
      const tradingPositions = allPositions.filter(
        (pos: NotbankPosition) =>
          pos.Amount > 0 &&
          pos.ProductSymbol !== "USD" &&
          pos.ProductSymbol !== "USDT"
      );

      const formattedPositions: Position[] = await Promise.all(
        tradingPositions.map(async (pos: NotbankPosition) => {
          const quantity = pos.Amount || 0;
          const symbol = pos.ProductSymbol || "UNKNOWN";

          // Use NotionalRate as current price (this is the current market price)
          // NotionalValue is the current total value of the position
          const currentPrice = pos.NotionalRate || 0;
          const currentNotionalValue = pos.NotionalValue || 0;

          // Calculate average entry price from the start of day balance
          // If we don't have start of day, estimate from current values
          const averagePrice =
            pos.StartOfDayBalanceNotional > 0 && quantity > 0
              ? pos.StartOfDayBalanceNotional / quantity
              : currentPrice;

          // P&L calculation
          const pnl = currentNotionalValue - quantity * averagePrice;
          const pnlPercent =
            averagePrice > 0 && quantity > 0
              ? (pnl / (quantity * averagePrice)) * 100
              : 0;

          return {
            symbol,
            quantity,
            averagePrice,
            currentPrice,
            notional: currentNotionalValue,
            pnl,
            pnlPercent,
            lastUpdated: new Date(),
          };
        })
      );

      // Calculate total portfolio value
      const totalPositionsValue = formattedPositions.reduce(
        (acc, pos) => acc + pos.notional,
        0
      );
      const totalValue = cashBalance + totalPositionsValue;
      const totalPnl = formattedPositions.reduce(
        (acc, pos) => acc + pos.pnl,
        0
      );
      const totalPnlPercent =
        totalValue > 0 ? (totalPnl / totalValue) * 100 : 0;

      return {
        totalValue,
        cashBalance,
        positions: formattedPositions,
        totalPnl,
        totalPnlPercent,
      };
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      // Return mock portfolio for development
      return {
        totalValue: 10000,
        cashBalance: 5000,
        positions: [],
        totalPnl: 0,
        totalPnlPercent: 0,
      };
    }
  }

  async executeTrade(
    symbol: string,
    side: "buy" | "sell",
    quantity: number,
    price?: number
  ): Promise<Trade> {
    await this.authenticate();

    try {
      const instrumentId = await this.getInstrumentId(symbol);

      const orderResult = await this.tradingService.sendOrder({
        InstrumentId: instrumentId,
        AccountId: this.accountId,
        Side: side === "buy" ? 0 : 1, // 0 = Buy, 1 = Sell
        OrderType: price ? 2 : 1, // 1 = Market, 2 = Limit
        Quantity: quantity,
        ...(price && { LimitPrice: price }),
      });

      return {
        id: orderResult.OrderId.toString(),
        symbol,
        side,
        price: orderResult.Price || price || 0,
        quantity: quantity,
        notional: quantity * (orderResult.Price || price || 0),
        fee: orderResult.Fee || 0,
        timestamp: new Date(),
        status: "pending",
      };
    } catch (error) {
      console.error("Error executing trade:", error);
      // Return mock trade for development
      return {
        id: Date.now().toString(),
        symbol,
        side,
        price: price || Math.random() * 50000 + 10000,
        quantity,
        notional: quantity * (price || Math.random() * 50000 + 10000),
        fee: 0.001 * quantity * (price || Math.random() * 50000 + 10000),
        timestamp: new Date(),
        status: "completed",
      };
    }
  }

  async getRecentTrades(limit: number = 50): Promise<Trade[]> {
    await this.authenticate();

    try {
      // Use correct parameters based on GetOrdersHistoryRequest interface
      const orders = await this.tradingService.getOrderHistory({
        AccountId: this.accountId,
      });

      console.log("Fetched orders:", orders);

      // Handle case where no orders are returned
      if (!orders || !Array.isArray(orders)) {
        console.log("No orders found");
        return [];
      }

      return orders
        .filter((order: NotbankOrder) => {
          const state = order.OrderState;
          return (
            state === "FullyExecuted" ||
            state === "Filled" ||
            state === 3 || // Numeric state for FullyExecuted
            state === "3" // String version of numeric state
          );
        })
        .map((order: NotbankOrder) => ({
          id: order.OrderId?.toString() || Date.now().toString(),
          symbol: order.InstrumentSymbol || order.Symbol || "UNKNOWN",
          side: order.Side === 0 ? ("buy" as const) : ("sell" as const),
          price: order.Price || order.AveragePrice || 0,
          quantity: order.Quantity || 0,
          notional:
            (order.Quantity || 0) * (order.Price || order.AveragePrice || 0),
          fee: order.OrderFee || 0,
          timestamp: order.ReceiveTime
            ? new Date(order.ReceiveTime)
            : new Date(),
          status: "completed" as const,
        }));
    } catch (error) {
      console.error("Error fetching recent trades:", error);
      // Return empty array for development
      return [];
    }
  }

  async cancelAllOrders(): Promise<void> {
    await this.authenticate();

    try {
      const openOrders = await this.tradingService.getOpenOrders({
        AccountId: this.accountId,
      });

      for (const order of openOrders) {
        await this.tradingService.cancelOrder({
          OrderId: order.OrderId,
          AccountId: this.accountId,
        });
      }
    } catch (error) {
      console.error("Error cancelling orders:", error);
    }
  }

  private async getInstrumentId(symbol: string): Promise<number> {
    try {
      const instruments = await this.instrumentService.getInstruments();
      const instrument = instruments.find(
        (i: any) => i.Symbol === symbol.replace("/", "") || i.Symbol === symbol
      );
      return instrument ? instrument.InstrumentId : 1;
    } catch (error) {
      console.error("Error getting instrument ID:", error);
      return 1; // Default to BTC for development
    }
  }
}
