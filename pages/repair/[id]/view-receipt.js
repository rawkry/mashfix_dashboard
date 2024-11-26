import {
  Badge,
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
import { useRef, useState } from "react";
import { Button } from "@/ui";
import { Main } from "@/layouts";
import getMyProfile from "@/helpers/server/getMyProfile";
import { callFetch } from "@/helpers/server";
import { useReactToPrint } from "react-to-print";
import { PrintInvoice, PrintPage } from "@/components";
import { useRouter } from "next/router";
import Link from "next/link";
import { IssuesFormFields } from "@/reuseables";

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
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [pdf, setPdf] = useState(null);
  const [viewRemarks, setViewRemarks] = useState(false);
  const [issuesWithPrice, setIssuesWithPrice] = useState(
    receipt.issuesWithPrice
  );
  const [updateCostPrice, setUpdateCostPrice] = useState(false);

  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  const invoiceRef = useRef(null);
  const handleInvoice = useReactToPrint({
    content: () => invoiceRef.current,
  });
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
  const defaultValues = {
    discount: receipt.discount,
    chargePaid: receipt.chargePaid,
    expectedServiceCharge: receipt.expectedServiceCharge,
    paymentMethod: receipt.paymentMethod,
  };
  const shouldShowButton =
    myProfile.role != "user" && receipt.repair?.status != "pickedup";

  const {
    watch,
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  const updateCost = async () => {
    try {
      __state.loading = true;
      const issueswithprice = Object.entries(issuesWithPrice).map(
        ([key, issue]) => ({
          description: issue.description,
          quantity: issue.quantity,
          rate: issue.rate,
          price: issue.price,
          actualPrice: parseFloat(issue.actualPrice).toFixed(2),
          sellerDetails: issue.sellerDetails,
        })
      );
      const obj = {
        ...receipt,
        issuesWithPrice: issueswithprice,
      };

      const response = await fetch(`/api`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: `/receipts/${receipt._id}`,
          method: "PUT",
          body: obj,
        }),
      });
      const json = response.json();
      if (!response.ok) {
        toast.error(json.message);
      }
      toast.success("Receipt has been successfully updated");
    } catch (error) {
      toast.error(error.message);
    } finally {
      __state.loading = false;
    }
  };
  return (
    <Main
      title={`Receipt : ${receipt.customer.name} `}
      icon="fa-solid fa-users"
      profile={myProfile}
    >
      <div className="container-fluid pb-3 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        {/* Back Button */}
        <Button
          variant="outline-primary"
          size="md"
          onClick={() => router.back()}
          className="order-2 order-md-1"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i>
        </Button>

        {/* Action Buttons */}
        <div className="d-flex flex-wrap justify-content-center gap-2 border p-2 rounded order-1 order-md-2">
          <Button
            title={"Send Email"}
            variant={"primary"}
            onClick={() => setOpenEmailDialog(true)}
            className="btn-sm"
          >
            <i className="fa-solid fa-envelope mr-2"></i>
          </Button>
          <Button
            className="shadow btn-sm"
            variant={"primary"}
            onClick={handleInvoice}
            title={"Print Invoice"}
          >
            <i className="fa-solid fa-file-invoice mr-2 text-danger"></i>
          </Button>
          <Button
            title={"Print Receipt"}
            variant={"primary"}
            className="shadow btn-sm"
            onClick={handlePrint}
          >
            <i className="fa-solid fa-print mr-2 text-primary"></i>
          </Button>
          <Button
            title={"View Remarks"}
            variant="outline-primary"
            onClick={() => setViewRemarks(true)}
          >
            <i className="fa-solid fa-comment mr-2 text-success"></i>
          </Button>
          {shouldShowButton && (
            <Link href={`/repair/${router.query.id}/edit-receipt`}>
              <Badge title="Edit" as={Button} variant={"primary"}>
                <i className="fas fa-edit" />
              </Badge>
            </Link>
          )}
          <Button
            title={"Update Cost Price"}
            variant="outline-primary"
            onClick={() => setUpdateCostPrice(true)}
          >
            <i className="fa-solid fa-thumbtack mr-2 text-warning"></i>
          </Button>
        </div>
      </div>

      <Row className=" mb-3">
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
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {receipt.issuesWithPrice.length > 0 ? (
                receipt.issuesWithPrice.map((item, index) => (
                  <tr key={index}>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>${item.rate}</td>
                    <td>${item.price}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4 " className="text-center">
                    No Issues Found ...
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
          <Form.Group className="mb-3" controlId="discount">
            <Form.Label>Discount</Form.Label>
            <Form.Control
              readOnly
              className="rounded-pill"
              type="text"
              placeholder="Enter Discount"
              {...register("discount")}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="expectedServiceCharge">
            <Form.Label>Service Charge</Form.Label>
            <Form.Control
              readOnly
              className="rounded-pill"
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
              readOnly
              className="rounded-pill"
              type="number"
              placeholder="Enter  Charge Paid"
              {...register("chargePaid")}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="paymentMethod">
            <Form.Label>Payment Method</Form.Label>
            <Form.Control
              className="rounded-pill"
              readOnly
              aria-label="Payment Method"
              {...register("paymentMethod")}
            />
          </Form.Group>
        </Card>
        <div ref={componentRef}>
          <PrintPage data={receipt} />
        </div>
        <div ref={invoiceRef}>
          <PrintInvoice data={receipt} />
        </div>
      </div>

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
            <Form.Control type="file" name="pdf" onChange={handleImageChange} />
          </InputGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={sendEmail}>Send Email</Button>
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

      <Modal
        scrollable
        show={updateCostPrice}
        onHide={() => setUpdateCostPrice(false)}
        centered
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>Update Cost Price</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <IssuesFormFields
            setIssuesWithPrice={setIssuesWithPrice}
            issuesWithPrice={issuesWithPrice}
            withCostPrice={true}
            withSellerDetails={true}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={updateCost}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>
    </Main>
  );
}
