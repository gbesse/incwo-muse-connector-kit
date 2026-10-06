#!/usr/bin/env node
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { timingSafeEqual } from "node:crypto";
import { pathToFileURL } from "node:url";

const labels = {
  E_AUTH: { fr: "Accès refusé.", en: "Access denied.", es: "Acceso denegado." },
  E_CONFIG: { fr: "Configuration invalide.", en: "Invalid configuration.", es: "Configuración no válida." },
  E_METHOD: { fr: "Méthode non autorisée.", en: "Method not allowed.", es: "Método no permitido." },
  E_ROUTE: { fr: "Ressource inconnue.", en: "Unknown resource.", es: "Recurso desconocido." },
  E_UPSTREAM: { fr: "incwo est indisponible.", en: "incwo is unavailable.", es: "incwo no está disponible." },
  E_INPUT: { fr: "Paramètre invalide.", en: "Invalid parameter.", es: "Parámetro no válido." }
};

function respond(res, status, value) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" });
  res.end(JSON.stringify(value));
}
function error(res, status, code) { respond(res, status, { error: code, message: labels[code] }); }
async function secret(path) {
  const info = await stat(path);
  if ((info.mode & 0o077) !== 0) throw new Error("E_CONFIG");
  const value = (await readFile(path, "utf8")).trim();
  if (!value) throw new Error("E_CONFIG");
  return value;
}
export async function loadConfig(env = process.env) {
  const base = new URL(env.INCWO_API_BASE_URL || "");
  if (base.protocol !== "https:" && !(base.protocol === "http:" && ["127.0.0.1", "localhost"].includes(base.hostname))) throw new Error("E_CONFIG");
  if (base.username || base.password || base.search || base.hash) throw new Error("E_CONFIG");
  if (!base.pathname.endsWith("/")) base.pathname += "/";
  if (!env.CONNECTOR_TOKEN_FILE || !env.INCWO_USER_FILE || !env.INCWO_PASSWORD_FILE) throw new Error("E_CONFIG");
  return {
    base, token: await secret(env.CONNECTOR_TOKEN_FILE),
    user: await secret(env.INCWO_USER_FILE), password: await secret(env.INCWO_PASSWORD_FILE)
  };
}
export function createServer(config, fetcher = fetch) {
  return http.createServer(async (req, res) => {
    try {
      if (req.method !== "GET") return error(res, 405, "E_METHOD");
      const url = new URL(req.url, "http://localhost");
      if (url.pathname === "/health") return respond(res, 200, { status: "ok" });
      const supplied = Buffer.from(req.headers.authorization || "");
      const expected = Buffer.from("Bearer " + config.token);
      if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return error(res, 401, "E_AUTH");
      const resource = { "/contacts": "contacts.xml", "/firms": "firms.xml" }[url.pathname];
      if (!resource) return error(res, 404, "E_ROUTE");
      const page = url.searchParams.get("page") || "1";
      if (!/^[1-9][0-9]{0,3}$/.test(page)) return error(res, 400, "E_INPUT");
      const upstream = new URL(resource, config.base);
      upstream.searchParams.set("page", page);
      const credentials = Buffer.from(config.user + ":" + config.password).toString("base64");
      const response = await fetcher(upstream, {
        method: "GET",
        headers: { authorization: "Basic " + credentials, accept: "application/xml" },
        signal: AbortSignal.timeout(10000),
        redirect: "error"
      });
      if (!response.ok) return error(res, 502, "E_UPSTREAM");
      const chunks = [];
      let size = 0;
      for await (const chunk of response.body) {
        size += chunk.length;
        if (size > 1048576) return error(res, 502, "E_UPSTREAM");
        chunks.push(chunk);
      }
      const body = Buffer.concat(chunks).toString("utf8");
      return respond(res, 200, { resource: url.pathname.slice(1), page: Number(page), xml: body });
    } catch {
      return error(res, 502, "E_UPSTREAM");
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const config = await loadConfig();
    const port = Number(process.env.PORT || 8787);
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("E_CONFIG");
    createServer(config).listen(port, "127.0.0.1", () => {
      process.stderr.write("incwo-muse-connector-kit listening on loopback\n");
    });
  } catch {
    process.stderr.write("E_CONFIG\n");
    process.exitCode = 1;
  }
}
