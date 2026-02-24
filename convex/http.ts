import { httpRouter } from "convex/server";
import { auth } from "./auth";
import * as hikerEndpoints from "./endpoints/hikers";
import * as checkinEndpoints from "./endpoints/checkins";

const http = httpRouter();

auth.addHttpRoutes(http);

// ============= HIKER ROUTES =============
http.route({
  path: "/api/hikers",
  method: "POST",
  handler: hikerEndpoints.createHiker,
});

http.route({
  path: "/api/hikers",
  method: "GET",
  handler: hikerEndpoints.listHikers,
});

http.route({
  path: "/api/hikers/:id",
  method: "GET",
  handler: hikerEndpoints.getHikerById,
});

http.route({
  path: "/api/hikers/:id/status",
  method: "PATCH",
  handler: hikerEndpoints.updateHikerStatus,
});

http.route({
  path: "/api/hikers/status/lost",
  method: "GET",
  handler: hikerEndpoints.getLostHikers,
});

http.route({
  path: "/api/hikers/:id/checkin",
  method: "POST",
  handler: hikerEndpoints.createCheckIn,
});

http.route({
  path: "/api/hikers/:id/details",
  method: "GET",
  handler: hikerEndpoints.getHikerWithCheckIns,
});

// ============= CHECK-IN ROUTES =============
http.route({
  path: "/api/checkins",
  method: "POST",
  handler: checkinEndpoints.createCheckIn,
});

http.route({
  path: "/api/checkins",
  method: "GET",
  handler: checkinEndpoints.listCheckIns,
});

http.route({
  path: "/api/checkins/:id",
  method: "GET",
  handler: checkinEndpoints.getCheckInById,
});

http.route({
  path: "/api/checkins/by-hiker",
  method: "GET",
  handler: checkinEndpoints.getCheckInsByHiker,
});

http.route({
  path: "/api/checkins/latest",
  method: "GET",
  handler: checkinEndpoints.getLatestCheckIn,
});

http.route({
  path: "/api/checkins/today",
  method: "GET",
  handler: checkinEndpoints.getTodayCheckIns,
});

http.route({
  path: "/api/checkins/route",
  method: "GET",
  handler: checkinEndpoints.getCheckInRoute,
});

http.route({
  path: "/api/checkins/with-hiker-info",
  method: "GET",
  handler: checkinEndpoints.getCheckInsWithHikerInfo,
});

http.route({
  path: "/api/checkins/stats",
  method: "GET",
  handler: checkinEndpoints.getCheckInStats,
});

http.route({
  path: "/api/checkins/:id",
  method: "PATCH",
  handler: checkinEndpoints.updateCheckIn,
});

http.route({
  path: "/api/checkins/:id",
  method: "DELETE",
  handler: checkinEndpoints.deleteCheckIn,
});

export default http;
