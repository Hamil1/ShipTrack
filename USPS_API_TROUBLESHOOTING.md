# USPS API Troubleshooting Guide

## 🚨 USPS API Issue

### Geographic Restrictions ("Address Not Eligible")

**Problem**: USPS Web Tools API has geographic restrictions and may not be available even using a US address.

**Error Messages**:

- "Your address is not eligible"

**Workaround**:

#### I used USPS Mock Data

The application automatically falls back to mock data when USPS API is unavailable:

```json
{
  "trackingNumber": "9400100000000000000000",
  "carrier": "USPS",
  "status": "Delivered",
  "location": "Chicago, IL",
  "description": "Package delivered to recipient"
}
```

