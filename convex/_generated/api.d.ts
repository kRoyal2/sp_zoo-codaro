/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as automations from "../automations.js";
import type * as checkin from "../checkin.js";
import type * as contacts from "../contacts.js";
import type * as deals from "../deals.js";
import type * as endpoints_checkins from "../endpoints/checkins.js";
import type * as endpoints_hikers from "../endpoints/hikers.js";
import type * as hiker from "../hiker.js";
import type * as http from "../http.js";
import type * as incidents from "../incidents.js";
import type * as myFunctions from "../myFunctions.js";
import type * as onboarding from "../onboarding.js";
import type * as pipelineComments from "../pipelineComments.js";
import type * as rescueCommunications from "../rescueCommunications.js";
import type * as rescueGroup from "../rescueGroup.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";
import type * as tasks from "../tasks.js";
import type * as workspaces from "../workspaces.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  auth: typeof auth;
  automations: typeof automations;
  checkin: typeof checkin;
  contacts: typeof contacts;
  deals: typeof deals;
  "endpoints/checkins": typeof endpoints_checkins;
  "endpoints/hikers": typeof endpoints_hikers;
  hiker: typeof hiker;
  http: typeof http;
  incidents: typeof incidents;
  myFunctions: typeof myFunctions;
  onboarding: typeof onboarding;
  pipelineComments: typeof pipelineComments;
  rescueCommunications: typeof rescueCommunications;
  rescueGroup: typeof rescueGroup;
  seed: typeof seed;
  settings: typeof settings;
  tasks: typeof tasks;
  workspaces: typeof workspaces;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
