## Overview

Didit provides KYC (Know Your Customer) identity verification services with global coverage supporting 220+ countries, 3,000+ document types, and 130+ languages. For Domera, we'll implement this for non-organization users who need identity verification before making unit reservations.

## 1. Verification Flow

### Session Lifecycle
1. **NOT_STARTED** → Create verification session
2. **IN_PROGRESS** → User begins verification
3. **IN_REVIEW** → Documents submitted for review
4. **Final States:** `APPROVED` | `DECLINED` | `EXPIRED` | `ABANDONED`

### Implementation Approach
**Use Verification Links**
- Generate secure verification URL
- User completes on Didit's hosted interface
- Webhooks provide status updates

## 2. Free Tier Services (Unlimited)
- **ID Verification** - Document authenticity
- **Passive Liveness** - Anti-spoofing detection
- **Face Match 1:1** - Biometric comparison
- **NFC Verification** - Chip-based document reading
- **IP Analysis** - Geolocation and risk assessment

## Implementation Notes for Domera

### Integration Points
1. **User Registration** - Optional KYC during signup
2. **Unit Reservation** - Required KYC before reservation
3. **Profile Management** - Verification status display
4. **Admin Dashboard** - Verification oversight

### User Experience Flow
1. User attempts unit reservation
2. System checks verification status
3. If not verified, redirect to KYC flow
4. User completes verification on Didit
5. Webhook updates user status
6. User can proceed with reservation

### Business Logic
- Verification required for financial transactions
- Optional for browsing and basic actions
- Clear communication of requirements
- Smooth fallback for unverified users

This reference document provides all technical details needed for implementing Didit KYC verification in the Domera platform.