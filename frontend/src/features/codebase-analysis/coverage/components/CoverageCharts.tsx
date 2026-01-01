import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ParsedCoverageData } from '../utils/coverageTypes';
import { getRiskColorFromPercentage } from '../utils/coverageThresholds';
import { getFileName, getRelativePath } from '../utils/pathUtils';
import styles from './CoverageCharts.module.css';

interface CoverageChartsProps {
  data: ParsedCoverageData;
}

export function CoverageCharts({ data }: CoverageChartsProps) {
  // Prepare data for bottom files bar chart
  const sortedFiles = [...data.files].sort((a, b) => {
    const avgA = (a.statements + a.branches + a.functions + a.lines) / 4;
    const avgB = (b.statements + b.branches + b.functions + b.lines) / 4;
    return avgB - avgA;
  });

  const bottomFiles = sortedFiles.slice(-5).reverse().map((file) => ({
    name: getFileName(file.path),
    fullPath: getRelativePath(file.path),
    coverage: Number(((file.statements + file.branches + file.functions + file.lines) / 4).toFixed(1)),
  }));

  return (
    <div className={styles.chartsContainer}>
      {/* Bottom Files Bar Chart */}
      <div className={styles.chartCard}>
        <h4>Bottom 5 Files by Coverage</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={bottomFiles} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis type="category" dataKey="name" width={150} />
            <Tooltip
              formatter={(value: number | undefined) => value ? `${value}%` : 'N/A'}
              labelFormatter={(label, payload) => payload?.[0]?.payload?.fullPath || label}
            />
            <Bar dataKey="coverage" fill="#ef4444" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
