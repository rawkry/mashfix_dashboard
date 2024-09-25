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

export async function getServerSideProps(context) {
  try {
    const myProfile = await getMyProfile(context);
    if (myProfile.role != "admin") {
      return {
        notFound: true,
      };
    }
    const { limit = 10 } = context.query;
    const [status, { receipts, total, currentPage, pages }] = await callFetch(
      context,
      `/receipts?limit=${limit}&${querystring.stringify(context.query)}`,
      "GET"
    );

    if (status !== 200) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
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
  receipts: receiptsFromServer,
  currentPage,
  limit,
  pages,
  fetched,
  myProfile,
  total,
  __state,
}) {
  const router = useRouter();

  const [receipts, setreceipts] = useState(receiptsFromServer);

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
          <div className="d-flex flex-wrap justify-content-between align-items-center w-100 mb-4">
            <Form.Group className="d-flex align-items-center gap-2 mb-3">
              <Form.Control
                type="search"
                placeholder="Name"
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
                className="rounded-pill"
              />
              <Form.Control
                type="search"
                placeholder="Phone"
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
                className="rounded-pill"
              />
              <FloatingLabel
                controlId="floatingSelect"
                label="Status"
                className="w-100 rounded-pill"
              >
                <select
                  className="form-select form-select-xl"
                  defaultValue={router.query.paymentMethod || "All"}
                  onChange={(e) => {
                    const { value } = e.target;
                    const query = { ...router.query };
                    if (value === "All") {
                      delete query.paymentMethod;
                    } else {
                      query.paymentMethod = value;
                    }
                    router.push({ pathname: router.pathname, query });
                  }}
                >
                  <option value="All">All</option>
                  {["cash", "card"].map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </FloatingLabel>
            </Form.Group>

            <div className="d-flex gap-2 align-items-center mb-3">
              <div className="d-flex align-items-center">
                <div
                  onClick={() => setActiveModalShow(true)}
                  className="border-zapp-alt p-2 text-zapp hover d-flex align-items-center"
                >
                  <i className="fas fa-calendar-alt"></i>
                  {router.query.fromDate && toTrend(router.query.fromDate)}
                  <small className="font-zapp-bold mx-1"> - To - </small>
                  <i className="fas fa-calendar-alt"></i>
                  {router.query.toDate && toTrend(router.query.toDate)}
                </div>
                {(router.query.fromDate || router.query.toDate) && (
                  <span
                    className="m-2 text-danger hover"
                    onClick={() => {
                      const { fromDate, toDate, ...query } = router.query;
                      router.push({ pathname: router.pathname, query });
                    }}
                  >
                    <i className="fas fa-times-circle"></i>
                  </span>
                )}
              </div>

              <Button variant="outline-primary" onClick={() => exportToExcel()}>
                <i className="fas fa-file-export text-primary "></i>
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
                          <Button
                            variant="outline-primary"
                            size="sm"
                            title={"View"}
                          >
                            <i className="fas fa-eye me-1"></i>
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
          <Limit limit={limit} />
        </>
      )}
    </Main>
  );
}
