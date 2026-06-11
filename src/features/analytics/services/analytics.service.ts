import api from '@/services/api';

export interface AnalyticsEvent {
    label: string;
    confidence: number;
    timestamp: number;
    session_id: string;
}

export interface TopSign {
    label: string;
    count: number;
    avgConfidence: number;
}

export interface AnalyticsSummary {
    totalSigns: number;
    thisWeek: number;
    avgConfidence: number;
    totalSessions: number;
    topSigns: TopSign[];
}

export const analyticsService = {
    logEvents: (events: AnalyticsEvent[]) =>
        api.post('/api/v1/analytics/events', { events }),

    getSummary: (): Promise<AnalyticsSummary> =>
        api.get<{ data: AnalyticsSummary }>('/api/v1/analytics/summary').then(r => r.data.data),
};
