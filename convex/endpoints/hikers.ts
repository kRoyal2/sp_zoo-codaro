import { httpAction } from "../_generated/server";
import { api } from "../_generated/api";

// Create a new hiker
export const createHiker = httpAction(async (ctx, request) => {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.age || !body.height || !body.weight || !body.experienceLevel || !body.contactInfo || !body.status) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: name, age, height, weight, experienceLevel, contactInfo, status" 
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const hikerId = await ctx.runMutation(api.hiker.createHiker, {
      name: body.name,
      age: body.age,
      height: body.height,
      weight: body.weight,
      experienceLevel: body.experienceLevel,
      contactInfo: body.contactInfo,
      status: body.status,
    });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        hikerId,
        message: "Hiker created successfully" 
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to create hiker" 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// Get all hikers
export const listHikers = httpAction(async (ctx, request) => {
  try {
    const hikers = await ctx.runQuery(api.hiker.listHikers);
    return new Response(
      JSON.stringify({ hikers }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to fetch hikers" 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// Get hiker by ID
export const getHikerById = httpAction(async (ctx, request) => {
  try {
    const url = new URL(request.url);
    const hikerId = url.pathname.split("/").pop();
    
    if (!hikerId) {
      return new Response(
        JSON.stringify({ error: "Hiker ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const hiker = await ctx.runQuery(api.hiker.getHikerById, {
      hikerId: hikerId as any,
    });
    
    if (!hiker) {
      return new Response(
        JSON.stringify({ error: "Hiker not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ hiker }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to fetch hiker" 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// Update hiker status
export const updateHikerStatus = httpAction(async (ctx, request) => {
  try {
    const url = new URL(request.url);
    const hikerId = url.pathname.split("/")[2];
    const body = await request.json();
    
    if (!body.status) {
      return new Response(
        JSON.stringify({ error: "Status is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    await ctx.runMutation(api.hiker.updateHikerStatus, {
      hikerId: hikerId as any,
      status: body.status,
    });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Hiker status updated successfully" 
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to update hiker status" 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// Get lost hikers
export const getLostHikers = httpAction(async (ctx, request) => {
  try {
    const lostHikers = await ctx.runQuery(api.hiker.getLostHikers);
    return new Response(
      JSON.stringify({ hikers: lostHikers }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to fetch lost hikers" 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// Create check-in for a hiker
export const createCheckIn = httpAction(async (ctx, request) => {
  try {
    const url = new URL(request.url);
    const hikerId = url.pathname.split("/")[2];
    const body = await request.json();
    
    if (!body.geolocation) {
      return new Response(
        JSON.stringify({ error: "Geolocation is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const checkInId = await ctx.runMutation(api.checkin.createCheckIn, {
      hikerId: hikerId as any,
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

// Get hiker with check-ins
export const getHikerWithCheckIns = httpAction(async (ctx, request) => {
  try {
    const url = new URL(request.url);
    const hikerId = url.pathname.split("/")[2];
    
    const hikerData = await ctx.runQuery(api.hiker.getHikerWithCheckIns, {
      hikerId: hikerId as any,
    });
    
    if (!hikerData) {
      return new Response(
        JSON.stringify({ error: "Hiker not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ hiker: hikerData }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to fetch hiker with check-ins" 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
