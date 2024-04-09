const baseService = JSON.parse(process.env.NEXT_PUBLIC_BASE_SERVICE);
import { getAuthHeaders } from "@/helpers/server";
export default async function handler(req, res) {
  try {
    const authHeaders = getAuthHeaders(req, res);

    if (!authHeaders) return res.status(401).json({ message: "Unauthorized" });

    if (req.method.toLowerCase() !== "post") {
      return res.status(405).json({ message: "Method not allowed" });
    }
    const { path, method, body } = req.body;

    const response = await fetch(`${baseService.url}${path}`, {
      method: method.toUpperCase(),
      headers: {
        ...(method.toLowerCase() === "get"
          ? {}
          : { "Content-Type": "application/json" }),
        ...baseService.headers,
        ...authHeaders,
      },
      ...(method.toLowerCase() === "get" ? {} : { body: JSON.stringify(body) }),
    });
    const json = await response.json();
    return res.status(response.status).json(json);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Something went wrong please try again later..." });
  }
}
