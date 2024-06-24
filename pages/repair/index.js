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

  const [showIssue, setShowIssue] = useState({
    id: "",
    show: false,
  });
  const [issuesWithPrice, setIssuesWithPrice] = useState({});
  const [activemodalShow, setActiveModalShow] = useState(false);
  const [dates, setDates] = useState({});

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

      if (response.status === 200) {
        toast.info(`Repair status updated successfully`);
      } else {
        toast.error(data.message);
      }
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
      icon="fa-solid fa-useres"
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
        <div className="d-flex justify-content-end gap-4 mt-4">
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
          <div className="d-flex justify-content-between">
            <Form onSubmit={(e) => e.preventDefault()}>
              <Form.Group
                className="d-flex align-items-center w-100 gap-5"
                style={{
                  marginBottom: "1rem",
                }}
              >
                <Form.Control
                  type="search"
                  placeholder="Search by name..."
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
                  type="search"
                  placeholder="Search by phone..."
                  defaultValue={router.query.email || ""}
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
              </Form.Group>
            </Form>

            <div className="d-flex gap-2 mb-2">
              <div>
                <Form.Label className="font-zapp-bold mb-0">
                  Requested Date
                </Form.Label>
                <Form.Group>
                  <div className="d-flex align-items-center  justify-content-center">
                    <div
                      onClick={() => {
                        setActiveModalShow(true);
                      }}
                      className="border-zapp-alt p-2 text-zapp hover"
                    >
                      <i className="fas fa-calendar-alt"></i>
                      {router.query.fromDate && toTrend(router.query.fromDate)}
                      <small className="font-zapp-bold "> - To - </small>
                      <i className="fas fa-calendar-alt"></i>
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
              </div>
              <FloatingLabel controlId="floatingSelect" label="Status">
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
                  {["requested", "working", "completed", "pickedup"].map(
                    (item, index) => (
                      <option
                        key={index}
                        value={item}
                        style={{
                          width: "100%",
                        }}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </FloatingLabel>
              <div>
                <Limit limit={limit} />
              </div>
              <Button
                onClick={() => exportToExcel()}
                className="shadow-sm rounded"
                style={{
                  border: "none ",
                  marginLeft: "10px",
                  padding: "10px 20px",
                  color: "#c344ff",
                }}
              >
                <i className="fas fa-file-excel"></i> Export
              </Button>
            </div>
          </div>

          <Table responsive="xl" bordered striped className="shadow">
            <thead className="bg-secondary shadow">
              <tr className="align-middle">
                <th>Track Id</th>
                <th>Full Name</th>
                <th>Number</th>
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
                    <td>{repair.trackId}</td>
                    <td>{repair.customer.name}</td>

                    <td>
                      <a href={`tel:${repair.customer.phone}`}>
                        {repair.customer.phone}
                      </a>
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
                              "completed",
                              "pickedup",
                            ].map((item, index) => (
                              <option
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
