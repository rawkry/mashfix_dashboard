import {
  Card,
  Col,
  Form,
  InputGroup,
  Modal,
  Row,
  Table,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import React, { useEffect, useRef, useState } from "react";

import { Button } from "@/ui";
import { Main } from "@/layouts";

import getMyProfile from "@/helpers/server/getMyProfile";
import { callFetch } from "@/helpers/server";
import { IssuesFormFields } from "@/reuseables";
import { useRouter } from "next/router";

import { PrintInvoice, PrintPage } from "../../../components";

import { useReactToPrint } from "react-to-print";
import Link from "next/link";

export async function getServerSideProps(context) {
  try {
    const myProfile = await getMyProfile(context);
    if (myProfile.role !== "admin") {
      return {
        notFound: true,
      };
    }
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

export default function Add({ __state, myProfile, receipt: serverReceipt }) {
  const [receipt, setReceipt] = useState(serverReceipt);

  const [openRemarkModal, setOpenRemarkModal] = useState(false);
  const [remark, setRemark] = useState("");
  const [viewRemarks, setViewRemarks] = useState(false);
  const [changes, setChanges] = useState({});
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

  const [selectedMethods, setSelectedMethods] = useState({
    cash:
      receipt.paymentMethod.includes("cash") ||
      receipt.paymentMethod === "cash",
    card:
      receipt.paymentMethod.includes("card") ||
      receipt.paymentMethod === "card",
  });

  const [amounts, setAmounts] = useState({
    cash: selectedMethods.cash ? receipt.chargePaid : 0,
    card: selectedMethods.card
      ? receipt.chargePaidCard || receipt.chargePaid
      : 0,
  });

  const handleCheckboxChange = (method) => {
    setSelectedMethods((prev) => ({
      ...prev,
      [method]: !prev[method],
    }));
  };

  const handleAmountChange = (method, value) => {
    setAmounts((prev) => ({
      ...prev,
      [method]: value,
    }));
  };

  const onSubmit = async (data) => {
    if (
      receipt.repair.status === "completed" ||
      receipt.repair.status === "pickedup"
    ) {
      setOpenRemarkModal(true);
    } else {
      await submitForm(data);
    }
  };

  const submitForm = async (data) => {
    try {
      __state.loading = true;
      const issueswithprice = Object.entries(issuesWithPrice).map(
        ([key, issue]) => ({
          description: issue.description,
          quantity: issue.quantity,
          rate: issue.rate,
          price: issue.price,
          actualPrice: issue.actualPrice,
        })
      );
      const dirty = JSON.stringify(
        checkDirtyValues(defaultValues, {
          ...data,
          issuesWithPrice: issueswithprice,
          chargePaid: parseFloat(amounts.cash),
          chargePaidCard: parseFloat(amounts.card),
          paymentMethod: Object.keys(selectedMethods).filter(
            (key) => selectedMethods[key]
          ),
        })
      );

      setChanges(dirty);
      const paymentMethod = Object.keys(selectedMethods).filter(
        (key) => selectedMethods[key]
      );

      if (paymentMethod.length === 0) {
        toast.error("Please select atleast one payment method");
        return;
      }

      const paymentObj = {
        paymentMethod,
        chargePaid: paymentMethod.includes("cash")
          ? parseFloat(amounts.cash)
          : 0,
        chargePaidCard: paymentMethod.includes("card")
          ? parseFloat(amounts.card)
          : 0,
      };

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
            ...paymentObj,
            issuesWithPrice: issueswithprice,
          },
        }),
      });
      const json = await receiptResponse.json();

      if (!receiptResponse.ok) {
        return toast.error("Failed to update receipt");
      }
      if (openRemarkModal) {
        const response = await fetch(`/api`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: `/repairs/remarks/${receipt.repair._id}`,
            method: "PATCH",
            body: {
              changes: dirty,
              description: remark,
            },
          }),
        });
        const json = await response.json();
        if (!response.ok) {
          return toast.error("Failed to add remark");
        }
        toast.success(`Remark   has been updated successfully`);
        setOpenRemarkModal(false);
        return;
      }
      setReceipt((prev) => ({
        ...prev,
        paymentMethod: json.paymentMethod,
        issuesWithPrice: json.issuesWithPrice,
        discount: json.discount,
        chargePaid: json.chargePaid,
        chargePaidCard: json.chargePaidCard,
        expectedServiceCharge: json.expectedServiceCharge,
      }));
      toast.success(`Receipt  has been updated successfully`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      __state.loading = false;
    }
  };

  const sendEmail = async () => {
    try {
      __state.loading = true;
      const response = await fetch(`/api/receipt/${receipt.customer._id}`, {
        method: "POST",
        body: pdf,
      });
      const json = response.json();
      if (!response.ok) {
        toast.error(json.message);
      }
      setOpenEmailDialog(false);
      toast.success("Receipt has been successfully send");
    } catch (error) {
      toast.error(error.message);
    } finally {
      __state.loading = false;
    }
  };

  const handleImageChange = (event) => {
    event.preventDefault();

    const file = event.target.files[0];

    if (file) {
      const formData = new FormData();
      formData.append("receipt", file);
      setPdf(formData);
    } else {
      setPdf(null);
    }
  };

  function checkDirtyValues(prev, current) {
    const dirty = {};

    const checkArrayChanges = (prevArray, currentArray, key) => {
      const changes = [];

      // Check for changes in existing items and capture new ones
      currentArray.forEach((currentItem, index) => {
        const prevItem = prevArray[index];

        if (prevItem) {
          const itemChanges = {};

          // Check each field for changes
          Object.keys(currentItem).forEach((field) => {
            if (prevItem[field] !== currentItem[field]) {
              itemChanges[field] = currentItem[field]; // Capture the new value
            }
          });

          // Only add to changes if there are any modifications
          if (Object.keys(itemChanges).length > 0) {
            changes.push(itemChanges);
          }
        } else {
          // If prevItem doesn't exist, it means it's a new addition
          changes.push(currentItem);
        }
      });

      // If there are changes, record them
      if (changes.length > 0) {
        dirty[key] = {
          prev: prevArray,
          new: changes,
        };
      }
    };

    // Iterate through the keys in prev
    Object.keys(prev).forEach((key) => {
      if (current.hasOwnProperty(key)) {
        if (Array.isArray(prev[key]) && Array.isArray(current[key])) {
          checkArrayChanges(prev[key], current[key], key);
        } else if (prev[key] !== current[key]) {
          // Handle non-array fields
          dirty[key] = {
            prev: prev[key],
            new: current[key],
          };
        }
      }
    });

    return dirty;
  }

  const handleRemarkSubmit = () => {
    if (!remark.trim().length > 0) return toast.error("Please enter remark");
    // Close the modal and submit the form with the remark
    handleSubmit(submitForm)();
  };

  const defaultValues = {
    paymentMethod: receipt.paymentMethod,
    chargePaidCard: receipt.chargePaidCard,
    chargePaid: receipt.chargePaid,
    discount: receipt.discount,
    chargePaid: receipt.chargePaid,
    expectedServiceCharge: receipt.expectedServiceCharge,
    actualCost: receipt.actualCost,
    issuesWithPrice: receipt.issuesWithPrice.map((issue) => ({
      description: issue.description,
      price: issue.price,
      quantity: issue.quantity,
      rate: issue.rate,
    })),
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  return (
    <Main
      title={`Receipt : ${receipt.customer.name} `}
      icon="fa-solid fa-users"
      profile={myProfile}
    >
      <div className="container-fluid pb-3 d-flex justify-content-between ">
        <Button
          variant="outline-primary"
          size="md"
          onClick={() => router.back()}
        >
          <i className="fa-solid fa-arrow-left mr-2"></i>
        </Button>
        <div className="d-flex gap-2 border ">
          <Button
            title={"Send Email"}
            variant={"primary"}
            onClick={() => setOpenEmailDialog(true)}
          >
            <i className="fa-solid fa-envelope mr-2"></i>
          </Button>
          <Button
            className="shadow"
            variant={"primary"}
            onClick={handleInvoice}
            title={"Print Invoice"}
            // disabled={receipt.issuesWithPrice.length < 1}
          >
            <i className="fa-solid fa-file-invoice mr-2 text-danger"></i>
          </Button>
          <Button
            title={"Print Receipt"}
            variant={"primary"}
            className="shadow"
            onClick={handlePrint}
            // disabled={receipt.issuesWithPrice.length < 1}
          >
            <i className="fa-solid fa-print mr-2 text-primary"></i>
          </Button>
          <Button
            title={"View Remarks"}
            variant="outline-primary"
            size="md"
            onClick={() => setViewRemarks(true)}
          >
            <i className="fa-solid fa-comment mr-2 text-success"></i>
          </Button>

          <Button
            title={"View Receipt"}
            variant="outline-primary"
            size="md"
            as={Link}
            href={`/repair/${receipt.repair._id}/view-receipt`}
          >
            <i className="fa-solid fa-eye mr-2 text-warning"></i>
          </Button>
        </div>
      </div>

      <Row className="mb-3">
        {/* Customer Details Card */}
        <Col md={6} sm={12}>
          <Card className="shadow bg-light">
            <Card.Header as="h5">Customer Details</Card.Header>
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
            <Card.Header as="h5">Service Details</Card.Header>
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
            <Form.Group className="mb-3">
              <Form.Label>Discount</Form.Label>
              <Form.Control
                className="rounded-pill"
                type="number"
                step={0.01}
                placeholder="Enter Discount"
                {...register("discount", {
                  valueAsNumber: true,
                })}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="expectedServiceCharge">
              <Form.Label>Service Charge</Form.Label>
              <Form.Control
                className="rounded-pill"
                step={0.01}
                type="number"
                placeholder="Enter Expected Service Charge"
                {...register("expectedServiceCharge", {
                  valueAsNumber: true,
                })}
              />
              {errors.expectedServiceCharge && (
                <span className="text-danger">Provide Service Charge</span>
              )}
            </Form.Group>
            <Form.Group className="mb-3" controlId="actuakCost">
              <Form.Label>COGS</Form.Label>
              <Form.Control
                step={0.01}
                type="number"
                placeholder="Enter COGS"
                {...register("actualCost", { valueAsNumber: true })}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="paymentMethod">
              <Form.Label>Payment Method</Form.Label>
              <div className="d-flex gap-5">
                <div>
                  <Form.Check
                    type="checkbox"
                    aria-label="Cash"
                    checked={selectedMethods.cash}
                    onChange={() => handleCheckboxChange("cash")}
                  >
                    <Form.Check.Input
                      className="rounded-pill"
                      type="checkbox"
                      value="cash"
                      name="paymentMethod"
                      checked={selectedMethods.cash}
                      onChange={() => handleCheckboxChange("cash")}
                    />
                    <Form.Check.Label>Cash</Form.Check.Label>
                  </Form.Check>

                  {selectedMethods.cash && (
                    <Form.Control
                      className="rounded-pill"
                      type="number"
                      placeholder="Enter cash Amount"
                      required={selectedMethods.cash}
                      value={amounts.cash}
                      onChange={(e) =>
                        handleAmountChange("cash", e.target.value)
                      }
                    />
                  )}
                </div>
                <div>
                  <Form.Check
                    type="checkbox"
                    aria-label="Card"
                    checked={selectedMethods.card}
                    onChange={() => handleCheckboxChange("card")}
                  >
                    <Form.Check.Input
                      className="rounded-pill"
                      type="checkbox"
                      value="card"
                      name="paymentMethod"
                      checked={selectedMethods.card}
                      onChange={() => handleCheckboxChange("card")}
                    />
                    <Form.Check.Label>Card</Form.Check.Label>
                  </Form.Check>

                  {selectedMethods.card && (
                    <Form.Control
                      className="rounded-pill"
                      type="number"
                      placeholder="Enter Card Amount"
                      required={selectedMethods.card}
                      value={amounts.card}
                      onChange={(e) =>
                        handleAmountChange("card", e.target.value)
                      }
                    />
                  )}
                </div>
              </div>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button className="shadow" variant={"primary"} type="submit">
                {__state.loading ? (
                  <i className="fa fa-spinner fa-spin"></i>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </Form>

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

        <Modal
          show={openRemarkModal}
          onHide={() => setOpenRemarkModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Add Remark</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group controlId="remark">
              <Form.Control
                required
                as="textarea"
                rows={3}
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleRemarkSubmit}>
              Submit with Remark
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          scrollable
          show={viewRemarks}
          onHide={() => setViewRemarks(false)}
          centered
          size="xl"
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
                {receipt.repair.remarks.map((remark, index) => (
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
          <Modal.Footer>
            <Button variant="primary" onClick={() => setViewRemarks(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Main>
  );
}
