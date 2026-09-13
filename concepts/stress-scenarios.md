# Stress Scenario Walkthroughs

## Purpose

Before considering any feature "done", it must handle these stress scenarios gracefully. These are real-world situations dispatchers face daily.

## Scenario 1: Late Load with Angry Broker

### Context
- Load L-1234 is running 3 hours late
- Broker called twice, now upset
- Driver hasn't responded to check-in requests
- Pickup window closes in 1 hour

### Dispatcher Needs
1. **See the problem immediately** - Load should appear in problem feed with "high" severity
2. **Know the context** - See pickup time, current ETA, broker contact info
3. **Contact broker fast** - One-click to call or message
4. **Track driver** - See last known location and last check-in time
5. **Update ETA** - Quick way to update and notify broker

### System Requirements

**Command Center:**
- Problem feed shows: "Load L-1234 running 3h late - broker waiting"
- Red severity indicator
- Click problem to see full details

**Load Details:**
- Broker contact: name, phone (click to call), email
- Driver info: last location, last check-in
- Timeline: pickup scheduled, current status, delays
- Quick actions: "Call Broker", "Message Driver", "Update ETA"

**AI Copilot:**
- Proactively suggests: "I can text the driver to check in"
- Drafts broker update: "Hi [Broker], Load running late due to [reason]. New ETA: [time]"
- Offers alternative: "Should I look for backup driver?"

**Mobile-Friendly:**
- Works on phone in case dispatcher is away from desk
- Large touch targets for "Call Broker" button
- Clear status at top: "Load L-1234: LATE - Action Needed"

### Test Checklist
- [ ] Problem appears in feed within 1 minute of delay detection
- [ ] All broker/driver contact info visible without scrolling
- [ ] "Call Broker" button works on mobile
- [ ] AI suggests relevant actions
- [ ] Dispatcher can update status in under 10 seconds
- [ ] Broker receives automated notification if dispatcher approves

---

## Scenario 2: Driver Going Quiet (No Check-in for Hours)

### Context
- Driver Maria on Load L-5678
- Last check-in: 4 hours ago
- Should have arrived at pickup 2 hours ago
- No response to texts or calls

### Dispatcher Needs
1. **Automatic alert** - System flags this without dispatcher hunting
2. **Timeline view** - When was last contact, when should she have checked in
3. **Quick escalation** - Try multiple contact methods fast
4. **Backup plan** - See alternative drivers if needed
5. **Broker update** - If load is at risk, notify broker

### System Requirements

**Problem Feed:**
- "Driver Maria - No contact 4h - Load at risk"
- Severity: High (or Critical if > 6h)
- Shows load details and last known location

**Driver Panel:**
- Status: "Missing check-in" (yellow/red indicator)
- Last location: Map pin or address
- Last contact: "4 hours ago via text"
- Quick actions: "Call", "Text", "Emergency Contact"

**AI Copilot:**
- Proactively flags: "Maria hasn't checked in - want me to text her?"
- If no response: "Still no reply from Maria. Should I call her emergency contact?"
- Suggests: "Backup driver Tom is 30 miles away if needed"

**Automation:**
- Auto-escalation: Text → Call → Emergency contact (with dispatcher approval)
- Logs all attempts in timeline
- If automation paused: Shows suggestion only

### Test Checklist
- [ ] Alert triggers after 3 hours of no contact
- [ ] Dispatcher sees problem without searching
- [ ] Multiple contact methods available
- [ ] Emergency contact info accessible
- [ ] AI suggests escalation path
- [ ] Timeline shows all contact attempts
- [ ] Backup driver options visible

---

## Scenario 3: Last-Minute Cancellation Before Pickup

### Context
- Broker cancels Load L-9012 
- Driver Carlos is 15 minutes from pickup
- Truck is empty after this cancellation
- Need to find another load fast or lose revenue

### Dispatcher Needs
1. **Fast cancellation** - Mark cancelled in under 5 seconds
2. **Driver notification** - Alert Carlos immediately
3. **Truck redeployment** - See available loads in Carlos's area
4. **Revenue recovery** - Find another load to fill the gap
5. **Broker relationship** - Track cancellation for broker reliability scoring

### System Requirements

**Load Card:**
- "Mark Cancelled" button - prominent, requires confirmation
- Cancellation reason dropdown (broker cancelled, shipper cancelled, etc.)
- Auto-notifies driver instantly

**Driver Panel:**
- Carlos status changes to "Available"
- Location: Last known position (near pickup)
- Quick action: "Find Nearby Loads"

**AI Copilot:**
- Immediately suggests: "Carlos is available near [location]. I found 3 loads within 20 miles."
- Ranks by: Rate, broker reliability, pickup urgency
- Draft message to Carlos: "Load cancelled. Found better one nearby - check app?"

**Broker Tracking:**
- Cancellation logged in broker profile
- Trust score adjusted (cancellations lower score)
- History: "MC-12345 - 3 cancellations this month"

**Load Board:**
- Carlos moves back to "Available Drivers"
- Automated search: Loads near his location
- Filter: Pickup today, within 50 miles

### Test Checklist
- [ ] Cancellation takes under 5 seconds
- [ ] Driver notified within 10 seconds
- [ ] Truck status updates to "Available"
- [ ] AI suggests replacement loads immediately
- [ ] Broker cancellation tracked
- [ ] Nearby loads shown without manual search
- [ ] Revenue opportunity visible (replacement rate vs cancelled rate)

---

## Scenario 4: System Down / No Internet

### Context
- Dispatcher's internet goes out
- Or Supabase has outage
- Or AI service times out
- Needs to keep working

### Dispatcher Needs
1. **Graceful degradation** - App doesn't crash
2. **Cached data** - See recent loads/drivers even offline
3. **Clear messaging** - Know what's not working and why
4. **Manual fallback** - Can still make critical updates
5. **Recovery** - When connection returns, sync seamlessly

### System Requirements

**Offline Detection:**
- Banner: "No internet connection - some features unavailable"
- Or: "AI temporarily unavailable - showing cached data"
- Clear distinction: What works vs what doesn't

**Critical Functions Still Work:**
- View recent loads (cached)
- View drivers (cached)
- Make phone calls (click-to-call may fail, show number to dial manually)
- Take notes (save locally, sync later)

**What's Disabled:**
- New load creation (shows message)
- AI suggestions (shows message)
- Real-time updates (shows last update time)

**Recovery:**
- Automatic retry with exponential backoff
- "Retry Now" button
- When back online: "Connection restored - syncing..."
- Conflict resolution if changes made offline

### Test Checklist
- [ ] App doesn't white-screen when offline
- [ ] Clear offline indicator
- [ ] Cached data accessible
- [ ] Critical actions still possible
- [ ] Helpful error messages (not "500 Internal Server Error")
- [ ] Auto-reconnect when internet returns
- [ ] Data syncs correctly after reconnect

---

## Scenario 5: Mobile Use While Driving (Passenger)

### Context
- Dispatcher is passenger in truck
- Checking status on phone
- Poor connection, bumpy road
- Needs to make quick decision

### Dispatcher Needs
1. **Large touch targets** - Easy to tap while moving
2. **Fast loading** - Works on 3G
3. **Critical info first** - Most important things visible immediately
4. **Voice option** - Maybe hands-free queries (future)
5. **No accidental taps** - Confirmations for critical actions

### System Requirements

**Mobile Layout:**
- Minimum button size: 44px (Apple standard)
- High contrast for readability in sunlight
- Sticky header: Critical status always visible
- Bottom navigation: Easy thumb reach

**Performance:**
- Page loads in < 3 seconds on 3G
- Images compressed
- Progressive loading: Text first, images later
- Skeleton screens while loading (not blank page)

**Confirmations:**
- "Cancel Load" requires second tap: "Are you sure?"
- "Pause Automation" shows warning before confirming
- Color coding: Red for destructive, green for safe

**Error Handling:**
- "Slow connection detected - loading simplified view"
- Retry button always visible
- Timeout after 30 seconds with helpful message

### Test Checklist
- [ ] All buttons easy to tap on phone
- [ ] Loads in under 3 seconds on 3G
- [ ] Critical info visible without scrolling
- [ ] No accidental destructive actions
- [ ] Works in direct sunlight (high contrast)
- [ ] Loading states clear (not just blank screen)

---

## Scenario 6: Multiple Urgent Issues Simultaneously

### Context
- 3 loads running late
- 2 drivers not responding
- 1 broker demanding callback
- New load offer expiring in 10 minutes
- It's 8 PM on Friday

### Dispatcher Needs
1. **Triage** - See what's most urgent first
2. **Prioritization** - Clear ranking of issues
3. **Batch actions** - Update multiple things fast
4. **Delegation** - Maybe AI handles some while she handles others
5. **No panic** - Clear, calm interface even in chaos

### System Requirements

**Problem Feed:**
- Sorted by: Severity, then urgency, then time
- Color coding: Red (critical), Yellow (warning), Blue (info)
- Count: "5 issues need attention"
- Filter: "Show critical only"

**Quick Actions:**
- "Update All Late Loads" - Batch status update
- "Send Check-in to All Quiet Drivers" - One button
- "Snooze Low Priority" - Focus on critical

**AI Assistance:**
- "I can handle the broker callback - want me to update them?"
- "Should I assign the new load to Driver Tom? He's available."
- Works in background on approved tasks

**Calm Design:**
- No flashing alerts
- Steady progress: "3 of 5 resolved"
- Clear next action: "Most urgent: Call Broker XYZ"
- Encouraging: "You're handling this well - 2 more to go"

### Test Checklist
- [ ] Most critical issue is obvious
- [ ] Can resolve top 3 issues in under 5 minutes
- [ ] AI helps with low-priority tasks
- [ ] Interface doesn't add to stress
- [ ] Progress visible (not overwhelming)
- [ ] All actions logged (nothing forgotten)

---

## Testing Methodology

### How to Test
1. **Walkthrough** - Manually simulate scenario
2. **Timer** - Track how long resolution takes
3. **Feedback** - Get actual dispatcher to try it
4. **Stress** - Add more problems simultaneously
5. **Iterate** - Fix pain points, test again

### Success Criteria
- Dispatcher finds problem in < 10 seconds
- Can take action in < 30 seconds
- Feels in control, not overwhelmed
- Says "that was easy" not "where do I click?"
- Would use this in real emergency

### Failure Indicators
- "I don't know where to start"
- "Too many clicks to do X"
- "I can't find the broker phone number"
- "Why isn't this working?" (unclear errors)
- "I'll just call them directly" (bypassing app)

---

## Summary

These scenarios are not edge cases - they are **daily reality**.

The system must handle them with:
- **Speed** - Fast response, fast resolution
- **Clarity** - Obvious what to do next
- **Control** - Dispatcher always in charge
- **Calm** - Reduces stress, doesn't add to it

If a feature can't handle these scenarios gracefully, it's not ready for production.
