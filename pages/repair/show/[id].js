import { callFetch } from "@/helpers/server";
import { Main } from "@/layouts";
import ReactHtmlParser from "react-html-parser";
import React, { use, useEffect, useRef, useState } from "react";
import getMyProfile from "@/helpers/server/getMyProfile";
import { Modal, Table } from "react-bootstrap";
import { toHuman } from "@/helpers/clients";
import { useReactToPrint } from "react-to-print";
import { PrintPage } from "@/components";
import { Button } from "@/ui";
import { useRouter } from "next/router";

export async function getServerSideProps(context) {
  const myProfile = await getMyProfile(context);

  const [status, repair] = await callFetch(
    context,
    `/repairs/${context.params.id}`,
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
  const router = useRouter();
  const [showReceipt, setShowReceipt] = useState(false);
  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <Main
      title={`Repairs ||  ${repair.trackId}`}
      icon="fa-solid fa-useres"
      profile={myProfile}
    >
      <div className="container-fluid pb-3 ">
        <Button
          variant="outline-primary"
          size="md"
          onClick={() => router.back()}
        >
          <i className="fa-solid fa-arrow-left mr-2"></i>Back
        </Button>
      </div>
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
            <th>Selected Service</th>
            <td>{repair.serviceTypeId?.name}</td>
          </tr>
          <tr className="align-middle">
            <th>Device Name</th>
            <td>{repair.device}</td>
          </tr>
          <tr className="align-middle">
            <th>Brand</th>
            <td>{repair.brand}</td>
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
            <th>Created At</th>
            <td>{toHuman(repair.createdAt)}</td>
          </tr>
        </tbody>
      </Table>

      {/* <PrintPage data={repair} /> */}
    </Main>
  );
};

export default index;
