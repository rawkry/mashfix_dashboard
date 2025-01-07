import {
  ButtonGroup,
  Form,
  Table,
  FloatingLabel,
  Nav,
  Tab,
} from "react-bootstrap";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import querystring from "querystring";
import debounce from "debounce";
import { Button } from "@/ui";
import { callFetch } from "@/helpers/server";
import * as ExcelJS from "exceljs";

import { Main } from "@/layouts";
import { Limit, Pagination } from "@/components";
import { searchRedirect, toHuman } from "@/helpers/clients";
import { toast } from "react-toastify";
import getMyProfile from "@/helpers/server/getMyProfile";
import { set } from "date-fns";

export async function getServerSideProps(context) {
  try {
    const myProfile = await getMyProfile(context);
    const { limit = 10 } = context.query;

    const [status, { quotes, total, currentPage, pages }] = await callFetch(
      context,
      `/quotes?limit=${limit}&approved=no&declined=no&${querystring.stringify(
        context.query
      )}`,
      "GET"
    );

    return {
      props: {
        quotes,
        total,
        currentPage,
        pages,
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
const { url, headers } = JSON.parse(process.env.NEXT_PUBLIC_BASE_SERVICE);
export default function Index({
  quotes: quotesFromServer,
  currentPage,
  limit,
  pages,
  fetched,
  myProfile,
  total: totalCount,
  __state,
}) {
  const router = useRouter();

  const [quotes, setquotes] = useState(quotesFromServer);
  const branch = JSON.parse(process.env.NEXT_PUBLIC_BRANCH);
  const handleApprovedChange = async (quote) => {
    try {
      __state.loading = true;

      const response = await fetch(`/api`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: `/quotes/approve/${quote._id}`,
          method: "PATCH",
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        const response = await fetch(`/api`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: `/repairs`,
            method: "POST",
            body: {
              serviceTypeId: quote.service._id,
              customer: data._id,
              device: quote.device,
              brand: quote.brand,
              problemDescription: quote.problemDescription,
              modelNumber: quote.modelNumber,
              origin: "quote",
            },
          }),
        });
        toast.info(`Quote has been approved successfully`);

        setquotes((prev) =>
          prev.filter((project_inquiry) => project_inquiry._id !== quote._id)
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      __state.loading = false;
    }
  };

  const handleDeclinedChange = async (quote) => {
    try {
      __state.loading = true;

      const response = await fetch(`/api`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: `/quotes/decline/${quote._id}`,
          method: "PATCH",
          body: {
            declined: true,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message);
        return;
      }
      toast.info(`Quote has been rejected successfully`);

      setquotes((prev) =>
        prev.filter((project_inquiry) => project_inquiry._id !== quote._id)
      );
    } catch (error) {
      toast.error(error.message);
    } finally {
      __state.loading = false;
    }
  };

  const handleDeviceReceivedChange = async (quote, value) => {
    try {
      __state.loading = true;

      const response = await fetch(`/api`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: `/quotes/device-received/${quote._id}`,
          method: "PATCH",
          body: {
            deviceReceived: value,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message);
        return;
      }

      setquotes((prev) =>
        prev.map((project_inquiry) => {
          if (project_inquiry._id === quote._id) {
            return {
              ...project_inquiry,
              deviceReceived: value,
            };
          }
          return project_inquiry;
        })
      );
      toast.info(`Device received updated successfully`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      __state.loading = false;
    }
  };

  useEffect(() => {
    setquotes(quotesFromServer);
  }, [quotesFromServer]);

  return (
    <Main
      title={`Quotes (${!fetched ? "" : totalCount})`}
      icon="fa-solid fa-message"
      profile={myProfile}
    >
      {!fetched ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
          }}
        >
          <h1>Please check your internet connection and try again... </h1>
        </div>
      ) : (
        <>
          <Tab.Container defaultActiveKey="pending">
            <Nav
              variant="tabs"
              className="justify-content-center mb-4"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
              }}
            >
              <Nav.Item>
                <Nav.Link eventKey="pending" className="btn-warning">
                  Pending
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} href="/quotes/approved" eventKey="approved">
                  Approved
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} href="/quotes/declined" eventKey="declined">
                  Declined
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Tab.Container>

          <div className="d-flex justify-content-between mt-3 ">
            <Form>
              <Form.Group
                className="d-flex align-items-center w-100 gap-2"
                style={{
                  marginBottom: "1rem",
                }}
              >
                <Form.Control
                  className="rounded-pill"
                  type="search"
                  placeholder="Search by name..."
                  defaultValue={router.query.customerName || ""}
                  onChange={debounce(
                    (e) =>
                      searchRedirect(
                        router.pathname,
                        "customerName",
                        e.target.value,
                        router
                      ),
                    500
                  )}
                />
                <Form.Control
                  className="rounded-pill"
                  type="search"
                  placeholder="Search by email..."
                  defaultValue={router.query.email || ""}
                  onChange={debounce(
                    (e) =>
                      searchRedirect(
                        router.pathname,
                        "customerEmail",
                        e.target.value,
                        router
                      ),
                    500
                  )}
                />
                <FloatingLabel
                  controlId="floatingSelect"
                  label="Branch"
                  style={{
                    width: "100%",
                  }}
                >
                  <select
                    className="form-select form-select-sm"
                    defaultValue={router.query.branch || "All"}
                    onChange={(e) => {
                      const { value } = e.target;

                      if (value === "All") {
                        const { branch, ...query } = router.query;
                        router.push({
                          pathname: router.pathname,
                          query,
                        });
                        return;
                      }

                      router.push({
                        pathname: router.pathname,
                        query: {
                          ...router.query,
                          branch: value,
                        },
                      });
                    }}
                  >
                    <option value="All">All</option>
                    {branch.map((item, index) => (
                      <option
                        key={index}
                        value={item}
                        style={{
                          width: "100%",
                        }}
                      >
                        {item}
                      </option>
                    ))}
                  </select>
                </FloatingLabel>
              </Form.Group>
            </Form>

            <div className="d-flex gap-2 mb-2">
              <div>
                <Limit limit={limit} />
              </div>
            </div>
          </div>

          <Table responsive="xl" bordered striped className="shadow">
            <thead className="bg-secondary shadow">
              <tr className="align-middle">
                <th>Customer</th>
                <th>Branch</th>
                <th>Service</th>
                <th>DeviceName</th>
                <th>Brand</th>
                <th>Description</th>
                <th>Device Received</th>
                <th>Approved</th>
                <th>Declined</th>
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
                    <td>
                      {project_inquiry.brand}{" "}
                      {project_inquiry.modelNumber && (
                        <small className="d-block ellipsisText">
                          M :{project_inquiry.modelNumber}
                        </small>
                      )}
                    </td>
                    <td>
                      <span className="d-block ellipsisText">
                        {project_inquiry.problemDescription}
                      </span>
                    </td>
                    <td>
                      <Form.Group className="mb-3" controlId="aproved">
                        <Form.Check
                          className="text-success"
                          type="switch"
                          checked={project_inquiry.deviceReceived}
                          onChange={(e) => {
                            if (
                              confirm(
                                "Are you sure, you want to change  status of this quote?"
                              )
                            ) {
                              const value = e.target.checked;
                              handleDeviceReceivedChange(
                                project_inquiry,
                                value
                              );
                            }
                          }}
                        />
                      </Form.Group>
                    </td>
                    <td>
                      <Form.Group className="mb-3" controlId="aproved">
                        <Form.Check
                          className="text-success"
                          type="switch"
                          checked={project_inquiry.approved}
                          onChange={(e) => {
                            if (
                              confirm(
                                "Are you sure, you want to change  status of this quote?"
                              )
                            ) {
                              handleApprovedChange(project_inquiry);
                            }
                          }}
                        />
                      </Form.Group>
                    </td>
                    <td>
                      <Form.Group className="mb-3" controlId="aproved">
                        <Form.Check
                          className="text-success"
                          type="switch"
                          checked={project_inquiry.declined}
                          onChange={(e) => {
                            if (
                              confirm(
                                "Are you sure, you want to reject this quote?"
                              )
                            ) {
                              handleDeclinedChange(project_inquiry);
                            }
                          }}
                        />
                      </Form.Group>
                    </td>
                    <td>{toHuman(project_inquiry.createdAt)}</td>

                    <td>
                      <ButtonGroup size="sm">
                        <Link href={`/quotes/show/${project_inquiry._id}`}>
                          <Button size="sm" variant="primary" title={"View"}>
                            <i className="fas fa-eye me-1"></i>
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

          <Pagination
            pathname={router.pathname}
            currentPage={currentPage}
            pages={pages}
          />
        </>
      )}
    </Main>
  );
}
