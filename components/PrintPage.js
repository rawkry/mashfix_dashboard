import { toHuman } from "@/helpers/clients";
import React, { forwardRef, useEffect } from "react";
import { Table } from "react-bootstrap";

// import { timeFomate, toHuman } from "@/helper/client";

const PrintPage = forwardRef((props, ref) => {
  const { data } = props;
  const subtotal = data.issuesWithPrice.reduce(
    (acc, item) => acc + item.price,
    0
  );

  const taxRate = 0.0825;

  const salesTax = subtotal * taxRate;

  const serviceCharge = data.expectedServiceCharge;

  const total = subtotal + salesTax + serviceCharge - data.discount;

  const balanceDue = total - data.chargePaid;

  return (
    <div ref={ref} className="print_container font-zapp ">
      <div
        className="print d-none"
        style={{
          color: "black",
          backgroundColor: "white",
        }}
      >
        <div className="header text-center">
          <img
            src="/logo.png"
            style={{
              width: "10rem",
              height: "10rem",
              objectFit: "contain",
            }}
          />
          <h1>Nepfosys LLC</h1>
          <p>3612 Portland Street, Irving, Texas 75062, U.S.A</p>
          <p>info@nepfosys.com | www.mashfix.com</p>
        </div>
        <div className="doted"></div>

        <h4
          className="text-center fw-normal p-2"
          style={{
            color: "black",
          }}
        >
          INVOICE
        </h4>
        <div className="doted"></div>

        <div className="d-flex  justify-content-between align-items-center p-3">
          <div>
            <p>Invoice Date: </p>
            <p>Invoice Number</p>
          </div>
          <div>
            <p>{new Date().toLocaleDateString()}</p>
            <p>{data.id}</p>
          </div>
        </div>
        <div className="doted"></div>
        <div className="d-flex justify-content-between align-items-center p-3">
          <div>
            <p>Customer Name</p>
            <p>Phone Number</p>
          </div>
          <div>
            <p>{data.customer.name}</p>
            <p>{data.customer.phone}</p>
          </div>
        </div>
        <div className="doted"></div>
        <Table
          striped
          bordered
          hover
          style={{
            color: "black",
            backgroundColor: "white",
          }}
        >
          <thead>
            <tr className="text-center">
              <th>Description</th>
              <th>Quantity</th>

              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data?.issuesWithPrice?.map((item, index) => (
              <tr key={index}>
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                <td>{item.price}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div className="doted"></div>
        <div
          className="d-flex justify-content-around p-3  "
          style={{
            gap: "3rem",
          }}
        >
          <div>
            <p>Subtotal:</p>
            <p>Sales Tax (8.25%):</p>
            <p>Service Charge</p>
            <p>Discount</p>
            <p className=" fw-bolder">Total: </p>
            <p>Payment Made</p>
          </div>
          <div>
            <p>{subtotal.toFixed(2)}</p>
            <p>{salesTax.toFixed(2)}</p>

            <p>{serviceCharge.toFixed(2)}</p>
            <p>-{data.discount.toFixed(2)}</p>
            <p className=" fw-bolder">{total.toFixed(2)}</p>
            <p>-{data.chargePaid.toFixed(2)}</p>
          </div>
        </div>
        <div
          style={{ height: "1px", background: "black", width: "100%" }}
        ></div>
        <div className="d-flex justify-content-around p-1 fw-bolder">
          <div>
            <p>Balance Due:</p>
          </div>
          <div>
            <p>{balanceDue.toFixed(2)}</p>
          </div>
        </div>
        <div
          style={{ height: "1px", background: "black", width: "100%" }}
        ></div>

        <div className="d-flex mt-3 flex-column justify-content-center align-items-center">
          <div>
            <p>Thank you for your business!</p>
          </div>
          <div>
            <p>www.mashfix.com</p>
          </div>
        </div>
      </div>
    </div>
  );
});

PrintPage.displayName = "PrintPage";

export default PrintPage;
