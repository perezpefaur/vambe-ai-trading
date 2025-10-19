# Vambe AI Trading Platform

An AI-powered cryptocurrency trading platform that uses OpenRouter and Notbank Exchange to automatically analyze markets and execute trades.

## Features

- **AI-Powered Trading**: Uses OpenRouter with Claude 3.5 Sonnet to analyze market conditions and generate trading signals
- **Automated Trading**: Can automatically execute trades based on AI recommendations
- **Real-time Portfolio Tracking**: Monitor your portfolio value, positions, and P&L in real-time
- **Risk Management**: Built-in risk controls limiting position sizes to 5% of portfolio
- **Trading History**: Track all completed trades with detailed P&L information
- **Beautiful Dashboard**: Modern, dark-themed UI with real-time charts and updates

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **AI**: OpenRouter API (Claude 3.5 Sonnet)
- **Exchange**: Notbank Exchange SDK
- **Charts**: Recharts
- **State Management**: Zustand
- **Styling**: Tailwind CSS with custom dark theme

## Prerequisites

- Node.js 18+ and pnpm
- OpenRouter API key (get one at https://openrouter.ai)
- Notbank Exchange account and API credentials

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vambe-ai-trading.git
cd vambe-ai-trading
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Then edit `.env` and add your API keys:
- `OPENROUTER_API_KEY`: Your OpenRouter API key
- `NOTBANK_API_KEY`: Your Notbank Exchange API key
- `NOTBANK_API_SECRET`: Your Notbank Exchange API secret

4. Run the development server:
```bash
pnpm dev
```

5. Open http://localhost:3000 in your browser

## Usage

### Manual Trading

1. View your portfolio overview and current positions
2. Monitor the portfolio performance chart
3. Check recent trades in the trades list

### AI-Powered Auto Trading

1. Click "Start Trading" in the AI Trading Control panel
2. The AI will analyze markets every 30 seconds
3. When profitable opportunities are found with >60% confidence, trades are executed automatically
4. Risk is limited to 5% of portfolio per trade
5. Click "Stop Trading" to disable auto-trading

### Risk Settings

- Adjust the "Max Risk Per Trade" slider (1-10% of portfolio)
- Select which trading pairs to monitor
- View current AI signals and reasoning

## API Routes

- `POST /api/trading/execute` - Execute a trade
- `GET /api/portfolio` - Get portfolio and recent trades
- `POST /api/ai/analyze` - Get AI trading analysis

## Security Notes

- Never commit your `.env` file with real API keys
- Use environment variables for all sensitive data
- Consider using a dedicated trading account with limited funds for testing
- The platform uses sandbox mode in development

## Development

```bash
# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Disclaimer

This is an experimental trading platform. Cryptocurrency trading carries significant risk. Only trade with funds you can afford to lose. The AI recommendations are not financial advice.
