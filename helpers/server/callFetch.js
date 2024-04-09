import getAuthHeaders from "./getAuthHeaders";

export default async function callFetch(context, pathname, method, body) {
  try {
    const baseService = JSON.parse(process.env.NEXT_PUBLIC_BASE_SERVICE);
    const authHeaders = getAuthHeaders(context.req);

    const response = await fetch(`${baseService.url}${pathname}`, {
      method,
      headers: {
        ...(method === "GET" ? {} : { "Content-Type": "application/json" }),
        ...baseService.headers,
        ...authHeaders,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    return [response.status, await response.json()];
  } catch (err) {
    console.error(err);
    throw new Error("Fetch Error");
  }
}
