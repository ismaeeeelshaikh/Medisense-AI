import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../api/index';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

// ── Types ──────────────────────────────────────────────────────────────────
interface WardOccupancy {
    ward_type: string;
    total_beds: number;
    occupied_beds: number;
    occupancy_rate: number;
}

interface AdmissionPoint {
    month: string;
    admissions: number;
}

interface RiskBucket {
    risk_level: string;
    count: number;
}

interface DashboardData {
    total_patients?: number;
    high_risk_patients?: number;
    critical_alerts?: number;
    risk_distribution?: RiskBucket[];
}

// ── Colour helpers ─────────────────────────────────────────────────────────
const WARD_COLORS: Record<string, string> = {
    GENERAL: '#3F8A66',
    ICU: '#C8434B',
    CARDIAC: '#D97A3A',
    MATERNITY: '#8EB69B',
};
const WARD_LABELS: Record<string, string> = {
    GENERAL: 'General',
    ICU: 'ICU',
    CARDIAC: 'Cardiac',
    MATERNITY: 'Maternity',
};
const RISK_COLORS: Record<string, string> = {
    LOW: '#3F8A66',
    MEDIUM: '#C99A2A',
    HIGH: '#D97A3A',
    CRITICAL: '#C8434B',
};
const RISK_BG: Record<string, string> = {
    LOW: 'rgba(63,138,102,0.10)',
    MEDIUM: 'rgba(201,154,42,0.12)',
    HIGH: 'rgba(217,122,58,0.11)',
    CRITICAL: 'rgba(200,67,75,0.10)',
};

const TOOLTIP_STYLE: React.CSSProperties = {
    background: 'var(--surface-2)',
    border: '1px solid var(--surface-border-md)',
    borderRadius: 10,
    color: 'var(--text-primary)',
    fontSize: 12,
    boxShadow: '0 4px 16px rgba(5,31,32,0.12)',
};

// ── Sub-components ─────────────────────────────────────────────────────────
function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
    return (
        <div style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--surface-border)',
            borderRadius: 16,
            padding: '22px 24px',
        }}>
            <div style={{ marginBottom: 18 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{title}</h2>
                {subtitle && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{subtitle}</p>}
            </div>
            {children}
        </div>
    );
}

function KpiCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
    return (
        <div style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--surface-border)',
            borderRadius: 14,
            padding: '18px 20px',
        }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: color || 'var(--accent-primary)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
            {sub && <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 6 }}>{sub}</div>}
        </div>
    );
}

function WardBar({ ward, total, occupied, rate }: { ward: string; total: number; occupied: number; rate: number }) {
    const color = WARD_COLORS[ward] || 'var(--accent-primary)';
    const label = WARD_LABELS[ward] || ward;
    const isHigh = rate >= 85;
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label} Ward</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{occupied}/{total} beds</span>
                    <span style={{
                        fontSize: 12, fontWeight: 700,
                        color: isHigh ? '#C8434B' : color,
                        background: isHigh ? 'rgba(200,67,75,0.09)' : `${color}18`,
                        border: `1px solid ${isHigh ? 'rgba(200,67,75,0.22)' : `${color}30`}`,
                        borderRadius: 6, padding: '2px 8px',
                    }}>
                        {rate.toFixed(1)}%
                    </span>
                </div>
            </div>
            <div style={{ height: 8, background: 'var(--surface-border)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                    height: '100%', width: `${Math.min(rate, 100)}%`,
                    background: isHigh ? '#C8434B' : color,
                    borderRadius: 4,
                    transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                }} />
            </div>
        </div>
    );
}

function Spinner() {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <div style={{
                width: 36, height: 36, borderRadius: '50%',
                border: '3px solid rgba(35, 83, 71, 0.15)',
                borderTopColor: 'var(--accent-primary)',
                animation: 'spin 0.8s linear infinite',
            }} />
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', fontSize: 13 }}>
            <AlertTriangle size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
            {message}
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [wardData, setWardData] = useState<WardOccupancy[]>([]);
    const [admissionTrend, setAdmissionTrend] = useState<AdmissionPoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [dashRes, wardRes, trendRes] = await Promise.allSettled([
                    analyticsApi.getDashboard(),
                    analyticsApi.getWardOccupancy(),
                    analyticsApi.getAdmissionTrend(),
                ]);

                if (dashRes.status === 'fulfilled') {
                    setDashboard(dashRes.value.data.data ?? dashRes.value.data ?? null);
                }
                if (wardRes.status === 'fulfilled') {
                    const raw = wardRes.value.data.data ?? wardRes.value.data ?? [];
                    setWardData(Array.isArray(raw) ? raw : []);
                }
                if (trendRes.status === 'fulfilled') {
                    const raw = trendRes.value.data.data ?? trendRes.value.data ?? [];
                    setAdmissionTrend(Array.isArray(raw) ? raw : []);
                }
                if (
                    dashRes.status === 'rejected' &&
                    wardRes.status === 'rejected' &&
                    trendRes.status === 'rejected'
                ) {
                    toast.error('Analytics unavailable — ensure ML service is running');
                }
            } catch {
                toast.error('Analytics unavailable — ensure ML service is running');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const riskBuckets: RiskBucket[] = dashboard?.risk_distribution ?? [];
    const totalPatients = dashboard?.total_patients ?? 0;
    const highRiskCount = dashboard?.high_risk_patients ?? 0;
    const criticalAlerts = dashboard?.critical_alerts ?? 0;

    const totalBeds = wardData.reduce((s, w) => s + (w.total_beds ?? 0), 0);
    const occupiedBeds = wardData.reduce((s, w) => s + (w.occupied_beds ?? 0), 0);
    const overallRate = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;

    return (
        <div className="page-enter">
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{
                    fontSize: 26, fontWeight: 800,
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '-0.02em',
                    color: 'var(--text-primary)',
                    marginBottom: 4,
                }}>
                    Hospital Operations
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>
                    Live overview of ward occupancy, admission trends, and patient risk distribution
                </p>
            </div>

            {loading ? (
                <Spinner />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                    {/* KPI Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
                        <KpiCard
                            label="Total Patients"
                            value={totalPatients || '—'}
                            sub="Currently admitted"
                        />
                        <KpiCard
                            label="Bed Occupancy"
                            value={totalBeds > 0 ? `${overallRate.toFixed(0)}%` : '—'}
                            sub={totalBeds > 0 ? `${occupiedBeds} of ${totalBeds} beds` : 'No ward data'}
                            color={overallRate >= 85 ? 'var(--risk-critical)' : overallRate >= 70 ? 'var(--risk-high)' : 'var(--accent-primary)'}
                        />
                        <KpiCard
                            label="High / Critical Risk"
                            value={highRiskCount || '—'}
                            sub="Patients flagged"
                            color="var(--risk-high)"
                        />
                        <KpiCard
                            label="Critical Alerts"
                            value={criticalAlerts || '0'}
                            sub="Unresolved alerts"
                            color={criticalAlerts > 0 ? 'var(--risk-critical)' : 'var(--accent-primary)'}
                        />
                    </div>

                    {/* Ward Occupancy */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        <SectionCard title="Ward & Bed Occupancy" subtitle="Current utilization by ward type">
                            {wardData.length === 0 ? (
                                <EmptyState message="Ward data unavailable. Ensure the analytics service is running." />
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {wardData.map(w => (
                                        <WardBar
                                            key={w.ward_type}
                                            ward={w.ward_type}
                                            total={w.total_beds ?? 0}
                                            occupied={w.occupied_beds ?? 0}
                                            rate={w.occupancy_rate ?? 0}
                                        />
                                    ))}
                                </div>
                            )}
                        </SectionCard>

                        <SectionCard title="Occupancy Rate by Ward" subtitle="Percentage of beds occupied">
                            {wardData.length === 0 ? (
                                <EmptyState message="No ward data to display." />
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart
                                        data={wardData.map(w => ({
                                            name: WARD_LABELS[w.ward_type] || w.ward_type,
                                            rate: parseFloat((w.occupancy_rate ?? 0).toFixed(1)),
                                            wardType: w.ward_type,
                                            isHigh: (w.occupancy_rate ?? 0) >= 85,
                                        }))}
                                        barSize={36}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                        <YAxis domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, 'Occupancy']} />
                                        <Bar dataKey="rate" radius={[5, 5, 0, 0]}>
                                            {wardData.map(w => (
                                                <Cell
                                                    key={w.ward_type}
                                                    fill={(w.occupancy_rate ?? 0) >= 85 ? '#C8434B' : (WARD_COLORS[w.ward_type] || '#3F8A66')}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </SectionCard>
                    </div>

                    {/* Admission Trend */}
                    <SectionCard title="Monthly Admission Trend" subtitle="Patient admissions over the past 12 months">
                        {admissionTrend.length === 0 ? (
                            <EmptyState message="Admission trend data unavailable." />
                        ) : (
                            <ResponsiveContainer width="100%" height={240}>
                                <LineChart data={admissionTrend} margin={{ left: 0, right: 16, top: 4, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [v, 'Admissions']} />
                                    <Line
                                        type="monotone"
                                        dataKey="admissions"
                                        stroke="#3F8A66"
                                        strokeWidth={2.5}
                                        dot={{ fill: '#3F8A66', strokeWidth: 0, r: 4 }}
                                        activeDot={{ r: 6, fill: '#3F8A66' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </SectionCard>

                    {/* Patient Risk Distribution */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        <SectionCard title="Patient Risk Distribution" subtitle="Admitted patients by risk classification">
                            {riskBuckets.length === 0 ? (
                                <EmptyState message="Risk distribution data unavailable." />
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie
                                            data={riskBuckets}
                                            dataKey="count"
                                            nameKey="risk_level"
                                            cx="50%" cy="50%"
                                            innerRadius={55}
                                            outerRadius={88}
                                            paddingAngle={3}
                                            strokeWidth={0}
                                        >
                                            {riskBuckets.map(b => (
                                                <Cell key={b.risk_level} fill={RISK_COLORS[b.risk_level] || 'var(--accent-primary)'} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number, name: string) => [v, name]} />
                                        <Legend
                                            iconType="circle"
                                            iconSize={8}
                                            formatter={(v: string) => (
                                                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                                    {v.charAt(0) + v.slice(1).toLowerCase()}
                                                </span>
                                            )}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </SectionCard>

                        <SectionCard title="Risk Level Breakdown" subtitle="Count and share of patients at each severity">
                            {riskBuckets.length === 0 ? (
                                <EmptyState message="No risk distribution data." />
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {riskBuckets.map(b => {
                                        const color = RISK_COLORS[b.risk_level] || 'var(--accent-primary)';
                                        const bg = RISK_BG[b.risk_level] || 'rgba(35,83,71,0.09)';
                                        const total = riskBuckets.reduce((s, x) => s + x.count, 0);
                                        const pct = total > 0 ? ((b.count / total) * 100).toFixed(1) : '0.0';
                                        return (
                                            <div key={b.risk_level} style={{
                                                background: bg,
                                                border: `1px solid ${color}28`,
                                                borderRadius: 10,
                                                padding: '12px 16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                                                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                                                        {b.risk_level.charAt(0) + b.risk_level.slice(1).toLowerCase()} Risk
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                                    <span style={{ fontSize: 20, fontWeight: 800, color, fontFamily: 'var(--font-mono)' }}>
                                                        {b.count}
                                                    </span>
                                                    <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 42, textAlign: 'right' }}>
                                                        {pct}%
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {totalPatients > 0 && (
                                        <div style={{ paddingTop: 8, borderTop: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total admitted</span>
                                            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{totalPatients}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </SectionCard>
                    </div>

                </div>
            )}
        </div>
    );
}
