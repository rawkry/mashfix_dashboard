import { getAuthHeaders } from "@/helpers/server";

const api = JSON.parse(process.env.NEXT_PUBLIC_BASE_SERVICE);

export default async function handler(req, res) {
  try {
    const authHeaders = getAuthHeaders(req, res);
    if (!authHeaders) return res.status(401).json({ message: "Unauthorized" });
    if (req.method === "DELETE") {
      const response = await fetch(`${api.url}/blogs/${req.query.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...api.headers,
          ...authHeaders,
        },
      });

      return res.status(response.status).json(await response.json());
    }
    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
}
