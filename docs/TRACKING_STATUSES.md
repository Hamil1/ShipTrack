# Tracking Statuses Reference

ShipTrack supports standardized tracking statuses across all carriers for consistent user experience.

## 📦 Standard Statuses

### Primary Statuses

| Status               | Description                                      | Color  | Icon |
| -------------------- | ------------------------------------------------ | ------ | ---- |
| **Pending**          | Package is being processed but not yet picked up | Gray   | ⏳   |
| **In Transit**       | Package is moving between facilities             | Yellow | 🚚   |
| **Out for Delivery** | Package is with local delivery driver            | Blue   | 🚛   |
| **Delivered**        | Package has been successfully delivered          | Green  | ✅   |
| **Exception**        | Delivery issue or delay encountered              | Red    | ⚠️   |
| **Unknown**          | Status cannot be determined (Most of the time because we couldn't map the status from the carrier API)                     | Gray   | ❓   |

### Status Definitions

#### 🟡 **Pending**

- Package is being processed at origin
- Label created but not yet picked up
- Awaiting carrier pickup
- **Examples**: "Label Created", "Shipment Information Sent"

#### 🟡 **In Transit**

- Package is actively moving between locations
- Includes sorting, transportation, and facility transfers
- **Examples**: "In Transit", "Arrived at Facility", "Departed Facility"

#### 🔵 **Out for Delivery**

- Package is with local delivery driver
- Final delivery attempt in progress
- **Examples**: "Out for Delivery", "On Vehicle for Delivery"

#### 🟢 **Delivered**

- Package successfully delivered to recipient
- Final status - no further updates expected
- **Examples**: "Delivered", "Package Delivered"

#### 🔴 **Exception**

- Delivery issue or delay encountered
- Requires attention or action
- **Examples**: "Delivery Exception", "Failed Delivery", "Address Issue"

#### ⚪ **Unknown**

- Status cannot be determined
- API error or invalid tracking number
- **Examples**: "Status Unavailable", "Tracking Not Found"