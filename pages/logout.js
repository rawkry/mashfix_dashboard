import { serialize } from "cookie";

export function getServerSideProps({ res }) {
  const cookieOptions = {
    maxAge: -1,
    path: "/",
  };
  res.setHeader("Set-Cookie", [
    serialize("x-auth-headers", "", cookieOptions),
    serialize("x-my-profile", "", cookieOptions),
  ]);

  return {
    redirect: {
      permanent: false,
      destination: "/login",
    },
    props: {},
  };
}

export default function Logout() {
  return <p>Logging you out...</p>;
}
