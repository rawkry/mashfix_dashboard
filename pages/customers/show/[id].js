import {
  ButtonGroup,
  Card,
  Col,
  FloatingLabel,
  Form,
  InputGroup,
  Row,
  Table,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useState } from "react";

import { Button } from "@/ui";
import { Main } from "@/layouts";
import {
  generateFakeEmail,
  generateFakeNumber,
  generateFakePan,
  toHuman,
} from "@/helpers/clients";
import getMyProfile from "@/helpers/server/getMyProfile";
import { callFetch } from "@/helpers/server";
import { IssuesFormFields } from "@/reuseables";
import Link from "next/link";

export async function getServerSideProps(context) {
  try {
    const myProfile = await getMyProfile(context);
    const [[service_status, { repairs }], [customer_status, customer]] =
      await Promise.all([
        callFetch(
          context,
          `/repairs/with-customer-id/${context.params.id}`,
          "GET"
        ),
        callFetch(context, `/customers/${context.params.id}`, "GET"),
      ]);

    if (service_status !== 200 || customer_status !== 200) {
      return {
        props: {
          fetched: false,
        },
      };
    }

    return {
      props: {
        repairs,
        customer,
        fetched: true,
        myProfile,
      },
    };
  } catch (e) {
    return {
      props: {
        fetched: false,
      },
    };
  }
}

export default function Show({ __state, myProfile, repairs, customer }) {
  return (
    <Main
      title={`Customer || Show - ${customer.name} `}
      icon="fa-solid fa-users"
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
            <td>{customer.name}</td>
          </tr>
          <tr className="align-middle">
            <th>Email</th>
            <td>{customer.email ? customer.email : "N/A"} </td>
          </tr>
          <tr className="align-middle">
            <th>Phone</th>
            <td>{customer.phone ? customer.phone : "N/A"}</td>
          </tr>
          <tr className="align-middle">
            <th>Address</th>
            <td>{customer.address}</td>
          </tr>
          <tr className="align-middle">
            <th>CretedAt</th>
            <td>{toHuman(customer.createdAt)}</td>
          </tr>
        </tbody>
      </Table>

      <Table responsive="xl" bordered striped className="shadow">
        <thead className="bg-secondary shadow">
          <tr className="align-middle">
            <th>Track Id</th>
            <th>Device</th>
            <th>Brand</th>
            <th>Description</th>
            <th>Service </th>
            <th>Status</th>
            <th>Requested Date</th>
            <th>Options</th>
          </tr>
        </thead>
        <tbody style={{ overflowY: "auto" }}>
          {repairs.length > 0 ? (
            repairs.map((repair) => (
              <tr key={repair._id} className="align-middle">
                <td>{repair.trackId}</td>
                <td>{repair.device}</td>
                <td>{repair.brand}</td>

                <td>
                  {repair.problemDescription &&
                    repair.problemDescription.split(" ").slice(0, 10).join(" ")}
                  ...
                </td>
                <td>{repair.servicetype.name}</td>
                <td>
                  <Form.Group controlId="active">
                    <FloatingLabel controlId="floatingSelect" className="mb-3">
                      <select
                        className="form-select form-select-sm"
                        defaultValue={repair.status}
                        onChange={(e) => {
                          handleStatusChange(repair._id, e.target.value);
                        }}
                      >
                        {["requested", "working", "completed", "pickedup"].map(
                          (item, index) => (
                            <option
                              key={index}
                              value={item}
                              style={{ width: "100%" }}
                            >
                              {item}
                            </option>
                          )
                        )}
                      </select>
                    </FloatingLabel>
                  </Form.Group>
                </td>
                <td>{toHuman(repair.createdAt)}</td>

                <td>
                  <ButtonGroup size="sm">
                    <Link href={`/repair/show/${repair._id}`}>
                      <Button size="sm">
                        <i className="fas fa-eye me-1"></i> View
                      </Button>
                    </Link>

                    <Button
                      size="sm"
                      variant="warning"
                      as={Link}
                      href={`/repair/edit/${repair._id}`}
                    >
                      <i className="fas fa-pen me-1"></i> Edit
                    </Button>
                    <Button
                      as={Link}
                      href={`/repair/${repair._id}/edit-receipt`}
                      size="sm"
                      variant="success"
                    >
                      <i
                        className="fas fa-money-bill me-1
                          "
                      ></i>{" "}
                      Cost Update
                    </Button>

                    <Button
                      size="sm"
                      variant="danger"
                      as={Link}
                      href={`/repair/${repair._id}/view-receipt`}
                    >
                      <i
                        className="fas fa-print me-1
                          "
                      ></i>{" "}
                      View Receipt
                    </Button>
                  </ButtonGroup>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10" className="text-center">
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Main>
  );
}
