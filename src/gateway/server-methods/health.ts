import { getStatusSummary } from "../../commands/status.js";
import { ErrorCodes, errorShape } from "../protocol/index.js";
import { HEALTH_REFRESH_INTERVAL_MS } from "../server-constants.js";
import { formatError } from "../server-utils.js";
import { formatForLog } from "../ws-log.js";
import type { GatewayRequestHandlers } from "./types.js";

// Health check timeout to prevent WebSocket 1006 errors
const HEALTH_CHECK_TIMEOUT_MS = 5000;

export const healthHandlers: GatewayRequestHandlers = {
  health: async ({ respond, context, params }) => {
    const { getHealthCache, refreshHealthSnapshot, logHealth } = context;
    const wantsProbe = params?.probe === true;
    const now = Date.now();
    const cached = getHealthCache();
    
    // Always return cached response quickly if available
    if (cached && now - cached.ts < HEALTH_REFRESH_INTERVAL_MS) {
      respond(true, cached, undefined, { cached: true });
      if (wantsProbe) {
        // Refresh in background without waiting
        void refreshHealthSnapshot({ probe: true }).catch((err) =>
          logHealth.error(`background health refresh failed: ${formatError(err)}`),
        );
      }
      return;
    }
    
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Health check timeout")), HEALTH_CHECK_TIMEOUT_MS);
      });
      
      const snapPromise = refreshHealthSnapshot({ probe: wantsProbe });
      const snap = await Promise.race([snapPromise, timeoutPromise]);
      respond(true, snap, undefined);
    } catch (err) {
      // If timeout and we have cached data, return cached instead of error
      if (cached && err instanceof Error && err.message.includes("timeout")) {
        respond(true, cached, undefined, { cached: true, timeout: true });
      } else {
        respond(false, undefined, errorShape(ErrorCodes.UNAVAILABLE, formatForLog(err)));
      }
    }
  },
  status: async ({ respond }) => {
    try {
      const status = await getStatusSummary();
      respond(true, status, undefined);
    } catch (err) {
      respond(false, undefined, errorShape(ErrorCodes.UNAVAILABLE, formatForLog(err)));
    }
  },
};
