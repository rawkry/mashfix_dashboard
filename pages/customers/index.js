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
import { Limit, Pagination } from "@/components";
import { searchRedirect, toHuman } from "@/helpers/clients";
import { toast } from "react-toastify";
import getMyProfile from "@/helpers/server/getMyProfile";
import { IssuesFormFields } from "@/reuseables";

export async function getServerSideProps(context) {
  try {
    const myProfile = await getMyProfile(context);
    const { limit = 10 } = context.query;
    const [status, { customers, total, currentPage, pages }] = await callFetch(
      context,
      `/customers?limit=${limit}&${querystring.stringify(context.query)}`,
      "GET"
    );

    return {
      props: {
        customers,
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
  customers: customersFromServer,
  currentPage,
  limit,
  pages,
  fetched,
  myProfile,
  total,
  __state,
}) {
  const router = useRouter();

  const [customers, setcustomers] = useState(customersFromServer);

  const [showIssue, setShowIssue] = useState({
    id: "",
    show: false,
  });
  const [issuesWithPrice, setIssuesWithPrice] = useState({});

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

    customers.forEach((item) => {
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
      a.download = "customerslist.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    });
  };
  const handleDelete = async (id) => {
    try {
      __state.loading = true;

      const response = await fetch(`/api`, {
        method: "POST",
        body: JSON.stringify({
          path: `/forms/career/${id}`,
          method: "DELETE",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.status === 200) {
        toast.info(`Career  deleted successfully`);
        setcareers((prev) => prev.filter((customer) => customer.id !== id));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      __state.loading = false;
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      __state.loading = true;

      const response = await fetch(`/api`, {
        method: "POST",
        body: JSON.stringify({
          path: `/customers/${id}/update-status`,
          method: "PATCH",
          body: { status },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.status === 200) {
        toast.info(`customers status updated successfully`);
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
          path: `/customers/${showIssue.id}/update-issuesWithPrice`,
          method: "PATCH",
          body: { issuesWithPrice: issueswithprice },
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        toast.info(`customers issues updated successfully`);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      __state.loading = false;
    }
  };

  useEffect(() => {
    setcustomers(customersFromServer);
  }, [customersFromServer]);

  return (
    <Main
      title={`Customers (${!fetched ? "" : total})`}
      icon="fa-solid fa-useres"
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
                  placeholder="Search by email..."
                  defaultValue={router.query.email || ""}
                  onChange={debounce(
                    (e) =>
                      searchRedirect(
                        router.pathname,
                        "email",
                        e.target.value,
                        router
                      ),
                    500
                  )}
                />
                <Form.Control
                  type="search"
                  placeholder="Search by phone..."
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
              </Form.Group>
            </Form>

            <div className="d-flex gap-2 mb-2">
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
                <th>Full Name</th>
                <th>Number</th>
                <th>Email</th>
                <th>Address</th>
                <th>Created At</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody style={{ overflowY: "auto" }}>
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <tr key={customer.id} className="align-middle">
                    <td>{customer.name}</td>

                    <td>
                      <a href={`tel:${customer.phone}`}>{customer.phone}</a>
                    </td>
                    <td>{customer.email}</td>
                    <td>{customer.address}</td>

                    <td>{toHuman(customer.createdAt)}</td>

                    <td>
                      <ButtonGroup size="sm">
                        <Link href={`/customers/show/${customer._id}`}>
                          <Button size="sm">
                            <i className="fas fa-eye me-1"></i> View
                          </Button>
                        </Link>

                        <Button
                          size="sm"
                          variant="warning"
                          as={Link}
                          href={`/customers/edit/${customer._id}`}
                        >
                          <i className="fas fa-pen me-1"></i> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="success"
                          as={Link}
                          href={`/customers/${customer._id}/create-repair`}
                        >
                          <i className="fas fa-gear me-1"></i> Add Repair
                        </Button>
                      </ButtonGroup>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center">
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
