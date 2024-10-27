import {
  Button,
  ButtonGroup,
  Card,
  FloatingLabel,
  Form,
  Modal,
  Row,
  Table,
} from "react-bootstrap";

import { Main } from "@/layouts";
import getMyProfile from "@/helpers/server/getMyProfile";
import Link from "next/link";
import { callFetch } from "@/helpers/server";
import { useEffect, useState } from "react";
import { IsoDateString, toHuman } from "@/helpers/clients";
import { Bar } from "@/reuseables";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

// const { url_one, url_two, headers } = JSON.parse(
//   process.env.NEXT_PUBLIC_BUSINESS_INTERNAL_BASE_SERVICE
// );

export async function getServerSideProps(context) {
  const myProfile = await getMyProfile(context);
  const [
    [repai_status, { repairs, total: repairTotal }],
    [status, { quotes, total: quoteTotal }],
    [customer_status, { customers, total: customerTotal }],
    [stats_status, stats],
    [receipt_status, { receipts }],
    [salesStats_status, salesStats],
  ] = await Promise.all([
    callFetch(context, `/repairs?limit=5`, "GET"),
    callFetch(context, `/quotes?limit=5&approved=no`, "GET"),
    callFetch(context, `/customers`, "GET"),
    callFetch(context, `/receipts/stats`, "GET"),
    callFetch(context, `/receipts?limit=5`, "GET"),
    callFetch(
      context,
      `/stats/sales?fromDate=${IsoDateString(
        new Date().setDate(1)
      )}&toDate=${IsoDateString(new Date())} `,
      "GET"
    ),
  ]);

  return {
    props: {
      quotes,
      repairs,
      receipts,
      stats,
      repairTotal,
      quoteTotal,
      customerTotal,
      myProfile,
      salesStats,
    },
  };
}

export default function Index({
  repairs,
  quotes,
  receipts,
  myProfile,
  quoteTotal,
  repairTotal,
  customerTotal,
  stats,
  salesStats,
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
  const [showLocker, setShowLocker] = useState(true);
  const [passwordCorrect, setPasswordCorrect] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    if (data.password !== "4744") {
      toast.error("Wrong password");
      return; // Keep the modal open
    }

    setPasswordCorrect(true);
    setShowLocker(false); // Close modal only if password is correct
    setShowStats(data.showStats); // Assuming showStats comes from the form data
  };

  useEffect(() => {
    // Example of ensuring that this runs on the client only
    setShowLocker(true); // or some logic to determine if the modal should be shown
  }, []);

  return (
    <Main icon="fas fa-columns" title="Dashboard" profile={myProfile}>
      {myProfile.role == "admin" ? (
        <div>
          <div className="d-flex  align-items-center   gap-3 p-3 rounded text-dark m-2 ">
            <div className=" d-flex bg-white justify-content-between p-2 rounded shadow-sm text-center flex-fill ">
              <div className="d-flex flex-column">
                <h4>Discount</h4>{" "}
                <h2 className="text-warning">
                  $ {showStats ? stats.totalDiscount : "***"}
                </h2>
              </div>
              <div>
                <div className=" rounded p-2">
                  <i className="fa-solid fa-percent fa-xl  "></i>
                </div>
              </div>
            </div>
            <div className="d-flex bg-white justify-content-between  p-2 rounded shadow-sm text-center flex-fill ">
              <div className="d-flex flex-column">
                <h4>Service Charge</h4>
                <h2 className="text-success ">
                  {" "}
                  $ {showStats ? stats.totalExpectedServiceCharge : "***"}{" "}
                </h2>
              </div>
              <div>
                <i className="fa-solid fa-bolt fa-xl  "></i>
              </div>
            </div>

            <div className=" d-flex bg-white justify-content-between   p-2 rounded shadow-sm text-center flex-fill ">
              <div className="d-flex flex-column">
                <h4>Issue Price</h4>{" "}
                <h2 className="text-success">
                  $ {showStats ? stats.totalIssuesPrice : "***"}{" "}
                </h2>
              </div>
              <div>
                <i className="fa-solid fa-coins fa-xl"></i>
              </div>
            </div>

            <div className=" flex bg-white p-2 rounded shadow-sm text-center ">
              <Button onClick={() => setShowStats(!showStats)}>
                <i className="fa-solid fa-eye hover"></i>
              </Button>
            </div>
          </div>

          <div className="d-flex  align-items-center   gap-3 p-3 rounded text-dark m-2  ">
            <div className="d-flex bg-white justify-content-between  p-2 rounded shadow-sm text-center flex-fill ">
              <div className="d-flex flex-column">
                <h4>Repairs</h4>
                <h2 className="text-success ">{repairTotal}</h2>
              </div>
              <div>
                <i className="fa-solid fa-building fa-xl  "></i>
              </div>
            </div>
            <div className="d-flex bg-white justify-content-between  p-2 rounded shadow-sm text-center flex-fill ">
              <div className="d-flex flex-column">
                <h4>Quotes</h4>
                <h2 className="text-success ">{quoteTotal}</h2>
              </div>
              <div>
                <i className="fa-solid fa-message  fa-xl  "></i>
              </div>
            </div>
            <div className="d-flex bg-white justify-content-between  p-2 rounded shadow-sm text-center flex-fill ">
              <div className="d-flex flex-column">
                <h4>Customers</h4>
                <h2 className="text-success ">{customerTotal}</h2>
              </div>
              <div>
                <i className="fa-solid fa-users  fa-xl  "></i>
              </div>
            </div>
          </div>
          <Bar data={salesStats} />
        </div>
      ) : null}
      <Card>
        <Card.Header>
          <Card.Title>
            <Link href="/quotes?approved=no">Latest Quotes </Link>
          </Card.Title>
        </Card.Header>
        <Card.Body>
          {/* <div className="mt-3 d-flex gap-3"> */}
          {/* {dashboardShortcuts.map((item) => (
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
        ))} */}
          <Table responsive="xl" bordered striped className="shadow">
            <thead className="bg-secondary shadow">
              <tr className="align-middle">
                <th>Customer</th>
                <th>Branch</th>
                <th>Service</th>
                <th>DeviceName</th>
                <th>Brand</th>
                <th>Description</th>
                <th>Submited Date</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody style={{ overflowY: "auto" }}>
              {quotes.length > 0 ? (
                quotes.map((project_inquiry) => (
                  <tr key={project_inquiry._id} className="align-middle">
                    <td>
                      <span className="d-block">
                        {project_inquiry.customerName}
                      </span>
                      <span className="d-block">
                        {project_inquiry.customerEmail}{" "}
                      </span>
                      <a href={`tel:${project_inquiry.customerPhone}`}>
                        {project_inquiry.customerPhone}
                      </a>
                    </td>
                    <td>{project_inquiry.branch}</td>
                    <td>{project_inquiry.service.name}</td>
                    <td>{project_inquiry.device}</td>
                    <td>{project_inquiry.brand}</td>
                    <td>
                      {project_inquiry.problemDescription &&
                        project_inquiry.problemDescription
                          .split(" ")
                          .slice(0, 10)
                          .join(" ")}
                      ...
                    </td>

                    <td>{toHuman(project_inquiry.createdAt)}</td>

                    <td>
                      <ButtonGroup size="sm">
                        <Link href={`/quotes/show/${project_inquiry._id}`}>
                          <Button size="sm">
                            <i className="fas fa-eye me-1"></i> View
                          </Button>
                        </Link>

                        {/* <Button
                          size="sm"
                          variant="warning"
                          onClick={(e) => {
                            if (
                              confirm(
                                "Are you sure, you want to delete this career?"
                              )
                            ) {
                              handleDelete(project_inquiry.id);
                            }
                          }}
                        >
                          <i className="fas fa-trash me-1"></i> Delete
                        </Button> */}
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
          {/* </div> */}
        </Card.Body>
      </Card>
      <div className="mt-3 d-flex gap-3">
        <Card>
          <Card.Header>
            <Card.Title>
              <Link href="/repair">Latest Repairs</Link>{" "}
            </Card.Title>
          </Card.Header>
          <Card.Body>
            <Table responsive="xl" bordered striped className="shadow">
              <thead className="bg-secondary shadow">
                <tr className="align-middle">
                  <th>Track Id</th>
                  <th>Device</th>

                  <th>Service </th>
                  <th>Status</th>
                  <th>Requested Date</th>
                </tr>
              </thead>
              <tbody style={{ overflowY: "auto" }}>
                {repairs.length > 0 ? (
                  repairs.map((repair) => (
                    <tr key={repair._id} className="align-middle">
                      <td>
                        <span className="d-block fw-bold">
                          {repair.trackId}
                        </span>
                        <span className="d-block">
                          <i className="fas fa-user m-1" />
                          {repair.customer.name}
                        </span>
                        <span>
                          <a href={`tel:${repair.customer.phone}`}>
                            <i className="fas fa-phone m-1" />{" "}
                            {repair.customer.phone}
                          </a>
                        </span>
                      </td>
                      <td>{repair.device}</td>

                      <td>{repair.servicetype.name}</td>
                      <td>{repair.status}</td>
                      <td>{toHuman(repair.createdAt)}</td>
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
          </Card.Body>
        </Card>
        <Card>
          <Card.Header>
            <Card.Title>
              <Link href="/sales">Latest Sales</Link>{" "}
            </Card.Title>
          </Card.Header>
          <Card.Body>
            <Table responsive="xl" bordered striped className="shadow">
              <thead className="bg-secondary shadow">
                <tr className="align-middle">
                  <th>Customer</th>
                  <th>Paid By</th>
                  <th>Service </th>
                  <th>Service Charge</th>
                  <th>Discount</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody style={{ overflowY: "auto" }}>
                {receipts.length > 0 ? (
                  receipts.map((receipts) => (
                    <tr key={receipts._id} className="align-middle">
                      <td>
                        <span className="d-block">
                          <i className="fas fa-user m-1" />
                          {receipts.customer.name}
                        </span>
                        <span>
                          <a href={`tel:${receipts.customer.phone}`}>
                            <i className="fas fa-phone m-1" />{" "}
                            {receipts.customer.phone}
                          </a>
                        </span>
                      </td>

                      <td>{receipts.paymentMethod}</td>
                      <td>{receipts.servicetype.name}</td>

                      <td>$ {receipts.expectedServiceCharge}</td>
                      <td>$ {receipts.discount}</td>
                      <td>
                        ${" "}
                        {receipts.issuesWithPrice.reduce(
                          (accumulator, item) => {
                            return (accumulator += item.price);
                          },
                          0
                        )}
                      </td>
                      <td>{toHuman(receipts.createdAt)}</td>
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
          </Card.Body>
        </Card>
      </div>
      <Modal
        show={showLocker}
        onHide={() => (passwordCorrect ? setShowLocker(false) : null)} // Prevent closing if password is incorrect
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Enter Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-center">
            <Form
              onSubmit={handleSubmit(onSubmit)}
              className="d-flex flex-column w-75"
            >
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter password"
                  {...register("password", { required: true })}
                />
              </Form.Group>
              <Button variant="primary" type="submit">
                Submit
              </Button>
            </Form>
          </div>
        </Modal.Body>
      </Modal>
    </Main>
  );
}
