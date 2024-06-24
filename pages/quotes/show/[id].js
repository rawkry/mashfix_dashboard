import { callFetch } from "@/helpers/server";
import { Main } from "@/layouts";
import React from "react";
import getMyProfile from "@/helpers/server/getMyProfile";
import { Table } from "react-bootstrap";
import { toHuman } from "@/helpers/clients";

export async function getServerSideProps(context) {
  const myProfile = await getMyProfile(context);

  const [status, quote] = await callFetch(
    context,
    `/quotes/${context.params.id}`,
    "GET"
  );

  if (status === 404) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      myProfile,
      quote,
    },
  };
}

const index = ({ quote, myProfile }) => {
  return (
    <Main
      title={`Quote ||  ${quote.customerName}`}
      icon="fa-solid fa-quotees"
      profile={myProfile}
    >
      <Table
        responsive="xl"
        bordered
        striped
        className="shadow"
        style={{ marginBottom: "3rem" }}
      >
        <tbody>
          <tr className="align-middle">
            <th>Name</th>
            <td>{quote.customerName}</td>
          </tr>
          <tr className="align-middle">
            <th>Email</th>
            <td>{quote.customerEmail} </td>
          </tr>
          <tr className="align-middle">
            <th>Phone</th>
            <td>{quote.customerPhone ? quote.customerPhone : "N/A"}</td>
          </tr>
          <tr className="align-middle">
            <th>Selected Service</th>
            <td>{quote.service.name}</td>
          </tr>
          <tr className="align-middle">
            <th>Device Name</th>
            <td>{quote.device}</td>
          </tr>
          <tr className="align-middle">
            <th>Device Brand</th>
            <td>{quote.brand}</td>
          </tr>
          <tr className="align-middle">
            <th>Required Date</th>
            <td>{toHuman(quote.requiredDate)}</td>
          </tr>
          <tr className="align-middle">
            <th>Device Issue</th>
            <td>{quote.problemDescription}</td>
          </tr>

          <tr className="align-middle">
            <th>Requested for</th>
            <td>{quote.onSiteRepair ? "Onsite" : "In Shop"}</td>
          </tr>
          <tr className="align-middle">
            <th>Created At</th>
            <td>{toHuman(quote.createdAt)}</td>
            <td></td>
          </tr>
        </tbody>
      </Table>
    </Main>
  );
};

export default index;
