import {
  ButtonGroup,
  Form,
  Table,
  FloatingLabel,
  Modal,
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
import { DateRange, Limit, Pagination } from "@/components";
import { isoDate, searchRedirect, toHuman, toTrend } from "@/helpers/clients";
import { toast } from "react-toastify";
import getMyProfile from "@/helpers/server/getMyProfile";
import { IssuesFormFields } from "@/reuseables";

export async function getServerSideProps(context) {
  try {
    const myProfile = await getMyProfile(context);
    const { limit = 10 } = context.query;
    const [status, { repairs, total, currentPage, pages }] = await callFetch(
      context,
      `/repairs?limit=${limit}&${querystring.stringify(context.query)}`,
      "GET"
    );

    return {
      props: {
        repairs,
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
  repairs: repairFromServer,
  currentPage,
  limit,
  pages,
  fetched,
  myProfile,
  total,
  __state,
}) {
  const router = useRouter();

  const [repair, setrepair] = useState(repairFromServer);
  const [viewRemarks, setViewRemarks] = useState({
    remarks: null,
    show: false,
  });

  const [showIssue, setShowIssue] = useState({
    id: "",
    show: false,
  });
  const [issuesWithPrice, setIssuesWithPrice] = useState({});
  const [activemodalShow, setActiveModalShow] = useState(false);
  const [dates, setDates] = useState({
    from_date: new Date(),
    to_date: new Date(),
  });

  const exportToExcel = () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Transactions");

    const headers = [
      "Track ID",
      "Name",
      "Phone",
      "Email",
      "Device Name",
      "Model",
      "Problem Description",
      "Discount",
      "Expected Price",
      "Charge paid",
      "Status",
      "Issue Date",
    ];

    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
    });

    repair.forEach((item) => {
      const row = [
        item.trackId || "-",
        item.customerName || "-",
        item.customerPhone || "-",
        item.customerEmail || "-",
        item.deviceName || "-",
        item.model || "-",
        item.problemDescription || "-",
        item.discount || 0,
        item.expectedServiceCharge || "-",
        item.chargePaid ? "Paid" : "Not Paid",
        item.status || "-",
        toHuman(item.createdAt) || "-",
      ];
      worksheet.addRow(row);
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Repairlist.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    });
  };

  const handleStatusChange = async (id, status) => {
    try {
      __state.loading = true;

      const response = await fetch(`/api`, {
        method: "POST",
        body: JSON.stringify({
          path: `/repairs/${id}/update-status`,
          method: "PATCH",
          body: { status },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return toast.error(data.message);
      }

      toast.info(`Repair status updated successfully`);
      setrepair((prev) =>
        prev.map((item) =>
          item._id === data._id ? { ...item, ...data } : item
        )
      );
    } catch (error) {
      toast.error(error.message);
    } finally {
      __state.loading = false;
    }
  };

  const handleIssueWithPrice = async () => {
    try {
      __state.loading = true;
      const issueswithprice = Object.entries(issuesWithPrice).map(
        ([key, issue]) => ({
          description: issue.description,
          quantity: issue.quantity,
          rate: issue.rate,
          price: issue.price,
        })
      );

      const response = await fetch(`/api`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: `/repair/${showIssue.id}/update-issuesWithPrice`,
          method: "PATCH",
          body: { issuesWithPrice: issueswithprice },
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        toast.info(`Repair issues updated successfully`);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      __state.loading = false;
    }
  };
  const handleDelete = async (id) => {
    try {
      __state.loading = true;
      const response = await fetch(`/api`, {
        method: "POST",
        body: JSON.stringify({
          path: `/repairs/${id}`,
          method: "DELETE",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete repair");
      }
      const data = await response.json();
      if (response.status === 200) {
        toast.info(`Repair deleted successfully`);
        setrepair(repair.filter((item) => item._id !== id));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      __state.loading = false;
    }
  };

  const handleDateChange = (startDate, endDate) => {
    if (startDate === null || endDate === null) {
      return;
    }
    const from_date = isoDate(startDate);
    const to_date = isoDate(endDate);

    const { ...query } = router.query;
    router.push({
      pathname: router.pathname,
      query: {
        ...query,
        fromDate: from_date,
        toDate: to_date,
      },
    });
  };

  useEffect(() => {
    setrepair(repairFromServer);
  }, [repairFromServer]);

  return (
    <Main
      title={`Repairs (${!fetched ? "" : total})`}
      icon="fa-solid fa-tools"
      profile={myProfile}
    >
      <Modal
        title={"Select Last Active Date Range"}
        show={activemodalShow}
        onHide={() => {
          setActiveModalShow(false);
        }}
      >
        <DateRange dates={dates} setDates={setDates} />
        <div className="d-flex justify-content-end gap-4 m-2">
          <div>
            <Button
              onClick={() => {
                handleDateChange(dates.from_date, dates.to_date);
                setActiveModalShow(false);
              }}
            >
              Ok
            </Button>
          </div>
        </div>
      </Modal>
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
          <div className="d-flex justify-content-between flex-wrap">
            <Form onSubmit={(e) => e.preventDefault()}>
              <Form.Group
                className="d-flex align-items-center w-100 gap-2"
                style={{
                  marginBottom: "1rem",
                }}
              >
                <Form.Control
                  className="rounded-pill"
                  type="search"
                  placeholder="name"
                  defaultValue={router.query.name || ""}
                  onChange={debounce(
                    (e) =>
                      searchRedirect(
                        router.pathname,
                        "name",
                        e.target.value,
                        router
                      ),
                    500
                  )}
                />
                <Form.Control
                  className="rounded-pill"
                  type="search"
                  placeholder="phone"
                  defaultValue={router.query.phone || ""}
                  onChange={debounce(
                    (e) =>
                      searchRedirect(
                        router.pathname,
                        "phone",
                        e.target.value,
                        router
                      ),
                    500
                  )}
                />
                <Form.Control
                  className="rounded-pill"
                  type="search"
                  placeholder="brand"
                  defaultValue={router.query.brand || ""}
                  onChange={debounce(
                    (e) =>
                      searchRedirect(
                        router.pathname,
                        "brand",
                        e.target.value,
                        router
                      ),
                    500
                  )}
                />
                <FloatingLabel
                  controlId="floatingSelect"
                  label="Status"
                  style={{
                    width: "100%",
                  }}
                >
                  <select
                    className="form-select form-select-sm"
                    defaultValue={router.query.status || "All"}
                    onChange={(e) => {
                      const { value } = e.target;

                      if (value === "All") {
                        const { status, ...query } = router.query;
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
                          status: value,
                        },
                      });
                    }}
                  >
                    <option value="All">All</option>
                    {[
                      "requested",
                      "working",
                      "waiting for parts",
                      "completed",
                      "pickedup",
                    ].map((item, index) => (
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

            <div className="d-flex gap-2 mb-2 justify-content-end align-items-center">
              <Form.Group>
                <div className="d-flex align-items-center  justify-content-center">
                  <div
                    onClick={() => {
                      setActiveModalShow(true);
                    }}
                    className="border-zapp-alt p-2 text-zapp hover"
                  >
                    {!router.query.fromDate && (
                      <i className="fas fa-calendar-alt"></i>
                    )}
                    {router.query.fromDate && toTrend(router.query.fromDate)}
                    <small className="font-zapp-bold "> - To - </small>
                    {!router.query.toDate && (
                      <i className="fas fa-calendar-alt"></i>
                    )}
                    {router.query.toDate && toTrend(router.query.toDate)}
                  </div>
                  {(router.query.fromDate || router.query.toDate) && (
                    <span
                      className="m-2"
                      onClick={() => {
                        const { fromDate, toDate, ...query } = router.query;
                        router.push({
                          pathname: router.pathname,
                          query: { ...query },
                        });
                      }}
                    >
                      <i className="fas fa-times-circle text-danger hover ">
                        {" "}
                      </i>
                    </span>
                  )}
                </div>
              </Form.Group>

              <Button
                className="rounded-pill"
                title={"Export to Excel"}
                size="sm"
                variant="outline-primary"
                onClick={() => exportToExcel()}
              >
                <i className="fas fa-file-export text-primary "></i>
              </Button>
            </div>
          </div>

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
              {repair.length > 0 ? (
                repair.map((repair) => (
                  <tr key={repair._id} className="align-middle">
                    <td>
                      <span className="d-block fw-bold">{repair.trackId}</span>
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
                    <td>{repair.brand}</td>

                    <td>
                      {repair.problemDescription &&
                        repair.problemDescription
                          .split(" ")
                          .slice(0, 10)
                          .join(" ")}
                      ...
                    </td>
                    <td>{repair.servicetype.name}</td>
                    <td>
                      {repair.status === "pickedup" ? (
                        <span className="text-success">{repair.status}</span>
                      ) : (
                        <Form.Group controlId="active">
                          <FloatingLabel
                            controlId="floatingSelect"
                            className="mb-3"
                          >
                            <select
                              className="form-select form-select-sm"
                              defaultValue={repair.status}
                              onChange={(e) => {
                                handleStatusChange(repair._id, e.target.value);
                              }}
                            >
                              {[
                                "requested",
                                "working",
                                "waiting for parts",
                                "completed",
                                "pickedup",
                              ].map((item, index) => (
                                <option
                                  disabled={
                                    myProfile.role === "user" &&
                                    repair.status === "pickedup"
                                  }
                                  key={index}
                                  value={item}
                                  style={{ width: "100%" }}
                                >
                                  {item}
                                </option>
                              ))}
                            </select>
                          </FloatingLabel>
                        </Form.Group>
                      )}
                    </td>
                    <td>{toHuman(repair.createdAt)}</td>

                    <td>
                      <ButtonGroup size="sm">
                        <Link href={`/repair/show/${repair._id}`}>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            title={"View"}
                          >
                            <i className="fas fa-eye me-1"></i>
                          </Button>
                        </Link>

                        <Button
                          title={"Edit"}
                          size="sm"
                          variant="outline-primary"
                          disabled={
                            myProfile.role === "user" &&
                            repair.status === "pickedup"
                          }
                          as={Link}
                          href={`/repair/edit/${repair._id}`}
                        >
                          <i className="fas fa-edit me-1 text-primary"></i>
                        </Button>
                        <Button
                          title={"Edit Receipt"}
                          as={Link}
                          href={`/repair/${repair._id}/edit-receipt`}
                          size="sm"
                          variant="outline-primary"
                          disabled={
                            myProfile.role === "user" &&
                            repair.status === "pickedup"
                          }
                        >
                          <i
                            className="fas fa-money-bill me-1 text-success
                          "
                          ></i>{" "}
                        </Button>

                        <Button
                          title={"View Receipt"}
                          size="sm"
                          as={Link}
                          variant="outline-primary"
                          href={`/repair/${repair._id}/view-receipt`}
                        >
                          <i
                            className="fas fa-print me-1 text-danger
                          "
                          ></i>{" "}
                        </Button>

                        {repair.remarks?.length > 0 && (
                          <Button
                            title={"View Remarks"}
                            size="sm"
                            variant="outline-warning"
                            onClick={() =>
                              setViewRemarks({
                                show: true,
                                remarks: repair.remarks,
                              })
                            }
                          >
                            <i className="fa-solid fa-comment mr-2"></i>
                          </Button>
                        )}
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
          <Modal
            size="xl"
            show={showIssue.show}
            onHide={() => {
              setShowIssue({
                id: "",
                show: false,
              });
            }}
          >
            <Modal.Header closeButton>
              <Modal.Title>Update Issue</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <IssuesFormFields
                issuesWithPrice={issuesWithPrice}
                setIssuesWithPrice={setIssuesWithPrice}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() =>
                  setShowIssue({
                    id: "",
                    show: false,
                  })
                }
                className="shadow-sm"
              >
                Close
              </Button>
              <Button
                variant="primary"
                className="shadow-sm"
                onClick={handleIssueWithPrice}
              >
                Save
              </Button>
            </Modal.Footer>
          </Modal>
          <Modal
            scrollable
            className="shadow-sm"
            show={viewRemarks.show}
            onHide={() =>
              setViewRemarks({
                show: false,
                remarks: [],
              })
            }
            centered
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>Remarks</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>User</th>
                    <th>Description</th>
                    <th>Changes</th>
                  </tr>
                </thead>
                <tbody>
                  {viewRemarks.remarks?.map((remark, index) => (
                    <tr key={index}>
                      <td>{remark.date}</td>
                      <td>{remark.time}</td>
                      <td>{remark.status}</td>
                      <td>{remark.by}</td>
                      <td>{remark.description}</td>
                      <td>{remark.changes}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Modal.Body>
          </Modal>

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
