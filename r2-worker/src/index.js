// Serves workshop archive files (papers, slides, audio, video) from R2.
//
//   GET /conf/2014/wilde-hard-fhtw2014.pdf  ->  R2 object "2014/wilde-hard-fhtw2014.pdf"
//
// The website links to /conf/... on fhtw.byu.edu, and Netlify redirects those
// requests here (see netlify.toml). Supports HEAD, conditional requests, and
// Range requests so audio and video can seek.

const PREFIX = "/conf/";

export default {
  async fetch(request, env) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", {
        status: 405,
        headers: { Allow: "GET, HEAD" },
      });
    }

    const url = new URL(request.url);
    if (!url.pathname.startsWith(PREFIX)) {
      return new Response("Not found", { status: 404 });
    }
    const key = decodeURIComponent(url.pathname.slice(PREFIX.length));
    if (!key) {
      return new Response("Not found", { status: 404 });
    }

    const object =
      request.method === "HEAD"
        ? await env.CONF.head(key)
        : await env.CONF.get(key, {
            range: request.headers,
            onlyIf: request.headers,
          });

    if (object === null) {
      return new Response("Not found", { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("accept-ranges", "bytes");
    // Archive files never change once published.
    headers.set("cache-control", "public, max-age=604800");

    // A precondition (If-None-Match etc.) matched: R2 returns metadata only.
    if (request.method === "GET" && !("body" in object)) {
      return new Response(null, { status: 304, headers });
    }

    if (request.method === "HEAD") {
      headers.set("content-length", String(object.size));
      return new Response(null, { status: 200, headers });
    }

    if (object.range && request.headers.has("range")) {
      const { offset = 0, length = object.size - offset } = object.range;
      headers.set(
        "content-range",
        `bytes ${offset}-${offset + length - 1}/${object.size}`,
      );
      return new Response(object.body, { status: 206, headers });
    }

    return new Response(object.body, { status: 200, headers });
  },
};
