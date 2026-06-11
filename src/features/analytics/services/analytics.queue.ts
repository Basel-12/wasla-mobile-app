import { StorageService } from '@/services/storage.service';
import { AnalyticsEvent, analyticsService } from './analytics.service';

const QUEUE_KEY = '@analytics_queue';
const FLUSH_THRESHOLD = 10;

// Module-level session ID — one per app process lifetime
const SESSION_ID = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

let isFlushing = false;

async function readQueue(): Promise<AnalyticsEvent[]> {
    const raw = await StorageService.getItem(QUEUE_KEY, false);
    return raw ? JSON.parse(raw) : [];
}

export const analyticsQueue = {
    sessionId: SESSION_ID,

    push: async (event: Omit<AnalyticsEvent, 'session_id'>) => {
        const queue = await readQueue();
        queue.push({ ...event, session_id: SESSION_ID });
        await StorageService.setItem(QUEUE_KEY, JSON.stringify(queue));
        if (queue.length >= FLUSH_THRESHOLD) {
            analyticsQueue.flush();
        }
    },

    flush: async () => {
        if (isFlushing) return;
        isFlushing = true;
        try {
            const queue = await readQueue();
            if (queue.length === 0) return;
            await analyticsService.logEvents(queue);
            await StorageService.removeItem(QUEUE_KEY);
        } catch {
            // queue stays in AsyncStorage for retry on next flush
        } finally {
            isFlushing = false;
        }
    },
};
