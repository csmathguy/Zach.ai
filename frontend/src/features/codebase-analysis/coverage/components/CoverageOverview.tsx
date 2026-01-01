import type { FC } from 'react';
import type { CoverageTotals } from '../utils/coverageTypes';
import { calculateRiskLevel, getRiskColor, getRiskEmoji, getRiskColorFromPercentage } from '../utils/coverageThresholds';
import { formatPercentage } from '../utils/coverageParser';
import styles from './CoverageOverview.module.css';

interface CoverageOverviewProps {
  coverage: CoverageTotals;
}

export const CoverageOverview: FC<CoverageOverviewProps> = ({ coverage }) => {
  const riskLevel = calculateRiskLevel(coverage);
  const riskColor = getRiskColor(riskLevel);
  const riskEmoji = getRiskEmoji(riskLevel);

  const metrics = [
    { label: 'Statements', value: coverage.statements, icon: '📝' },
    { label: 'Branches', value: coverage.branches, icon: '🔀' },
    { label: 'Functions', value: coverage.functions, icon: '⚡' },
    { label: 'Lines', value: coverage.lines, icon: '📏' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {metrics.map((metric) => {
          const metricColor = getRiskColorFromPercentage(metric.value);

          return (
            <div key={metric.label} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.icon}>{metric.icon}</span>
                <h3 className={styles.cardTitle}>{metric.label}</h3>
              </div>
              <div className={styles.percentage} style={{ color: metricColor }}>
                {formatPercentage(metric.value)}
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${metric.value}%`,
                    backgroundColor: metricColor,
                  }}
                />
              </div>
              <div className={styles.indicator}>
                <span style={{ color: metricColor }}>
                  {metric.value >= 80 ? '✅' : metric.value >= 60 ? '⚠️' : '❌'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.summary} style={{ borderColor: riskColor }}>
        <div className={styles.summaryIcon}>{riskEmoji}</div>
        <div className={styles.summaryContent}>
          <h3 className={styles.summaryTitle}>Overall Status</h3>
          <p className={styles.summaryText}>
            Average Coverage:{' '}
            <strong>
              {formatPercentage(
                (coverage.statements +
                  coverage.branches +
                  coverage.functions +
                  coverage.lines) /
                  4
              )}
            </strong>
          </p>
        </div>
      </div>
    </div>
  );
};
