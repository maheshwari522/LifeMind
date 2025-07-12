/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as notes from "../notes.js";
import type * as openai from "../openai.js";
import type * as priorities from "../priorities.js";
import type * as reminders from "../reminders.js";
import type * as utils from "../utils.js";
import type * as voiceProcessing from "../voiceProcessing.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  notes: typeof notes;
  openai: typeof openai;
  priorities: typeof priorities;
  reminders: typeof reminders;
  utils: typeof utils;
  voiceProcessing: typeof voiceProcessing;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
