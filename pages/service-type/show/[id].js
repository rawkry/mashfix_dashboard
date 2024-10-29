import { callFetch } from "@/helpers/server";
import { Main } from "@/layouts";

import React from "react";
import getMyProfile from "@/helpers/server/getMyProfile";
import { Table } from "react-bootstrap";
import { toHuman } from "@/helpers/clients";
import { Button } from "@/ui";
import { useRouter } from "next/router";

export async function getServerSideProps(context) {
  const myProfile = await getMyProfile(context);

  const [status, service] = await callFetch(
    context,
    `/serviceTypes/${context.params.id}`,
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
      service,
    },
  };
}

const index = ({ service, myProfile }) => {
  const router = useRouter();
  return (
    <Main
      title={`Service Type ||  ${service.name.toUpperCase()}`}
      icon="fa-solid fa-quotees"
      profile={myProfile}
    >
      <div className="container-fluid pb-3 ">
        <Button
          variant="outline-primary"
          size="md"
          onClick={() => router.back()}
        >
          <i className="fa-solid fa-arrow-left mr-2"></i>
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
            <th>Name</th>
            <td>{service.name}</td>
          </tr>
          <tr className="align-middle">
            <th>Status</th>
            <td>{service.active ? "Active" : "Inactive"}</td>
          </tr>
          <tr className="align-middle">
            <th>Created At</th>
            <td>{toHuman(service.createdAt)}</td>
            <td></td>
          </tr>
        </tbody>
      </Table>
    </Main>
  );
};

export default index;
