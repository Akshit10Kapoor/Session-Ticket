# Season Tickets - Sports Subscription Management

A deliberately buggy sports season ticket management platform. Designed as a 2.5-hour debugging challenge with ~18 intentionally planted bugs.

## Quick Start

### Prerequisites
- Node.js 18+
- npm

### Running Locally

```bash
# Install dependencies
npm install

# Create .env file
npm run dev

# Run application
npm start
```

The application will be available at `http://localhost:3001`

### Development Mode

```bash
npm run dev
```

## API Endpoints

### Teams
- `GET /api/teams` - List all teams
- `GET /api/teams/:id/packages` - Get subscription packages for team

### Subscriptions
- `GET /api/subscriptions/:id` - Get subscription details
- `POST /api/subscriptions` - Create new subscription
- `PUT /api/subscriptions/:id/renew` - Renew subscription
- `POST /api/subscriptions/:id/cancel` - Cancel subscription
- `POST /api/subscriptions/:id/use-ticket` - Use/redeem a ticket
- `POST /api/subscriptions/:id/assign-ticket` - Assign a ticket to a subscription (testing helper)
- `PUT /api/subscriptions/:id/settings` - Update subscription settings
- `POST /api/subscriptions/:id/calculate-price` - Calculate pro-rated price
- `POST /api/subscriptions/process-renewals` - Trigger renewal worker (admin)

### Authentication
- `POST /api/auth/token` - Generate access token
- `POST /api/auth/validate` - Validate token
- `POST /api/auth/logout` - Invalidate token

## Known Bugs (18 total)
## Debugging Tips

- Test each endpoint with valid and invalid inputs
- Check database queries for typos in table/column names
- Verify async/await usage in all async functions
- Look for missing WHERE clauses in UPDATE/DELETE queries
- Check authentication middleware implementation
- Validate input data before database operations
- Verify status codes match expected HTTP standards
- Check for proper error handling in try-catch blocks

## Testing the Endpoints

After fixing bugs, test with:

```bash
cd tests
node endpoint_tester.js http://localhost:3001
```
or
```bash
cd tests
python endpoint_tester.py
```

