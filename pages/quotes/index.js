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
    const [status, { quotes, total, currentPage, pages }] = await callFetch(
      context,
      `/quotes?limit=${limit}&${querystring.stringify(context.query)}`,
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

  // const exportToExcel = () => {
  //   const workbook = new ExcelJS.Workbook();
  //   const worksheet = workbook.addWorksheet("Transactions");

  //   const headers = [
  //     "Track ID",
  //     "Name",
  //     "Phone",
  //     "Email",
  //     "Device Name",
  //     "Model",
  //     "Problem Description",
  //     "Discount",
  //     "Expected Price",
  //     "Charge paid",
  //     "Status",
  //     "Issue Date",
  //   ];

  //   const headerRow = worksheet.addRow(headers);
  //   headerRow.eachCell((cell) => {
  //     cell.font = { bold: true };
  //   });

  //   quotes.forEach((item) => {
  //     const row = [
  //       item.trackId || "-",
  //       item.customerName || "-",
  //       item.customerPhone || "-",
  //       item.customerEmail || "-",
  //       item.deviceName || "-",
  //       item.model || "-",
  //       item.problemDescription || "-",
  //       item.discount || 0,
  //       item.expectedServiceCharge || "-",
  //       item.chargePaid ? "Paid" : "Not Paid",
  //       item.status || "-",
  //       toHuman(item.createdAt) || "-",
  //     ];
  //     worksheet.addRow(row);
  //   });

  //   workbook.xlsx.writeBuffer().then((buffer) => {
  //     const blob = new Blob([buffer], {
  //       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //     });

  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = "quoteslist.xlsx";
  //     a.click();
  //     window.URL.revokeObjectURL(url);
  //   });
  // };

  const handleApprovedChange = async (quote) => {
    try {
      console.log(quote);
      __state.loading = true;

      const response = await fetch(`/api`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: `/quotes/approve/${quote.id}`,
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
              serviceTypeId: quote.service,
              customer: data.id,
              device: quote.device,
              brand: quote.brand,
              problemDescription: quote.problemDescription,
            },
          }),
        });
        toast.info(`Quote has been approved successfully`);
        setquotes((prev) =>
          prev.map((project_inquiry) =>
            project_inquiry.id === quote.id
              ? { ...project_inquiry, approved: !project_inquiry.approved }
              : project_inquiry
          )
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

  useEffect(() => {
    setquotes(quotesFromServer);
  }, [quotesFromServer]);

  return (
    <Main
      title={`Quotes (${!fetched ? "" : totalCount})`}
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
              {/* <Button
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
              </Button> */}
            </div>
          </div>

          <Table responsive="xl" bordered striped className="shadow">
            <thead className="bg-secondary shadow">
              <tr className="align-middle">
                <th>Full Name</th>
                <th>Email</th>
                <th>Number</th>
                <th>DeviceName</th>
                <th>Brand</th>
                <th>Description</th>
                <th>Reqested for</th>
                <th>Approved</th>
                <th>Submited Date</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody style={{ overflowY: "auto" }}>
              {quotes.length > 0 ? (
                quotes.map((project_inquiry) => (
                  <tr key={project_inquiry.id} className="align-middle">
                    <td>{project_inquiry.customerName}</td>

                    <td>{project_inquiry.customerEmail}</td>
                    <td>
                      <a href={`tel:${project_inquiry.customerPhone}`}>
                        {project_inquiry.customerPhone}
                      </a>
                    </td>
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
                    <td>
                      {project_inquiry.onSiteRepair ? "Onsite" : "Inshop"}
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
                    <td>{toHuman(project_inquiry.createdAt)}</td>

                    <td>
                      <ButtonGroup size="sm">
                        <Link href={`/quotes/show/${project_inquiry.id}`}>
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
