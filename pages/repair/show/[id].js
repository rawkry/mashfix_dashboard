import { callFetch } from "@/helpers/server";
import { Main } from "@/layouts";
import ReactHtmlParser from "react-html-parser";
import React, { use, useEffect, useState } from "react";
import getMyProfile from "@/helpers/server/getMyProfile";
import { Table } from "react-bootstrap";
import { toHuman } from "@/helpers/clients";

export async function getServerSideProps(context) {
  const myProfile = await getMyProfile(context);

  const [status, repair] = await callFetch(
    context,
    `/repair/${context.params.id}`,
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
      repair,
    },
  };
}

const index = ({ repair, myProfile }) => {
  return (
    <Main
      title={`Repairs ||  ${repair.trackId}`}
      icon="fa-solid fa-useres"
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
            <th>Track ID</th>
            <td>{repair.trackId}</td>
          </tr>
          <tr className="align-middle">
            <th>Name</th>
            <td>{repair.customerName}</td>
          </tr>
          <tr className="align-middle">
            <th>Email</th>
            <td>{repair.customerEmail} </td>
          </tr>
          <tr className="align-middle">
            <th>Phone</th>
            <td>{repair.customerPhone ? repair.customerPhone : "N/A"}</td>
          </tr>
          <tr className="align-middle">
            <th>Selected Service</th>
            <td>{repair.serviceTypeId?.name}</td>
          </tr>
          <tr className="align-middle">
            <th>Device Name</th>
            <td>{repair.deviceName}</td>
          </tr>
          <tr className="align-middle">
            <th>Device Model</th>
            <td>{repair.model}</td>
          </tr>
          <tr className="align-middle">
            <th>Device Issue</th>
            <td>{repair.problemDescription}</td>
          </tr>

          <tr className="align-middle">
            <th>Requested for</th>
            <td>{repair.onSiteRepair ? "Onsite" : "In Shop"}</td>
          </tr>
          <tr className="align-middle">
            <th>Discount</th>
            <td>{repair.discount}</td>
          </tr>
          <tr className="align-middle">
            <th>Expected Service Charge</th>
            <td>{repair.expectedServiceCharge}</td>
          </tr>
          <tr className="align-middle">
            <th>Expected Complete Date</th>
            <td>{toHuman(repair.expectedCompleteDte)}</td>
          </tr>
          <tr className="align-middle">
            <th>Created At</th>
            <td>{toHuman(repair.createdAt)}</td>
            <td></td>
          </tr>
        </tbody>
      </Table>
    </Main>
  );
};

export default index;
