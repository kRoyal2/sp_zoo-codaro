import { httpAction } from "../_generated/server";
import { api } from "../_generated/api";

// Create a new check-in
export const createCheckIn = httpAction(async (ctx, request) => {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.hikerId || !body.geolocation) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: hikerId, geolocation" 
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const checkInId = await ctx.runMutation(api.checkin.createCheckIn, {
      hikerId: body.hikerId,
      geolocation: body.geolocation,
      message: body.message,
    });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        checkInId,
        message: "Check-in created successfully" 
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to create check-in" 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// Get all check-ins
export const listCheckIns = httpAction(async (ctx, request) => {
  try {
    const checkIns = await ctx.runQuery(api.checkin.listAllCheckIns);
    return new Response(
      JSON.stringify({ checkIns }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to fetch check-ins" 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// Get check-in by ID
export const getCheckInById = httpAction(async (ctx, request) => {
  try {
    const url = new URL(request.url);
    const checkInId = url.pathname.split("/").pop();
    
    if (!checkInId) {
      return new Response(
        JSON.stringify({ error: "Check-in ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const checkIn = await ctx.runQuery(api.checkin.getCheckInById, {
      checkInId: checkInId as any,
    });
    
    if (!checkIn) {
      return new Response(
        JSON.stringify({ error: "Check-in not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ checkIn }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to fetch check-in" 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// Get check-ins by hiker ID
export const getCheckInsByHiker = httpAction(async (ctx, request) => {
  try {
    const url = new URL(request.url);
    const hikerId = url.searchParams.get("hikerId");
    
    if (!hikerId) {
      return new Response(
        JSON.stringify({ error: "hikerId query parameter is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const checkIns = await ctx.runQuery(api.checkin.getCheckInsByHiker, {
      hikerId: hikerId as any,
    });
    
    return new Response(
      JSON.stringify({ checkIns }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to fetch check-ins for hiker" 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// Get latest check-in for a hiker
export const getLatestCheckIn = httpAction(async (ctx, request) => {
  try {
    const url = new URL(request.url);
    const hikerId = url.searchParams.get("hikerId");
    
    if (!hikerId) {
      return new Response(
        JSON.stringify({ error: "hikerId query parameter is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const checkIn = await ctx.runQuery(api.checkin.getLatestCheckInByHiker, {
      hikerId: hikerId as any,
    });
    
    return new Response(
      JSON.stringify({ checkIn }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to fetch latest check-in" 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// Get today's check-ins
export const getTodayCheckIns = httpAction(async (ctx, request) => {
  try {
    const checkIns = await ctx.runQuery(api.checkin.getTodayCheckIns);
    return new Response(
      JSON.stringify({ checkIns }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to fetch today's check-ins" 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// Get check-in route for a hiker
export const getCheckInRoute = httpAction(async (ctx, request) => {
  try {
    const url = new URL(request.url);
    const hikerId = url.searchParams.get("hikerId");
    
    if (!hikerId) {
      return new Response(
        JSON.stringify({ error: "hikerId query parameter is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const route = await ctx.runQuery(api.checkin.getCheckInRoute, {
      hikerId: hikerId as any,
    });
    
    return new Response(
      JSON.stringify({ route }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to fetch check-in route" 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// Get check-ins with hiker info
export const getCheckInsWithHikerInfo = httpAction(async (ctx, request) => {
  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit");
    
    const checkIns = await ctx.runQuery(api.checkin.getCheckInsWithHikerInfo, {
      limit: limit ? parseInt(limit) : undefined,
    });
    
    return new Response(
      JSON.stringify({ checkIns }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to fetch check-ins with hiker info" 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// Get check-in stats for a hiker
export const getCheckInStats = httpAction(async (ctx, request) => {
  try {
    const url = new URL(request.url);
    const hikerId = url.searchParams.get("hikerId");
    
    if (!hikerId) {
      return new Response(
        JSON.stringify({ error: "hikerId query parameter is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const stats = await ctx.runQuery(api.checkin.getCheckInStats, {
      hikerId: hikerId as any,
    });
    
    return new Response(
      JSON.stringify({ stats }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to fetch check-in stats" 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// Update check-in
export const updateCheckIn = httpAction(async (ctx, request) => {
  try {
    const url = new URL(request.url);
    const checkInId = url.pathname.split("/")[3];
    const body = await request.json();
    
    await ctx.runMutation(api.checkin.updateCheckIn, {
      checkInId: checkInId as any,
      geolocation: body.geolocation,
      message: body.message,
    });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Check-in updated successfully" 
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to update check-in" 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// Delete check-in
export const deleteCheckIn = httpAction(async (ctx, request) => {
  try {
    const url = new URL(request.url);
    const checkInId = url.pathname.split("/")[3];
    
    await ctx.runMutation(api.checkin.deleteCheckIn, {
      checkInId: checkInId as any,
    });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Check-in deleted successfully" 
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to delete check-in" 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
