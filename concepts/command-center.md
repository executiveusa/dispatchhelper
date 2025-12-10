# Command Center Concept

## Core Principle: One Perfect Screen

The Command Center is THE primary interface for dispatchers. It must answer:

1. **What's on fire right now?** - Problems requiring immediate attention
2. **What's the overall health?** - At-a-glance metrics
3. **What needs me next?** - Clear action items

## Design Philosophy

### Dispatcher-First Language

Use vocabulary a dispatcher would actually say:

✅ **Good:**
- "What's on fire right now?"
- "Which trucks are empty tomorrow?"
- "Who do I need to call back?"
- "All clear! 🎉"

❌ **Bad:**
- "AI insights dashboard"
- "Optimize load distribution"
- "Predictive analytics panel"
- "System status nominal"

### Information Hierarchy

Priority order (top to bottom):

1. **Critical Problems** - Red alerts, requires immediate action
2. **Health Overview** - Quick status: revenue, utilization, risk loads
3. **Active Operations** - Loads in progress, driver status
4. **AI Suggestions** - Helpful but not urgent

### No Mystery Clicks

Every action should be obvious:

- If she thinks "where do I click?" → simplify
- If she thinks "OK, I see the problem" → correct

## Component Requirements

### 1. Health Overview Strip
- Today's revenue with RPM
- Truck utilization %
- Number of risk loads
- AI mood (optional)
- **All in scannable cards**

### 2. Active Loads Board
- Kanban columns by status
- Load cards show essentials only:
  - Pickup/dropoff locations
  - Times
  - Rate
  - Reference number
- Click to select for AI context
- Auto-refresh

### 3. Driver Wellness Panel
- Status grouping: Available, On Load, Off Duty
- Each driver shows:
  - Name and avatar
  - Current location
  - Hours remaining
  - Status badge
- Quick-view, no drill-down needed

### 4. Problem Feed
- Severity-sorted issues
- Each problem shows:
  - Severity indicator
  - Clear description
  - AI-suggested action
  - "Resolve" button
- Empty state: "All Clear! 🎉"

### 5. AI Copilot Panel
- Natural language chat
- Context-aware based on selected loads
- Shows automation status
- Kill switch visible

## Performance Requirements

- **Fast Load** - Under 2 seconds on normal connection
- **No Clutter** - Maximum 5 widgets on main view
- **Auto-Refresh** - Key metrics update without reload
- **Mobile-Friendly** - Works on tablet in truck or office

## Stress Scenario Testing

Before considering "done", walk through:

1. **Late Load** - Angry broker calling
   - Can dispatcher see load status immediately?
   - Can they see driver location?
   - Can they update broker with one click?

2. **Driver Going Quiet** - No updates for hours
   - Is this visible in problem feed?
   - Does AI suggest action?
   - Can dispatcher call/message quickly?

3. **Last-Minute Cancellation** - Before pickup
   - Can load be marked cancelled quickly?
   - Does it alert affected driver?
   - Does it free up truck for reassignment?

## Visual Design

- **High Contrast** - Problems stand out
- **Color Coding** - Red = urgent, Yellow = warning, Green = good
- **Minimal Text** - Icons and badges where possible
- **White Space** - Not crowded

## Testing Criteria

Ask these questions:

1. Can a dispatcher understand the screen in 5 seconds?
2. Can she find the most urgent issue in under 10 seconds?
3. Can she take action without hunting for buttons?
4. Does the language feel natural, not technical?

If any answer is "no", simplify.

## Accessibility

- Keyboard navigation for power users
- Screen reader friendly
- Works in poor lighting conditions
- Clear focus states

## Future Enhancements (Not Now)

These are aspirational, don't block shipping:
- Voice commands
- Advanced filtering
- Custom layouts
- Predictive load recommendations

## Summary

The Command Center exists to reduce the dispatcher's cognitive load, not add to it.

**Simple > Clever**
**Clear > Complete**
**Fast > Fancy**
