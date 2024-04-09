import { serialize } from "cookie";

const api = JSON.parse(process.env.NEXT_PUBLIC_BASE_SERVICE);
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }
    const { email, password } = req.body;

    const response = await fetch(`${api.url}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...api.headers,
      },
      body: JSON.stringify({ email, password }),
    });

    const json = await response.json();

    if (response.status !== 200) {
      return res.status(response.status).json(json);
    }

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.ENVIRONMENT === "development",
      path: "/",
      priority: "high",
      ...(process.env.COOKIE_MAX_AGE && process.env.COOKIE_MAX_AGE !== ""
        ? { maxAge: parseInt(eval(process.env.COOKIE_MAX_AGE)) }
        : {}),
    };

    const authHeaders = Buffer.from(
      JSON.stringify({
        authorization: `Bearer ${json.token}`,
      })
    ).toString("base64");
    res.setHeader("Set-Cookie", [
      serialize("x-auth-headers", authHeaders, cookieOptions),
    ]);
    return res.status(200).json({ status: true });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
}
