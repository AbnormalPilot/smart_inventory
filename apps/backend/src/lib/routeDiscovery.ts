import type { Express } from "express";

export interface DiscoveredRoute {
  method: string;
  path: string;
}

export function discoverRoutes(app: Express): DiscoveredRoute[] {
  const routes: DiscoveredRoute[] = [];
  const stack = (app as any)._router?.stack || [];
  walkStack(stack, "", routes);
  return routes;
}

function walkStack(
  stack: any[],
  prefix: string,
  routes: DiscoveredRoute[]
): void {
  for (const layer of stack) {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods)
        .filter((m: string) => layer.route.methods[m])
        .map((m: string) => m.toUpperCase());
      for (const method of methods) {
        routes.push({ method, path: prefix + layer.route.path });
      }
    } else if (layer.name === "router" && layer.handle?.stack) {
      const layerPrefix = extractPrefix(layer);
      walkStack(layer.handle.stack, prefix + layerPrefix, routes);
    }
  }
}

function extractPrefix(layer: any): string {
  const regexp = layer.regexp;
  if (!regexp) return "";
  if (regexp.fast_slash) return "";

  const src: string = regexp.source;

  // Express path-to-regexp creates patterns like: ^\/api\/?(?=\/|$)
  // Extract path segments (e.g., \/api, \/api\/v1)
  const match = src.match(/^\^((?:\\\/[\w\-.~]+)+)/);
  if (match) {
    return match[1].replace(/\\\//g, "/");
  }

  return "";
}
