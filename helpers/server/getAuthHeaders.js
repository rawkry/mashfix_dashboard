function getParsedJson(string) {
  try {
    const atob = (str) => Buffer.from(str, "base64").toString("binary");
    return JSON.parse(atob(string));
  } catch (err) {
    return null;
  }
}

export default function getAuthHeaders(req) {
  if (["x-auth-headers"].every((i) => req.cookies.hasOwnProperty(i))) {
    getParsedJson(req.cookies["x-auth-headers"]);
    return getParsedJson(req.cookies["x-auth-headers"]);
  }
  return null;
}
