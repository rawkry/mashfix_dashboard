import { Card, Row } from "react-bootstrap";

import { Main } from "@/layouts";
import Chart from "@/resuable/chart";
import getMyProfile from "@/helpers/server/getMyProfile";
import Link from "next/link";
import { callFetch } from "@/helpers/server";

// const { url_one, url_two, headers } = JSON.parse(
//   process.env.NEXT_PUBLIC_BUSINESS_INTERNAL_BASE_SERVICE
// );

export async function getServerSideProps(context) {
  const myProfile = await getMyProfile(context);
  const [
    [repai_status, { total: repairTotal }],
    [status, { total: quoteTotal }],
    [customer_status, { total: customerTotal }],
  ] = await Promise.all([
    callFetch(context, `/repairs`, "GET"),
    callFetch(context, `/quotes`, "GET"),
    callFetch(context, `/customers`, "GET"),
  ]);

  return {
    props: {
      repairTotal,
      quoteTotal,
      customerTotal,
      myProfile,
    },
  };
}

export default function Index({
  myProfile,
  quoteTotal,
  repairTotal,
  customerTotal,
}) {
  const dashboardShortcuts = [
    {
      name: "Customers",
      link: "/customers",
      icon: "fa-solid fa-users",
      total: customerTotal,
    },
    {
      name: "Quotes",
      link: "/quotes?approved=no",
      icon: "fas fa-message",
      total: quoteTotal,
    },
    {
      name: "Repairs",
      link: "/repair",
      icon: "fa-solid fa-building",
      total: repairTotal,
    },
  ];
  return (
    <Main icon="fas fa-columns" title="Dashboard" profile={myProfile}>
      <div className="mt-3 d-flex gap-3">
        {dashboardShortcuts.map((item) => (
          <Card className="shadow bg-light">
            <Card.Body>
              <Link href={item.link}>
                <Card.Title>{item.name}</Card.Title>

                <Card.Body>
                  {" "}
                  <i className={`${item.icon} m-2`} />
                  {item.total}
                </Card.Body>
              </Link>
            </Card.Body>
          </Card>
        ))}
      </div>
    </Main>
  );
}
