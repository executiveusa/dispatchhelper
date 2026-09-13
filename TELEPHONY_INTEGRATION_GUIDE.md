# Telephony Integration Guide

## Overview

Spatchy AI includes a scaffolded telephony system designed to support voice-based dispatch operations in the future. This allows AI agents to make and receive phone calls to interact with brokers and drivers.

**Status**: Scaffold only - not yet implemented

## Architecture

### Components

1. **Type Definitions** (`src/types/telephony.ts`)
   - Call, CallEvent, VoiceAgent types
   - TelephonyProvider and VoiceInterface interfaces
   - Complete TypeScript type safety

2. **Telephony Adapters** (`src/services/telephony/adapter.ts`)
   - Abstract `BaseTelephonyAdapter` class
   - Twilio adapter (scaffold)
   - Asterisk adapter (scaffold)
   - `TelephonyManager` for centralized call management

3. **Voice Agent Controller** (`src/services/telephony/voice-agent.ts`)
   - AI-powered call handling
   - Inbound and outbound call workflows
   - Scenario templates (confirm loads, notify drivers, etc.)

## Use Cases

### 1. Automated Broker Calls

**Scenario**: AI agent calls broker to confirm load availability

```
[AI] "Hi, this is Spatchy AI calling on behalf of [Company].
      I'm calling to confirm availability for load #12345,
      pickup in Dallas, delivery to Houston."

[Broker] "Yes, that load is still available."

[AI] "Great! What's the rate?"

[Broker] "$1,500"

[AI] "Perfect. We'll send a driver. Thank you!"

→ System updates request status to 'confirmed' with rate $1,500
```

### 2. Driver Notifications

**Scenario**: AI agent calls driver about new assignment

```
[AI] "Hi John, this is Spatchy AI. You've been assigned a new load.
      Pickup tomorrow at 8 AM in Dallas, deliver to Houston by 5 PM.
      The load is 20,000 lbs of general freight.
      Can you confirm acceptance?"

[Driver] "Yes, I can do it."

[AI] "Great! Details have been sent to your app. Drive safe!"

→ System updates assignment status to 'accepted'
```

### 3. Status Updates

**Scenario**: Driver calls in to report delivery completion

```
[Driver calls dispatch number]

[AI] "Hi, this is Spatchy AI dispatch. How can I help?"

[Driver] "Hi, this is John. I just completed delivery for load #12345."

[AI] "Great! I'll mark that as delivered. Did everything go smoothly?"

[Driver] "Yes, all good."

[AI] "Perfect. Thanks for the update!"

→ System updates request status to 'delivered'
```

## Implementation Roadmap

### Phase 1: Provider Integration (Future)

**Tasks:**
- [ ] Set up Twilio account or Asterisk server
- [ ] Implement TwilioAdapter or AsteriskAdapter
- [ ] Configure phone numbers
- [ ] Test inbound/outbound calling
- [ ] Implement webhook handling

**Files to update:**
- `src/services/telephony/adapter.ts`

### Phase 2: Speech Services (Future)

**Tasks:**
- [ ] Integrate Speech-to-Text (Google/AWS/Azure)
- [ ] Integrate Text-to-Speech (Google/AWS/Azure)
- [ ] Implement VoiceInterface
- [ ] Test voice quality and recognition accuracy

**New files needed:**
- `src/services/telephony/speech.ts`

### Phase 3: AI Integration (Future)

**Tasks:**
- [ ] Connect voice agent to existing AI dispatch edge function
- [ ] Implement conversation flow management
- [ ] Add context awareness (load details, driver info)
- [ ] Handle multi-turn conversations
- [ ] Implement error handling and fallbacks

**Files to update:**
- `src/services/telephony/voice-agent.ts`
- `supabase/functions/ai-dispatch/index.ts`

### Phase 4: Database Schema (Future)

**Tasks:**
- [ ] Create `calls` table
- [ ] Create `call_events` table
- [ ] Create `call_transcripts` table
- [ ] Create `voice_agents` table
- [ ] Add RLS policies

**New migration needed:**
- `supabase/migrations/[timestamp]_telephony_tables.sql`

### Phase 5: UI Integration (Future)

**Tasks:**
- [ ] Call log viewer
- [ ] Live call monitoring
- [ ] Call recording player
- [ ] Voice agent configuration panel
- [ ] Analytics dashboard

**New components needed:**
- `src/components/telephony/CallLog.tsx`
- `src/components/telephony/CallMonitor.tsx`
- `src/pages/Telephony.tsx`

## Provider Options

### Twilio

**Pros:**
- Easy to use API
- Great documentation
- Reliable infrastructure
- Built-in TTS/STT

**Cons:**
- Per-minute costs
- Requires internet connection

**Best for:** Most SaaS applications

### Asterisk

**Pros:**
- Open source
- Self-hosted (one-time cost)
- Full control
- SIP protocol support

**Cons:**
- Requires server management
- Steeper learning curve
- Manual integration needed

**Best for:** High-volume operations

### Custom Solution

**Pros:**
- Complete flexibility
- Integration with existing PBX
- Custom features

**Cons:**
- High development effort
- Maintenance overhead

**Best for:** Enterprise deployments

## Security Considerations

1. **Call Recording:**
   - Comply with two-party consent laws
   - Store recordings encrypted
   - Auto-delete after retention period

2. **Phone Number Privacy:**
   - Use proxy numbers (Twilio)
   - Don't expose driver/broker numbers
   - Implement call screening

3. **Authentication:**
   - Verify caller identity
   - Use PIN codes for sensitive operations
   - Log all call events

4. **Data Privacy:**
   - Encrypt call transcripts
   - Comply with GDPR/CCPA
   - Allow users to request deletion

## Cost Estimation

### Twilio (Example)

- Phone number: $1/month
- Outbound call: $0.0140/min
- Inbound call: $0.0085/min
- SMS: $0.0075/message
- TTS: $0.04/1000 characters
- STT: $0.024/min

**Example monthly cost for 1,000 minutes:**
- 500 outbound calls (avg 1 min): $7
- 500 inbound calls (avg 1 min): $4.25
- Phone number: $1
- **Total: ~$12.25/month** + TTS/STT costs

## Testing Plan

### Manual Testing

1. Test inbound call handling
2. Test outbound call initiation
3. Verify speech recognition accuracy
4. Test conversation flows
5. Verify database updates

### Automated Testing

1. Unit tests for adapters
2. Integration tests for call flows
3. Mock telephony provider responses
4. Test error scenarios
5. Performance testing (concurrent calls)

## Future Enhancements

- [ ] Multi-language support
- [ ] Sentiment analysis on calls
- [ ] Call routing rules
- [ ] IVR (Interactive Voice Response) menus
- [ ] Conference calling
- [ ] Call transfer to human dispatcher
- [ ] Voice biometrics for driver verification
- [ ] Real-time call transcription in UI
- [ ] AI-powered call quality monitoring

## Getting Started (When Implementing)

1. **Choose Provider**: Decide between Twilio, Asterisk, or custom
2. **Set Up Account**: Create account and get credentials
3. **Update Config**: Add API keys to Supabase secrets
4. **Implement Adapter**: Fill in the adapter methods
5. **Test Basic Calls**: Start with simple inbound/outbound
6. **Add Speech**: Integrate STT/TTS services
7. **Connect AI**: Wire up to dispatch agent
8. **Build UI**: Create call management interface
9. **Deploy**: Test in production
10. **Monitor**: Track call quality and costs

## Support

For questions about telephony integration, refer to:
- Twilio docs: https://www.twilio.com/docs
- Asterisk wiki: https://wiki.asterisk.org
- This repository's issues for Spatchy-specific questions

---

**Note**: This is scaffolding only. Actual implementation requires provider setup, API integration, and thorough testing.
