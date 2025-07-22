# Adding a New Carrier to ShipTrack

This guide shows how to add a new carrier in **5-10 minutes**. With the help of Dependency Injection and Configuration-based architecture.

## 🚀 Quick Start (3 Steps)

### Step 1: Create Config File (2 minutes)

Create `config/carriers/yourcarrier.json`:

```json
{
  "name": "Your Carrier",
  "pattern": "^[A-Z]{2}[0-9]{10}$",
  "apiEndpoint": "https://api.yourcarrier.com",
  "authType": "bearer",
  "mockData": {
    "AB1234567890": {
      "trackingNumber": "AB1234567890",
      "carrier": "Your Carrier",
      "status": "In Transit",
      "location": "New York, NY",
      "description": "Package in transit"
    }
  }
}
```

### Step 2: Add API Integration (Optional, 5 minutes)

If you need real API integration, create `src/providers/YourCarrierProvider.ts`:

```typescript
import { BaseCarrierProvider } from "./BaseCarrierProvider";
import { TrackingInfo } from "@/types/carrier";

export class YourCarrierProvider extends BaseCarrierProvider {
  async track(trackingNumber: string): Promise<TrackingInfo> {
    const response = await this.makeRequest("/track", {
      method: "POST",
      body: JSON.stringify({ trackingNumber }),
    });

    const data = await response.json();

    return {
      trackingNumber: trackingNumber,
      carrier: this.config.name,
      status: this.mapStatus(data.status),
      location: data.location,
      timestamp: new Date(data.timestamp),
      description: data.description,
      events: data.events || [],
    };
  }
}
```

### Step 3: Test (2 minutes)

```bash
# Start the app
npm run dev

# Or start the app with docker
docker compose --profile dev up --build

# Test your carrier
npm test
```

## 📋 Configuration Options

### Authentication Types

```json
{
  "authType": "none"        // No auth needed
  "authType": "bearer"      // Bearer token
  "authType": "oauth"       // OAuth 2.0
  "authType": "api_key"     // API key
}
```

## 🧪 Testing

Test with a tracking number that matches your pattern:

```bash
curl -X POST http://localhost:3000/api/track \
  -H "Content-Type: application/json" \
  -d '{"trackingNumber": "AB1234567890"}'
```

## 📊 Examples

### Mock Only (5 minutes)

```json
{
  "name": "Local Courier",
  "pattern": "^LC[0-9]{8}$",
  "authType": "none",
  "mockData": {
    "LC12345678": {
      "trackingNumber": "LC12345678",
      "carrier": "Local Courier",
      "status": "Delivered",
      "location": "Chicago, IL"
    }
  }
}
```

### With API (10 minutes)

```json
{
  "name": "API Carrier",
  "pattern": "^AC[0-9]{10}$",
  "apiEndpoint": "https://api.carrier.com",
  "authType": "bearer",
  "endpoints": {
    "track": "/track"
  }
}
```

## 🎯 That's It!

- **Mock only**: 5 minutes, 1 file
- **With API**: 10 minutes, 2 files
- **Automatic registration**: No code changes needed
- **Graceful fallback**: Works even if API fails

Your carrier is now ready to use! 🚀
