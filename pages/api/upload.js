export const config = { api: { bodyParser: false } };
const api = JSON.parse(process.env.NEXT_PUBLIC_BASE_SERVICE);

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const response = await fetch(`${api.url}/receipts/upload`, {
        method: "POST",
        headers: {
          "content-type": req.headers["content-type"],
          ...api.headers,
        },
        duplex: "half",
        body: req,
      });
      const json = await response.json();
      return res.json(json);
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}