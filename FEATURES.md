# Spatchy AI - Feature Availability Guide

## Current Features (Production Ready)

### ✅ Core Dispatch Operations
**Status:** Production Ready  
**Description:** Create, assign, and track loads through the dispatch workflow.

**Features:**
- Load management (create, update, cancel, deliver)
- Driver management and assignment
- Status tracking (new, quoted, booked, in_transit, delivered, cancelled)
- Broker and truck management
- Multi-tenant isolation with Row-Level Security

**Testing:** RLS tests pass, end-to-end workflow validated

---

### ✅ Multi-Tenant Architecture
**Status:** Production Ready  
**Description:** Complete tenant isolation for multiple dispatch organizations.

**Features:**
- Separate organizations with unique data
- Role-based access (Owner, Admin, Dispatcher, Driver, Viewer)
- Tenant switcher UI
- Cross-tenant data isolation enforced at database level

**Security:** RLS policies enforced, validated with test harness

---

### ✅ Command Center Dashboard
**Status:** Production Ready  
**Description:** Single-screen view of operations status.

**Features:**
- Overview health strip (revenue, utilization, risk loads)
- Active loads board (Kanban-style)
- Driver wellness panel (availability, status, location)
- Problem feed (issues requiring attention)
- AI copilot panel (context-aware assistant)
- Mobile-responsive design

**UX:** Tested with stress scenarios, dispatcher-friendly language

---

### ✅ AI Automation with Guardrails
**Status:** Production Ready (Suggest-Only Default)  
**Description:** AI-powered dispatch automation with full control.

**Modes:**
- **Suggest Only (Default):** AI recommends actions, dispatcher approves
- **Auto-Act (Opt-In):** AI executes approved actions automatically
- **Paused:** Emergency stop - AI can only suggest

**Features:**
- Create loads based on natural language
- Assign drivers intelligently
- Update load statuses
- Query operational data
- Propose lane plans
- Summarize daily operations

**Safety:**
- Kill switch always visible
- All actions logged to events table
- Tenant membership validated
- Automation mode configurable per tenant

**Cost Controls:**
- Daily call limits (default: 1000/day)
- Daily token limits (default: 100K/day)
- Daily cost limits (default: $50/day)
- Usage tracking and reporting

**Testing:** AI tool isolation validated, automation modes tested

---

### ✅ System Observability
**Status:** Production Ready  
**Description:** Monitor system health and AI usage.

**Features:**
- System health dashboard (Supabase connectivity, last AI call, failed automations)
- AI usage statistics (calls, tokens, costs)
- Automation value metrics (time saved, loads automated, avg RPM)
- Real-time monitoring (auto-refresh)
- Failed automation queue

**Monitoring:** Checks run every 30 seconds, historical data available

---

## Beta Features (Testing Phase)

### 🧪 Voice Integration (Scaffold Only)
**Status:** Beta - Interface Defined  
**Description:** Voice-enabled load intake and driver communication.

**Current State:**
- Service adapter defined
- Voice agent scaffold created
- Edge function placeholder exists
- **Not connected to live telephony**

**What Works:**
- Data models and types
- Integration points designed
- Future-ready architecture

**What's Missing:**
- Twilio/Asterisk integration
- Live call handling
- Voice transcription
- Call recording

**Timeline:** Phase 2+ (not blocking core dispatch)

**Note:** UI may reference telephony features, but they are aspirational. Do not rely on voice features for core operations.

---

### 🧪 Load Board Integrations (Scaffold Only)
**Status:** Beta - Stub Implementation  
**Description:** Integration with external load boards (DAT, Truckstop, etc.)

**Current State:**
- Interface designed for future integration
- Placeholder functions exist
- **No live API connections**

**What Works:**
- Data models for external loads
- UI prepared for load board data

**What's Missing:**
- API keys and authentication
- Real-time load fetching
- Posting to external boards
- Rate negotiation

**Timeline:** Phase 3+ (after core validation)

**Note:** Any "load board" references in UI are placeholders. Manual load entry is required.

---

## Coming Soon (Roadmap)

### 📋 Planned Features

#### Document Management
- POD (Proof of Delivery) upload
- Rate confirmation storage
- BOL (Bill of Lading) generation
- Document OCR for automated data entry

#### Advanced Analytics
- Lane profitability analysis
- Driver performance metrics
- Broker reliability scoring
- Predictive load recommendations

#### Enhanced Communication
- Automated broker updates
- Driver check-in automation
- SMS/Email templates
- Notification preferences

#### Financial Management
- Invoice generation
- Payment tracking
- Cashflow projections
- Profit/loss by load

#### Compliance & Safety
- Hours of Service (HOS) tracking
- Vehicle maintenance reminders
- Driver qualification file management
- DOT compliance dashboard

---

## Deprecated / Not Available

### ❌ Not Implemented

#### Third-Party Integrations
- **ELD Integrations:** Not connected (Samsara, KeepTruckin, etc.)
- **Accounting Software:** Not connected (QuickBooks, Xero, etc.)
- **Fuel Card Systems:** Not integrated
- **GPS Tracking:** Basic location only, no real-time tracking

#### Advanced Features
- **Predictive Pricing:** Not yet implemented
- **Route Optimization:** Manual routing only
- **Automated Load Posting:** Not available
- **Credit Checks:** Not integrated

---

## Feature Request Process

### How to Request a Feature
1. Submit via support@spatchy.ai
2. Include: Problem statement, use case, expected benefit
3. We'll respond within 2 business days

### Priority Criteria
- **Critical:** Blocking operations or causing data loss
- **High:** Significant time savings or revenue impact
- **Medium:** Improves workflow efficiency
- **Low:** Nice-to-have enhancements

---

## Configuration Guide

### Enabling Auto-Act Mode

**Default:** Suggest-Only (safe)

**To Enable Auto-Act:**
1. Navigate to Command Center → Settings tab
2. Verify automation has been tested in Suggest-Only mode
3. Toggle "Automation Mode" switch
4. Confirm you understand auto-actions will execute
5. Monitor closely for first 24 hours
6. Use kill switch if issues arise

**Warning:** Auto-Act mode allows AI to create loads, assign drivers, and update statuses without approval. Only enable after thorough testing.

---

### Adjusting Usage Limits

**Default Limits:**
- 1000 AI calls per day
- 100K tokens per day
- $50 cost per day

**To Adjust:**
1. Contact support@spatchy.ai
2. Provide: Tenant ID, desired limits, justification
3. We'll update within 1 business day

**Note:** Higher limits may result in higher costs. Monitor usage carefully.

---

## Support

### Getting Help

**Documentation:**
- User Guide: [Coming Soon]
- Video Tutorials: [Coming Soon]
- Concept Docs: See `/concepts/` directory

**Contact:**
- Email: support@spatchy.ai
- Response Time: Within 4 hours (business days)
- Emergency: [Emergency contact TBD]

**Community:**
- User Forum: [Coming Soon]
- Feature Requests: support@spatchy.ai

---

## Version History

### v1.0.0 (Current)
- Core dispatch operations
- Multi-tenant architecture
- Command Center dashboard
- AI automation with guardrails
- System observability
- Usage tracking and cost controls

### v0.9.0 (Beta)
- Initial multi-tenant setup
- Basic load and driver management
- Preliminary AI integration

---

## Legal & Compliance

### Terms of Service
- Link: [TBD]
- Last Updated: [TBD]

### Privacy Policy
- Link: [TBD]
- Data residency: United States
- Data retention: 7 years (compliance requirement)

### Dispatch-Carrier Agreements
- Templates available on request
- Customizable for your operation
- Must be executed before driver assignment

### Broker Contracts
- Not provided by Spatchy AI
- Use your existing broker relationships
- Store rate confirmations in system

---

## Summary

**Spatchy AI is production-ready for:**
- Core dispatch workflows
- Multi-tenant operations
- AI-assisted (with guardrails) automation
- Observability and cost control

**Not ready for:**
- Live telephony (scaffold only)
- External load board integration (stub only)
- Advanced analytics (roadmap)
- Third-party system integrations (future)

**Philosophy:**
- **Ship Core First:** Nail the dispatch workflow before adding bells and whistles
- **Safety Over Speed:** Guardrails and monitoring before full automation
- **Dispatcher Control:** AI assists, dispatcher decides
- **Transparent Limitations:** Clear about what works and what doesn't

---

If a feature is marked "Coming Soon" or "Beta", assume it's not ready for production use. 

**When in doubt, ask support.**
