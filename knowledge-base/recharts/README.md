# Recharts Knowledge Base

## Overview

Recharts is a composable charting library built on React components and D3. It provides easy-to-use, declarative charts with excellent TypeScript support.

**Official Documentation**: https://recharts.org/

**Version Used**: 2.x

**Philosophy**: Recharts uses the principle "everything is a component" - charts are composed from small, reusable pieces.

---

## When We Use It

In the Zach.ai codebase, Recharts is used for:

1. **Coverage Visualization**: Bar chart showing bottom 5 files by coverage
2. **Interactive Charts**: Hover tooltips and responsive design
3. **Data Visualization**: Transform coverage JSON into visual insights

### Current Charts

- **BarChart**: Bottom 5 files by coverage percentage (identifies problem areas)

---

## Quick Reference

### Installation

```bash
npm install recharts
```

**Note**: Recharts includes TypeScript definitions out of the box.

### Basic Bar Chart

```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'File A', coverage: 85 },
  { name: 'File B', coverage: 72 },
  { name: 'File C', coverage: 91 },
];

function MyChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Legend />
        <Bar dataKey="coverage" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

---

## Core Components

### ResponsiveContainer

Makes charts responsive to container size changes.

```typescript
<ResponsiveContainer width="100%" height={300}>
  <BarChart>...</BarChart>
</ResponsiveContainer>
```

**Props**:

- `width`: String ("100%") or number
- `height`: Number (required)
- `aspect`: Aspect ratio (alternative to height)

### Chart Components

- `BarChart` - Vertical or horizontal bars
- `LineChart` - Line graphs
- `PieChart` - Pie and donut charts
- `AreaChart` - Filled line charts
- `ScatterChart` - Scatter plots
- `RadarChart` - Radar/spider charts
- `RadialBarChart` - Circular progress bars

### Data Display

- `Bar`, `Line`, `Area`, `Scatter` - Data series
- `XAxis`, `YAxis` - Axis components
- `CartesianGrid` - Background grid
- `Tooltip` - Interactive hover tooltips
- `Legend` - Chart legend

---

## Our Implementation

### Bottom 5 Files Chart

**File**: `frontend/src/features/codebase-analysis/coverage/components/CoverageCharts.tsx`

```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ParsedCoverageData } from '../utils/coverageTypes';
import { getFileName } from '../utils/pathUtils';
import { getRiskColorFromPercentage } from '../utils/coverageThresholds';

interface CoverageChartsProps {
  data: ParsedCoverageData;
}

export function CoverageCharts({ data }: CoverageChartsProps) {
  // Get bottom 5 files by average coverage
  const bottom5Files = data.files
    .map((file) => {
      const avgCoverage = (file.statements + file.branches + file.functions + file.lines) / 4;
      return {
        name: getFileName(file.path),
        fullPath: file.path,
        coverage: Math.round(avgCoverage * 10) / 10,
        color: getRiskColorFromPercentage(avgCoverage),
      };
    })
    .sort((a, b) => a.coverage - b.coverage)
    .slice(0, 5);

  if (bottom5Files.length === 0) {
    return null;
  }

  return (
    <div>
      <h3>Bottom 5 Files by Coverage</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={bottom5Files} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis dataKey="name" type="category" width={150} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div style={{ background: '#fff', padding: '10px', border: '1px solid #ccc' }}>
                    <p><strong>{data.name}</strong></p>
                    <p>Coverage: {data.coverage}%</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>{data.fullPath}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="coverage"
            fill={(entry) => entry.color}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

**Key Features**:

- Color-coded bars based on risk level (red < 60%, yellow 60-80%, green > 80%)
- Custom tooltip showing full file path
- Horizontal layout for better file name readability
- Sorted by lowest coverage first (identifies problems)

---

## Best Practices

### 1. Always Use ResponsiveContainer

```typescript
// ✅ Good - Responsive
<ResponsiveContainer width="100%" height={300}>
  <BarChart>...</BarChart>
</ResponsiveContainer>

// ❌ Bad - Fixed width
<BarChart width={600} height={300}>...</BarChart>
```

### 2. Define Explicit Domains

```typescript
// ✅ Good - Explicit domain for percentage charts
<YAxis domain={[0, 100]} />

// ❌ Bad - Auto domain might be misleading
<YAxis />  // Could show 85-100% and make differences look bigger
```

### 3. Custom Tooltips for Context

```typescript
<Tooltip
  content={({ active, payload }) => {
    if (active && payload?.[0]) {
      return <CustomTooltip data={payload[0].payload} />;
    }
    return null;
  }}
/>
```

### 4. Memoize Data Transformations

```typescript
import { useMemo } from 'react';

const chartData = useMemo(() => {
  return files
    .map((file) => ({
      name: getFileName(file.path),
      coverage: calculateAverage(file),
    }))
    .sort((a, b) => a.coverage - b.coverage);
}, [files]);
```

---

## Common Chart Types

### Bar Chart (Our Use Case)

**When to Use**: Comparing discrete categories  
**Example**: File coverage comparison

```typescript
<BarChart data={data}>
  <Bar dataKey="value" fill="#8884d8" />
</BarChart>
```

### Line Chart

**When to Use**: Showing trends over time  
**Example**: Coverage over time (not implemented)

```typescript
<LineChart data={historicalData}>
  <Line type="monotone" dataKey="coverage" stroke="#8884d8" />
</LineChart>
```

### Pie Chart

**When to Use**: Showing parts of a whole  
**Example**: Distribution of risk levels (considered but rejected)

```typescript
<PieChart>
  <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" />
</PieChart>
```

**Why We Don't Use It**: Coverage metrics (statements, branches, functions, lines) are independent - they don't sum to 100%, so a pie chart would be misleading.

---

## Styling

### Custom Colors

```typescript
// Static color
<Bar dataKey="value" fill="#3b82f6" />

// Dynamic color based on data
<Bar dataKey="value" fill={(entry) => getColor(entry.value)} />

// Multiple data series
<Bar dataKey="statements" fill="#3b82f6" />
<Bar dataKey="branches" fill="#10b981" />
```

### Custom Axis Labels

```typescript
<XAxis
  dataKey="name"
  angle={-45}
  textAnchor="end"
  height={80}
  tickFormatter={(value) => shortenLabel(value)}
/>
```

### Tooltips

```typescript
// Default tooltip
<Tooltip />

// Custom tooltip
<Tooltip
  content={<CustomTooltip />}
  cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
/>
```

---

## TypeScript Integration

### Typed Data

```typescript
interface ChartData {
  name: string;
  coverage: number;
  color: string;
}

const data: ChartData[] = [
  { name: 'File A', coverage: 85, color: '#10b981' },
];

<BarChart data={data}>
  <Bar dataKey="coverage" />
</BarChart>
```

### Typed Tooltip Props

```typescript
import { TooltipProps } from 'recharts';

interface CustomTooltipProps extends TooltipProps<number, string> {
  // Additional custom props
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return <div>{payload[0].value}%</div>;
  }
  return null;
}
```

---

## Performance Considerations

### Data Size Limits

- **Optimal**: < 100 data points
- **Good**: 100-500 data points
- **Slow**: > 500 data points

**Our Use Case**: Showing only bottom 5 files - excellent performance.

### Optimization Techniques

```typescript
// 1. Limit data points
const chartData = allData.slice(0, 10);

// 2. Memoize transformations
const processedData = useMemo(() => transformData(rawData), [rawData]);

// 3. Use simpleMode for large datasets
<Bar dataKey="value" isAnimationActive={false} />

// 4. Debounce window resize
<ResponsiveContainer debounce={300}>
```

---

## Alternatives Considered

### Why Recharts Over Other Libraries?

| Library      | Pros                                        | Cons                                | Decision       |
| ------------ | ------------------------------------------- | ----------------------------------- | -------------- |
| **Recharts** | React-first, composable, TypeScript support | ~90KB bundle                        | ✅ **Chosen**  |
| Chart.js     | Smaller (~60KB), imperative                 | Not React-native, harder to compose | ❌ Rejected    |
| Victory      | Pure React, accessible                      | Larger bundle (~140KB)              | ❌ Too large   |
| Nivo         | Beautiful defaults                          | Heavy (~200KB+), opinionated        | ❌ Too large   |
| D3           | Ultimate flexibility                        | Steep learning curve, verbose       | ❌ Too complex |

**Decision**: Recharts offers the best balance of developer experience, bundle size, and React integration.

---

## Common Issues and Solutions

### Issue 1: Chart Not Rendering

**Problem**: Chart shows as blank  
**Solution**: Ensure `ResponsiveContainer` has a defined height

```typescript
// ❌ Bad - No height
<ResponsiveContainer>
  <BarChart>...</BarChart>
</ResponsiveContainer>

// ✅ Good
<ResponsiveContainer width="100%" height={300}>
  <BarChart>...</BarChart>
</ResponsiveContainer>
```

### Issue 2: Labels Cut Off

**Problem**: X-axis labels truncated  
**Solution**: Rotate labels or increase height

```typescript
<XAxis
  dataKey="name"
  angle={-45}
  textAnchor="end"
  height={80}
/>
```

### Issue 3: Tooltip Not Showing

**Problem**: Tooltip doesn't appear on hover  
**Solution**: Check data format and tooltip props

```typescript
// Ensure data has correct structure
const data = [
  { name: 'A', value: 100 },  // ✅ name and value keys
];

<Tooltip />  // Must be inside chart component
```

---

## Resources

- Official Docs: https://recharts.org/en-US/
- Examples: https://recharts.org/en-US/examples
- GitHub: https://github.com/recharts/recharts
- API Reference: https://recharts.org/en-US/api

---

## Summary

Recharts is an excellent choice for React data visualization. Key takeaways:

1. ✅ **Component-Based**: Charts are composed from React components
2. ✅ **TypeScript**: First-class TypeScript support
3. ✅ **Responsive**: Works on all screen sizes with `ResponsiveContainer`
4. ✅ **Customizable**: Flexible styling and custom tooltips
5. ✅ **Performant**: Fast for datasets under 500 points

**Best For**:

- Simple to medium complexity charts
- React + TypeScript projects
- When developer experience matters

**Not Best For**:

- Complex custom visualizations (use D3 directly)
- Extremely large datasets (>1000 points)
- Bundle size-critical projects (consider Chart.js)

**Next Steps**:

1. Consider adding line chart for coverage trends over time
2. Explore other chart types (pie, radar) for different metrics
3. Add animations for better UX (`isAnimationActive={true}`)

---

**Last Updated**: January 1, 2026  
**Used In**: Zach.ai Codebase Analysis Dashboard - Coverage Visualizations
