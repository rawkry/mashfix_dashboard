import {
  ButtonGroup,
  Form,
  Table,
  FloatingLabel,
  Modal,
  Badge,
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

import getMyProfile from "@/helpers/server/getMyProfile";
import { object } from "yup";

export async function getServerSideProps(context) {
  try {
    const myProfile = await getMyProfile(context);
    if (myProfile.role != "admin") {
      return {
        notFound: true,
      };
    }
    const { limit = 10 } = context.query;
    const [
      [status, { receipts, total, currentPage, pages }],
      [status1, stats],
    ] = await Promise.all([
      callFetch(
        context,
        `/receipts?limit=${limit}&${querystring.stringify(context.query)}`,
        "GET"
      ),
      callFetch(context, `/receipts/stats`, "GET"),
    ]);

    if (status !== 200 || status1 !== 200) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        stats,
        receipts,
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

export default function Index({
  stats,
  receipts: receiptsFromServer,
  currentPage,
  limit,
  pages,
  fetched,
  myProfile,
  total,
  __state,
}) {
  console.log("stats", stats);
  const router = useRouter();

  const [receipts, setreceipts] = useState(receiptsFromServer);
  console.log(receipts);

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

    receipts.forEach((item) => {
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
      a.download = "receiptslist.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    });
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
    setreceipts(receiptsFromServer);
  }, [receiptsFromServer]);

  return (
    <Main
      title={`Sales (${!fetched ? "" : total}) `}
      icon="fa-solid fa-wave-square"
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
          <div className="d-flex  align-items-center justify-content-around  gap-3 p-3 bg-light rounded shadow-sm text-dark mb-2 ">
            <div className=" flex bg-white p-2 rounded shadow-sm text-center  ">
              <h4>Discount</h4>{" "}
              <h2 className="text-warning">$ {stats.discount || 0}</h2>
            </div>
            <div className="flex bg-white p-2 rounded shadow-sm text-center ">
              <h4>Service Charge</h4>
              <h2 className="text-success ">
                {" "}
                $ {stats.totalExpectedServiceCharge || 0}{" "}
              </h2>
            </div>

            <div className=" flex bg-white p-2 rounded shadow-sm text-center ">
              <h4>Issue Price</h4>{" "}
              <h2 className="text-success">$ {stats.totalIssuesPrice || 0} </h2>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center w-100">
            <Form.Group
              className="d-flex align-items-center gap-2"
              style={{
                marginBottom: "1rem",
              }}
            >
              <Form.Control
                type="search"
                placeholder=" name"
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
                placeholder=" phone"
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
              <FloatingLabel
                controlId="floatingSelect"
                label="Status"
                style={{
                  width: "100%",
                }}
              >
                <select
                  className="form-select form-select-sm"
                  defaultValue={router.query.paymentMethod || "All"}
                  onChange={(e) => {
                    const { value } = e.target;

                    if (value === "All") {
                      const { paymentMethod, ...query } = router.query;
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
                        paymentMethod: value,
                      },
                    });
                  }}
                >
                  <option value="All">All</option>
                  {["cash", "card"].map((item, index) => (
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

            <div className="d-flex gap-2 mb-2 align-items-center">
              <div>
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
                <th>Customer</th>
                <th>Paid By</th>
                <th>Service </th>
                <th>Service Charge</th>
                <th>Discount</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Options</th>
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
                      {receipts.issuesWithPrice.reduce((accumulator, item) => {
                        return (accumulator += item.price);
                      }, 0)}
                    </td>
                    <td>{toHuman(receipts.createdAt)}</td>
                    <td>
                      <ButtonGroup size="sm">
                        <Link
                          href={`/repair/${receipts.repair._id}/view-receipt`}
                        >
                          <Button size="sm">
                            <i className="fas fa-eye me-1"></i> View
                          </Button>
                        </Link>
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
