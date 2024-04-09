import { getDecodedHeaders } from "@/middleware";

export default async function getMyProfile(context) {
  const decode = context.req.cookies["x-my-profile"];
  try {
    const api = JSON.parse(process.env.NEXT_PUBLIC_BASE_SERVICE);
    const authHeaders = context.req.cookies["x-auth-headers"];

    const headers = getDecodedHeaders(authHeaders);
    const response = await fetch(`${api.url}/auth`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...api.headers,
        ...headers,
      },
    });

    if (response.status !== 200) {
      return null;
    }

    return await response.json();
  } catch (err) {
    return null;
  }
}
