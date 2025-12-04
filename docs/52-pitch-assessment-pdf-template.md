# 52 Pitch Flow Assessment — PDF Report Template

**Date:** November 26, 2025  
**Version:** 1.0  
**Status:** ✅ Ready for Implementation

---

## Purpose

This document provides the complete template structure for generating PDF reports from 52 Pitch Flow Assessments. Use this with React-PDF, PDFKit, Gamma, or any PDF generation engine.

**Use this when:**
- ✅ You need to generate printable/shareable assessment reports
- ✅ You want to export assessment data to PDF format
- ✅ You need to provide formal documentation for players/parents
- ✅ You want to create archivable assessment records

---

## Template Variables

Use these tokens in your PDF engine. Format: `{{variable.path}}`

### Player Info
- `{{player.firstName}}` - Player first name
- `{{player.lastName}}` - Player last name
- `{{player.age}}` - Player age
- `{{player.level}}` - Player level (Youth, HS, College, Pro)
- `{{player.bats}}` - Batting side (R, L, S)
- `{{player.throws}}` - Throwing side (R, L)

### Session Info
- `{{sessionId}}` - Unique session identifier
- `{{startedAt}}` - Start timestamp (formatted)
- `{{endedAt}}` - End timestamp (formatted)
- `{{coach.name}}` - Coach name
- `{{assessment.swingsCompleted}}` - Number of swings completed

### Summary Scores
- `{{summary.momentumTransferScore}}` - Overall score (0-100)
- `{{summary.groundFlowScore}}` - Ground Flow score (0-100)
- `{{summary.powerFlowScore}}` - Power Flow score (0-100)
- `{{summary.barrelFlowScore}}` - Barrel Flow score (0-100)
- `{{summary.consistencyScore}}` - Consistency score (0-100)
- `{{summary.movementQualityScore}}` - Movement quality score (0-100)
- `{{summary.neuralScore}}` - Neural score (0-100, optional)
- `{{summary.ballContactScore}}` - Ball contact score (0-100, optional)
- `{{summary.band}}` - Band number (-3 to +3)
- `{{summary.bandLabel}}` - Band label (e.g., "Above Average")

### Devices Used
- `{{devices.useKinetrax}}` - Boolean
- `{{devices.useHitTrax}}` - Boolean
- `{{devices.useSensor}}` - Boolean
- `{{devices.useNeuralTest}}` - Boolean

### Coach Notes
- `{{notesFromCoach}}` - Coach's additional notes
- `{{contextTags}}` - Array of context tags

---

## PAGE 1: Cover & Snapshot

### Layout Structure

```
+─────────────────────────────────────────────+
|                                              |
|      52 PITCH FLOW ASSESSMENT                |
|      Momentum Transfer Report                |
|                                              |
+─────────────────────────────────────────────+
|                                              |
|   Player: {{player.firstName}} {{lastName}}  |
|   Age / Level: {{age}} / {{level}}           |
|   Bats / Throws: {{bats}} / {{throws}}       |
|   Date: {{startedAt (formatted)}}            |
|   Coach: {{coach.name}}                      |
|                                              |
+─────────────────────────────────────────────+
|                                              |
|   MOMENTUM TRANSFER SCORE                    |
|                                              |
|            {{score}}                         |
|         ({{bandLabel}})                      |
|                                              |
+─────────────────────────────────────────────+
|                                              |
|   This score measures how well you move      |
|   energy from the ground, through your       |
|   body, into the barrel across 52 pitches.   |
|   It focuses on timing, rhythm, and smooth   |
|   flow – not just pretty positions.          |
|                                              |
+─────────────────────────────────────────────+
```

### Content Elements

**Header Section:**
- Title: "52 PITCH FLOW ASSESSMENT"
- Subtitle: "Momentum Transfer Report"
- Use BARRELS gold color (#E8B14E) for branding

**Player Block:**
- Name in bold
- Age / Level on one line
- Bats / Throws on one line
- Date formatted (e.g., "February 1, 2025")
- Coach name

**Big Score Display:**
- Large font (72pt+) for score number
- Band label underneath in parentheses
- Use color coding:
  - Elite (90-100): Gold gradient
  - Advanced (80-89): Gold
  - Above Average (70-79): Light gold
  - Average (60-69): Neutral
  - Below Average (50-59): Orange
  - Poor (40-49): Red
  - Very Poor (0-39): Dark red

**Explanation Paragraph:**
- Standard explanation text
- Left-aligned, readable font size (12pt)

---

## PAGE 2: Momentum Transfer Card

### Layout Structure

```
+─────────────────────────────────────────────+
|   MOMENTUM TRANSFER CARD                     |
+─────────────────────────────────────────────+
|                                              |
|   +────────────+   +────────────+   |
|   | Overall    |   | Ground     |             |
|   | Momentum   |   | Flow       |             |
|   | {{overall}}|   | {{ground}} |             |
|   +────────────+   +────────────+   |
|                                              |
|   +────────────+   +────────────+   |
|   | Power      |   | Barrel     |             |
|   | Flow       |   | Flow       |             |
|   | {{power}}  |   | {{barrel}} |             |
|   +────────────+   +────────────+   |
|                                              |
|   +────────────────────────────+             |
|   | Consistency          |                     |
|   | {{consistency}}      |                     |
|   +────────────────────────────+             |
|                                              |
+─────────────────────────────────────────────+
```

### Content Elements

**Score Tiles (2x2 + 1):**
- Overall Momentum Transfer (prominent, larger)
- Ground Flow
- Power Flow
- Barrel Flow
- Consistency (full width)

**Score Legend:**
```
0-59:   Needs Work
60-74:  Solid Base
75-84:  Strong
85-100: Elite
```

**Description Text:**
Brief explanation of what each flow lane means:
- **Ground Flow:** How you start from the ground
- **Power Flow:** How energy moves through your body
- **Barrel Flow:** How cleanly it gets to the bat
- **Consistency:** How repeatable the pattern is

---

## PAGE 3: Flow Breakdown

### Layout Structure

```
+─────────────────────────────────────────────+
|   FLOW BREAKDOWN                             |
|   Ground / Power / Barrel                    |
+─────────────────────────────────────────────+
|                                              |
|   GROUND FLOW                                |
|   • Weight transfer: {{metric}}%           |
|   • Head movement: {{metric}} cm            |
|                                              |
|   {{AI-generated paragraph}}                 |
|                                              |
+─────────────────────────────────────────────+
|                                              |
|   POWER FLOW                                 |
|   • Sequence timing: {{metric}} ms          |
|   • AB ratio: {{metric}}                    |
|                                              |
|   {{AI-generated paragraph}}                 |
|                                              |
+─────────────────────────────────────────────+
|                                              |
|   BARREL FLOW                                |
|   • On-plane efficiency: {{metric}}%        |
|   • Vertical bat angle: {{metric}}°         |
|                                              |
|   {{AI-generated paragraph}}                 |
|                                              |
+─────────────────────────────────────────────+
```

### Content Elements

**Ground Flow Section:**
- Weight transfer quality (average)
- Head displacement (average)
- Coach Rick AI paragraph explaining the pattern

**Power Flow Section:**
- Sequence timing gaps (average)
- AB ratio (load:swing)
- Coach Rick AI paragraph explaining the pattern

**Barrel Flow Section:**
- On-plane efficiency (average)
- Vertical bat angle pattern (average)
- Contact quality metrics
- Coach Rick AI paragraph explaining the pattern

---

## PAGE 4: Strengths & Bottlenecks

### Layout Structure

```
+─────────────────────────────────────────────+
|   STRENGTHS YOU CAN TRUST                    |
+─────────────────────────────────────────────+
|                                              |
|   • {{Strength 1}}                          |
|                                              |
|   • {{Strength 2}}                          |
|                                              |
|   • {{Strength 3}}                          |
|                                              |
+─────────────────────────────────────────────+
|                                              |
|   BOTTLENECKS THAT ARE STEALING BARRELS      |
+─────────────────────────────────────────────+
|                                              |
|   • {{Bottleneck 1 - What happens}}         |
|     {{What it causes in ball flight}}        |
|                                              |
|   • {{Bottleneck 2 - What happens}}         |
|     {{What it causes in ball flight}}        |
|                                              |
+─────────────────────────────────────────────+
```

### Content Elements

**Strengths (2-4 bullets):**
- Specific, data-backed strengths
- Tied to game confidence
- Encouraging language

Example:
> "You do a great job getting the barrel through the zone with speed. When you start on time, your exit velo and launch angle look like a real hitter."

**Bottlenecks (2-3 bullets):**
- Main issues only (not 10 little things)
- Cause → effect format
- Clear, actionable language

Example:
> "When your head drifts forward and your ground flow gets jumpy, your barrel has to rush. That's when we see more top-spin ground balls and foul balls pulled off the line."

---

## PAGE 5: Coaching Plan

### Layout Structure

```
+─────────────────────────────────────────────+
|   2-3 WEEK COACHING PLAN                     |
+─────────────────────────────────────────────+
|                                              |
|   MAIN THEME                                 |
|   Our focus: {{coaching theme}}              |
|                                              |
+─────────────────────────────────────────────+
|                                              |
|   1. FOCUS CUE (What to Think)               |
|   {{1-2 simple cues}}                        |
|                                              |
+─────────────────────────────────────────────+
|                                              |
|   2. CORE DRILL BLOCK (What to Do)           |
|                                              |
|   Block 1 - Flow & Ground:                   |
|   • {{Drill description}}                   |
|   • {{Drill description}}                   |
|                                              |
|   Block 2 - Middle & Barrel:                 |
|   • {{Drill description}}                   |
|                                              |
|   Block 3 - Decision:                        |
|   • {{Drill description}}                   |
|                                              |
+─────────────────────────────────────────────+
|                                              |
|   3. SMALL GOALS (How We Measure It)         |
|   • Raise Momentum Transfer from {{old}}     |
|     to {{new}}                               |
|   • Improve weakest flow lane by 1 tier    |
|   • {{Specific metric improvement}}         |
|                                              |
+─────────────────────────────────────────────+
```

### Content Elements

**Main Theme:**
- 1 clear focus for the player
- Examples: "Clean up ground flow", "Organize the middle", "Smooth out barrel flow"

**Focus Cue:**
- 1-2 simple cues the player can think about
- Action-oriented, not positions

**Core Drill Block:**
- 3 blocks (Flow & Ground, Middle & Barrel, Decision)
- 2-3 drills per block
- Generic drill types (no brand names)

**Small Goals:**
- 2-3 measurable targets
- Specific numbers where possible
- Realistic for 2-3 weeks

---

## PAGE 6: Next Test & Notes

### Layout Structure

```
+─────────────────────────────────────────────+
|   NEXT ASSESSMENT & NOTES                    |
+─────────────────────────────────────────────+
|                                              |
|   RECOMMENDED RE-TEST                        |
|   {{Timeline (e.g., "3-4 weeks")}}           |
|                                              |
|   WHAT WE EXPECT TO CHANGE                   |
|   • Momentum Transfer Score: {{range}}      |
|   • Weakest flow lane: {{improvement}}      |
|   • Consistency: {{improvement}}             |
|                                              |
|   {{AI paragraph on long-term expectations}} |
|                                              |
+─────────────────────────────────────────────+
|                                              |
|   COACH NOTES                                |
|   {{Open area for handwritten notes}}        |
|                                              |
|                                              |
|                                              |
|                                              |
+─────────────────────────────────────────────+
```

### Content Elements

**Re-Test Timeline:**
- Recommended timeframe (typically 3-4 weeks)
- Conditional on training frequency

**Expected Changes:**
- Momentum Transfer Score target range
- Weakest flow lane improvement
- Consistency improvement
- Other relevant metrics

**Long-Term Expectations:**
- AI-generated paragraph on what smooth progress looks like
- Emphasis on pattern quality, not just numbers

**Coach Notes Area:**
- Blank space for handwritten notes if printed
- Coach can add session-specific observations

---

## Design Guidelines

### Typography

**Headers:**
- Page titles: 24pt bold
- Section titles: 18pt semi-bold
- Subsection titles: 14pt semi-bold

**Body Text:**
- Regular text: 11pt
- Small text: 9pt
- Score numbers: 36-48pt bold

**Fonts:**
- Headings: Inter, SF Pro, or system-ui
- Body: Inter, system-ui, or Arial
- Scores: Tabular nums for alignment

### Colors

**BARRELS Brand Colors:**
- Primary Gold: `#E8B14E` (Electric Gold)
- Light Gold: `#F5D07A` (Highlights)
- Black: `#000000` (Backgrounds, headers)
- Dark Gray: `#2A2A2A` (Cards, sections)
- Light Gray: `#E5E5E5` (Text, borders)

**Score Color Coding:**
- Elite (90-100): Gold gradient
- Advanced (80-89): Gold
- Above Average (70-79): Light gold
- Average (60-69): Neutral gray
- Below Average (50-59): Orange
- Poor (40-49): Light red
- Very Poor (0-39): Dark red

### Spacing

**Margins:**
- Page margins: 0.75" (1.9cm)
- Section spacing: 0.5" (1.3cm)
- Paragraph spacing: 0.25" (0.6cm)

**Padding:**
- Card padding: 0.5" (1.3cm)
- Section padding: 0.25" (0.6cm)

---

## Implementation Examples

### React-PDF Example

```typescript
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E8B14E',
    marginBottom: 20,
  },
  scoreCard: {
    backgroundColor: '#2A2A2A',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#E8B14E',
  },
});

const AssessmentPDF = ({ data }) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.header}>52 PITCH FLOW ASSESSMENT</Text>
      <Text>Momentum Transfer Report</Text>
      
      <View style={styles.scoreCard}>
        <Text style={styles.scoreNumber}>{data.summary.momentumTransferScore}</Text>
        <Text>({data.summary.bandLabel})</Text>
      </View>
      
      {/* Add more sections */}
    </Page>
  </Document>
);
```

### PDFKit Example

```typescript
import PDFDocument from 'pdfkit';

function generateAssessmentPDF(data, outputPath) {
  const doc = new PDFDocument({ size: 'LETTER', margins: { top: 50, bottom: 50, left: 50, right: 50 } });
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Page 1: Cover
  doc.fontSize(24).fillColor('#E8B14E').text('52 PITCH FLOW ASSESSMENT', { align: 'center' });
  doc.fontSize(14).fillColor('#000000').text('Momentum Transfer Report', { align: 'center' });
  doc.moveDown(2);

  // Player info
  doc.fontSize(12);
  doc.text(`Player: ${data.player.firstName} ${data.player.lastName}`);
  doc.text(`Age / Level: ${data.player.age} / ${data.player.level}`);
  doc.moveDown(2);

  // Score
  doc.fontSize(48).fillColor('#E8B14E').text(data.summary.momentumTransferScore.toString(), { align: 'center' });
  doc.fontSize(14).fillColor('#000000').text(`(${data.summary.bandLabel})`, { align: 'center' });

  // Add more pages...
  
  doc.end();
}
```

---

## Testing Checklist

### Before Production

- [ ] All template variables render correctly
- [ ] Score color coding matches band labels
- [ ] Typography is readable and consistent
- [ ] Page breaks occur at logical points
- [ ] Images/logos display correctly
- [ ] QR codes (if any) are scannable
- [ ] Print quality is acceptable (300 DPI)
- [ ] File size is reasonable (<5MB)

### Quality Checks

- [ ] Player name is prominent and correct
- [ ] Scores are accurate and properly formatted
- [ ] AI-generated text is coherent and coach-like
- [ ] Drill descriptions are specific but generic (no brands)
- [ ] Goals are measurable and realistic
- [ ] Re-test timeline is appropriate
- [ ] No technical jargon or JSON references
- [ ] Language is kid-friendly and encouraging

---

## Summary

This PDF template provides:
- ✅ **Complete 6-page structure** for assessment reports
- ✅ **Template variables** for easy data binding
- ✅ **Design guidelines** for consistent branding
- ✅ **Color coding** for score bands
- ✅ **Layout examples** for each page
- ✅ **Implementation examples** for React-PDF and PDFKit
- ✅ **Kid-friendly language** throughout
- ✅ **Printable format** with handwritten notes area

**Use this template to generate professional, shareable assessment reports from 52 Pitch Flow Assessment data.**

---

**Status:** ✅ Ready for Implementation  
**Last Updated:** November 26, 2025  
**Version:** 1.0
