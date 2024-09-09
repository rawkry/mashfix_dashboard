import { Button, Card, Row } from "react-bootstrap";

import { Main } from "@/layouts";
import Chart from "@/resuable/chart";
import getMyProfile from "@/helpers/server/getMyProfile";
import Link from "next/link";
import { callFetch } from "@/helpers/server";
import { useState } from "react";

// const { url_one, url_two, headers } = JSON.parse(
//   process.env.NEXT_PUBLIC_BUSINESS_INTERNAL_BASE_SERVICE
// );

export async function getServerSideProps(context) {
  const myProfile = await getMyProfile(context);
  const [
    [repai_status, { total: repairTotal }],
    [status, { total: quoteTotal }],
    [customer_status, { total: customerTotal }],
    [stats_status, stats],
  ] = await Promise.all([
    callFetch(context, `/repairs`, "GET"),
    callFetch(context, `/quotes`, "GET"),
    callFetch(context, `/customers`, "GET"),
    callFetch(context, `/receipts/stats`, "GET"),
  ]);

  return {
    props: {
      stats,
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
  stats,
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
  const [showStats, setShowStats] = useState(false);
  return (
    <Main icon="fas fa-columns" title="Dashboard" profile={myProfile}>
      {myProfile.role == "admin" ? (
        <div className="d-flex  align-items-center justify-content-around  gap-3 p-3 bg-light rounded shadow-sm text-dark m-2 ">
          <div className=" flex bg-white p-2 rounded shadow-sm text-center  ">
            <h4>Discount</h4>{" "}
            <h2 className="text-warning">
              $ {showStats ? stats.totalDiscount : "***"}
            </h2>
          </div>
          <div className="flex bg-white p-2 rounded shadow-sm text-center ">
            <h4>Service Charge</h4>
            <h2 className="text-success ">
              {" "}
              $ {showStats ? stats.totalExpectedServiceCharge : "***"}{" "}
            </h2>
          </div>

          <div className=" flex bg-white p-2 rounded shadow-sm text-center ">
            <h4>Issue Price</h4>{" "}
            <h2 className="text-success">
              $ {showStats ? stats.totalIssuesPrice : "***"}{" "}
            </h2>
          </div>

          <div className=" flex bg-white p-2 rounded shadow-sm text-center ">
            <Button onClick={() => setShowStats(!showStats)}>
              <i className="fa-solid fa-eye hover"></i>
            </Button>
          </div>
        </div>
      ) : null}
      <div className="mt-3 d-flex gap-3">
        {dashboardShortcuts.map((item) => (
          <Card className="shadow bg-light" key={item.name}>
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
