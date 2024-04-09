import { NextResponse } from "next/server";

async function getMyProfile(headers) {
  try {
    const api = JSON.parse(process.env.NEXT_PUBLIC_BASE_SERVICE);
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

export function getDecodedHeaders(headersBase64) {
  try {
    const decodedHeaders = JSON.parse(atob(headersBase64));

    if (!["authorization"].every((i) => decodedHeaders.hasOwnProperty(i))) {
      throw Error("Bad headers");
    }
    return decodedHeaders;
  } catch (err) {
    return null;
  }
}

function redirectToLogin(request) {
  const cookieOptions = {
    maxAge: -1,
    path: "/",
  };
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set("x-auth-headers", "", cookieOptions);
  response.cookies.set("x-my-profile", "", cookieOptions);
  return response;
}

export async function middleware(request) {
  try {
    const response = NextResponse.next();

    if (!request.cookies.has("x-auth-headers")) {
      return redirectToLogin(request);
    }
    const { value: sysAuthHeadersBase64 } =
      request.cookies.get("x-auth-headers");

    const sysAuthHeaders = getDecodedHeaders(sysAuthHeadersBase64);

    if (!sysAuthHeaders) {
      return redirectToLogin(request);
    }

    const myProfile = await getMyProfile(sysAuthHeaders);

    if (!myProfile) {
      return redirectToLogin(request);
    } else {
      response.cookies.set("x-my-profile", JSON.stringify(myProfile));

      return response;
    }
  } catch (err) {
    console.log(err);
    return redirectToLogin(request);
  }
}
export const config = {
  matcher: ["/((?!api|login|_next/static|favicon.ico|logo.png).*)"],
};
