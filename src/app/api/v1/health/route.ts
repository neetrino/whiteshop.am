import { getHealthResponse } from "@/lib/server/health-handler";

/** GET /api/v1/health — same checks as /api/health */
export async function GET() {
  return getHealthResponse();
}
