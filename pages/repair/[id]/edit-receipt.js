import { Card, Col, Form, InputGroup, Modal, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import React, { useRef, useState } from "react";

import { Button } from "@/ui";
import { Main } from "@/layouts";
import {
  generateFakeEmail,
  generateFakeNumber,
  generateFakePan,
} from "@/helpers/clients";
import getMyProfile from "@/helpers/server/getMyProfile";
import { callFetch } from "@/helpers/server";
import { IssuesFormFields } from "@/reuseables";
import { useRouter } from "next/router";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

import { PdfReceipt, PrintInvoice, PrintPage } from "../../../components";
import generatePDF from "react-to-pdf";
import { useReactToPrint } from "react-to-print";

export async function getServerSideProps(context) {
  try {
    const myProfile = await getMyProfile(context);
    const [status, receipt] = await callFetch(
      context,
      `/receipts/${context.params.id}`,
      "GET"
    );

    return {
      props: {
        receipt,
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

export default function Add({ __state, myProfile, receipt }) {
  const router = useRouter();
  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  const invoiceRef = useRef(null);
  const handleInvoice = useReactToPrint({
    content: () => invoiceRef.current,
  });

  const [issuesWithPrice, setIssuesWithPrice] = useState(
    receipt.issuesWithPrice
  );
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [pdf, setPdf] = useState(null);

  const onSubmit = async (data) => {
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

      const receiptResponse = await fetch(`/api`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: `/receipts/${receipt._id}`,
          method: "PUT",
          body: {
            ...data,
            issuesWithPrice: issueswithprice,
          },
        }),
      });
      if (!receiptResponse.ok) {
        return toast.error("Failed to update receipt");
      }

      toast.success(`Receipt  has been updated successfully`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      __state.loading = false;
    }
  };

  const sendEmail = async () => {
    try {
      const response = await fetch(`/api/receipt/${receipt.customer._id}`, {
        method: "POST",
        body: pdf,
      });
    } catch (error) {
      toast.error(error.message);
    }
  };

  // const generatePdf = async () => {
  //   try {
  //     console.log("current", componentRef.current);

  //     if (componentRef.current) {
  //       const pdf = await generatePDF(componentRef, {
  //         filename: "receipt.pdf",
  //       });
  //       console.log("Generated PDF:", pdf);
  //       if (pdf) {
  //         // Assuming sendPdfToApi is properly defined and handles the PDF upload
  //         sendPdfToApi(pdf); // Uncomment this line to send PDF to API
  //       } else {
  //         console.error("PDF generation failed or returned undefined");
  //       }
  //     } else {
  //       console.error(
  //         "componentRef.current is not available or referencing the wrong element"
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error generating PDF:", error);
  //   }
  // };

  // const generatePdf = async (toPdf) => {
  //   try {
  //     if (componentRef.current) {
  //       const pdf = await toPdf();
  //       await sendPdfToApi(pdf);
  //     } else {
  //       console.error("componentRef.current is not available");
  //     }
  //   } catch (error) {
  //     console.error("Error generating PDF:", error);
  //   }
  // };

  // const sendPdfToApi = async (pdf) => {
  //   try {
  //     // Example: Send PDF to an API using fetch
  //     const response = await fetch("https://your-api-endpoint.com/upload-pdf", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/pdf",
  //       },
  //       body: pdf,
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to upload PDF");
  //     }

  //     console.log("PDF uploaded successfully");
  //   } catch (error) {
  //     console.error("Error uploading PDF:", error);
  //   }
  // };

  const handleImageChange = (event) => {
    event.preventDefault();

    const file = event.target.files[0];
    console.log(file);
    if (file) {
      const formData = new FormData();
      formData.append("receipt", file);
      setPdf(formData);
    } else {
      setPdf(null);
    }
  };

  const defaultValues = {
    discount: receipt.discount,
    chargePaid: receipt.chargePaid,
    expectedServiceCharge: receipt.expectedServiceCharge,
  };

  const {
    watch,
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues,
  });
  return (
    <Main
      title={`Receipt || Edit : ${receipt.customer.name} `}
      icon="fa-solid fa-users"
      profile={myProfile}
    >
      <div className="container-fluid pb-3 ">
        <Button
          variant="outline-primary"
          size="md"
          onClick={() => router.back()}
        >
          <i className="fa-solid fa-arrow-left mr-2"></i>Back
        </Button>
      </div>
      <Row className="mb-3">
        {/* Customer Details Card */}
        <Col md={6} sm={12}>
          <Card className="shadow bg-light">
            <Card.Header as="h5" className="bg-primary text-white">
              Customer Details
            </Card.Header>
            <Card.Body>
              <Card.Title>{receipt.customer.name}</Card.Title>
              <Card.Text>
                <i className="fas fa-phone m-2"></i>
                {receipt.customer.phone}
              </Card.Text>
              <Card.Text>
                <i className="fas fa-envelope m-2"></i>
                {receipt.customer.email}
              </Card.Text>
              <Card.Text>
                {" "}
                <i className="fas fa-map-marker-alt m-2"></i>
                {receipt.customer.address}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* Service Details Card */}
        <Col md={6} sm={12}>
          <Card className="shadow bg-light">
            <Card.Header as="h5" className="bg-primary text-white">
              Service Details
            </Card.Header>
            <Card.Body className="fw-bold">
              <Card.Title className="m-2 ">
                {receipt.repair.serviceTypeId.name}
              </Card.Title>
              <Card.Text className="m-2">
                Device: {receipt.repair.device}
              </Card.Text>
              <Card.Text className="m-2">
                Brand: {receipt.repair.brand}
              </Card.Text>

              <Card.Text className="m-2">
                Problem: {receipt.repair.problemDescription}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <div>
        <Card className="shadow-sm p-4">
          <Form onSubmit={handleSubmit(onSubmit)}>
            <IssuesFormFields
              setIssuesWithPrice={setIssuesWithPrice}
              issuesWithPrice={issuesWithPrice}
            />
            <Form.Group className="mb-3" controlId="discount">
              <Form.Label>Discount</Form.Label>
              <Form.Control
                type="text"
                step={0.01}
                placeholder="Enter Discount"
                {...register("discount")}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="expectedServiceCharge">
              <Form.Label>Service Charge</Form.Label>
              <Form.Control
                step={0.01}
                type="number"
                placeholder="Enter Expected Service Charge"
                {...register("expectedServiceCharge")}
              />
              {errors.expectedServiceCharge && (
                <span className="text-danger">Provide Service Charge</span>
              )}
            </Form.Group>
            <Form.Group className="mb-3" controlId="charger_paid">
              <Form.Label>Charge Paid</Form.Label>
              <Form.Control
                step={0.01}
                type="number"
                placeholder="Enter  Charge Paid"
                {...register("chargePaid")}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button className="shadow" type="submit">
                Submit receipt
              </Button>
            </div>
          </Form>

          <div className="d-flex gap-2 ">
            <Button variant="success" onClick={() => setOpenEmailDialog(true)}>
              Send Email
            </Button>
            <Button
              className="shadow"
              variant={"primary"}
              onClick={handleInvoice}
              disabled={receipt.issuesWithPrice.length < 1}
            >
              Print Invoice
            </Button>
            <Button
              className="shadow"
              variant="warning"
              onClick={handlePrint}
              disabled={receipt.issuesWithPrice.length < 1}
            >
              Print Receipt
            </Button>
          </div>

          <div ref={componentRef}>
            <PrintPage data={receipt} />
          </div>
          <div ref={invoiceRef}>
            <PrintInvoice data={receipt} />
          </div>
        </Card>

        <Modal
          show={openEmailDialog}
          onHide={() => setOpenEmailDialog(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Send Email</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <InputGroup className="mb-3">
              <Form.Control
                type="file"
                name="pdf"
                onChange={handleImageChange}
              />
            </InputGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={sendEmail}>Send Email</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Main>
  );
}
