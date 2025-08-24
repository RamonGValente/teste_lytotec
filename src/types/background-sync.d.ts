
// Type definitions for Background Sync API
interface SyncManager {
  register(tag: string): Promise<void>;
  getTags(): Promise<string[]>;
}

interface ServiceWorkerRegistration {
  sync: SyncManager;
}

interface SyncEvent extends ExtendableEvent {
  tag: string;
  lastChance: boolean;
}

interface ServiceWorkerGlobalScopeEventMap {
  sync: SyncEvent;
}
