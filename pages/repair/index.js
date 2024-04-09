import { ButtonGroup, Form, Table, FloatingLabel } from "react-bootstrap";
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

export async function getServerSideProps(context) {
  try {
    const myProfile = await getMyProfile(context);
    const { limit = 10 } = context.query;
    const [status, { repairs, totalCount, currentPage, pages }] =
      await callFetch(
        context,
        `/repair?limit=${limit}&${querystring.stringify(context.query)}`,
        "GET"
      );

    return {
      props: {
        repairs,
        totalCount,
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
  totalCount,
  __state,
}) {
  const router = useRouter();

  const [repair, setrepair] = useState(repairFromServer);

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
        setcareers((prev) =>
          prev.filter((project_inquiry) => project_inquiry.id !== id)
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

  const handleStatusChange = async (id, status) => {
    try {
      __state.loading = true;

      const response = await fetch(`/api`, {
        method: "POST",
        body: JSON.stringify({
          path: `/repair/${id}`,
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

  useEffect(() => {
    setrepair(repairFromServer);
  }, [repairFromServer]);

  return (
    <Main
      title={`Repairs (${!fetched ? "" : totalCount})`}
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
                <th>Track Id</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Number</th>
                <th>DeviceName</th>
                <th>Description</th>
                <th>Status</th>
                <th>Submited Date</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody style={{ overflowY: "auto" }}>
              {repair.length > 0 ? (
                repair.map((project_inquiry) => (
                  <tr key={project_inquiry.id} className="align-middle">
                    <td>{project_inquiry.trackId}</td>
                    <td>{project_inquiry.customerName}</td>

                    <td>{project_inquiry.customerEmail}</td>
                    <td>
                      <a href={`tel:${project_inquiry.customerPhone}`}>
                        {project_inquiry.customerPhone}
                      </a>
                    </td>
                    <td>{project_inquiry.deviceName}</td>
                    <td>
                      {project_inquiry.problemDescription &&
                        project_inquiry.problemDescription
                          .split(" ")
                          .slice(0, 10)
                          .join(" ")}
                      ...
                    </td>
                    <td>
                      <Form.Group controlId="active">
                        <FloatingLabel
                          controlId="floatingSelect"
                          className="mb-3"
                        >
                          <select
                            className="form-select form-select-sm"
                            value={project_inquiry.status}
                            onChange={(e) => {
                              handleStatusChange(
                                project_inquiry.id,
                                e.target.value
                              );
                            }}
                          >
                            {[
                              "requested",
                              "working",
                              "completed",
                              "pickedup",
                            ].map((item, index) => (
                              <option key={index} style={{ width: "100%" }}>
                                {item}
                              </option>
                            ))}
                          </select>
                        </FloatingLabel>
                      </Form.Group>
                    </td>
                    <td>{toHuman(project_inquiry.createdAt)}</td>

                    <td>
                      <ButtonGroup size="sm">
                        <Link href={`/repair/show/${project_inquiry.trackId}`}>
                          <Button size="sm">
                            <i className="fas fa-eye me-1"></i> View
                          </Button>
                        </Link>

                        <Button
                          size="sm"
                          variant="warning"
                          as={Link}
                          href={`/repair/edit/${project_inquiry.trackId}`}
                        >
                          <i className="fas fa-pen me-1"></i> Edit
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
