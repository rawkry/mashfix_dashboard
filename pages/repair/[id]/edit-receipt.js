import { Card, Col, Form, InputGroup, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useState } from "react";

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
  console.log(receipt);
  const router = useRouter();
  const [issuesWithPrice, setIssuesWithPrice] = useState(
    receipt.issuesWithPrice
  );
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
          path: `/receipts/${receipt.id}`,
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
                placeholder="Enter Discount"
                {...register("discount")}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="expectedServiceCharge">
              <Form.Label>Service Charge</Form.Label>
              <Form.Control
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
                type="number"
                placeholder="Enter  Charge Paid"
                {...register("chargePaid")}
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button className="shadow" type="submit">
                Submit receipt
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </Main>
  );
}
