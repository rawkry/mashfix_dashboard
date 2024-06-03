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

export async function getServerSideProps(context) {
  try {
    const myProfile = await getMyProfile(context);
    const [status, { serviceTypes }] = await callFetch(
      context,
      `/serviceTypes?active=true`,
      "GET"
    );

    return {
      props: {
        serviceTypes,
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

export default function Add({ __state, myProfile, serviceTypes }) {
  const [issuesWithPrice, setIssuesWithPrice] = useState({});
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

      const customer = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      };
      const customerResponse = await fetch(`/api`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: `/customers`,
          method: "POST",
          body: customer,
        }),
      });
      let customerJson;
      if (customerResponse.status === 400) {
        const json = await customerResponse.json();
        customerJson = json.customer;
      } else {
        customerJson = await customerResponse.json();
      }

      console.log("customerJson", customerJson);
      const response = await fetch(`/api`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: `/repairs`,
          method: "POST",
          body: {
            serviceTypeId: data.serviceTypeId,
            customer: customerJson.id,
            device: data.device,
            brand: data.brand,
            problemDescription: data.problemDescription,
          },
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        return toast.error(json.message);
      }

      toast.success(`Repair  has been successfully added`);
      reset();
    } catch (e) {
      toast.error(e.message);
    } finally {
      __state.loading = false;
    }
  };

  const {
    watch,
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  return (
    <Main title="Repair || Add " icon="fa-solid fa-users" profile={myProfile}>
      <div>
        <Card className="shadow-sm p-4">
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3" controlId="service_type">
              <Form.Label>Service Type</Form.Label>
              <Form.Select
                {...register("serviceTypeId", {
                  required: true,
                })}
              >
                <option value="">Select Service Type</option>
                {serviceTypes.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </Form.Select>
              {errors.serviceTypeId && (
                <span className="text-danger">Service Type is required</span>
              )}
            </Form.Group>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Customer Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                {...register("name", {
                  required: true,
                  setValueAs: (value) => value.trim(),
                })}
              />
              {errors.customerName && (
                <span className="text-danger">Name cannot be empty</span>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="vehicle_number">
              <Form.Label>Customer Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter  Customer email"
                {...register("email", {
                  required: true,

                  setValueAs: (value) => value.trim().toLowerCase(),
                })}
              />
              {errors.customerEmail && (
                <span className="text-danger">Provide valid email</span>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="Address">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter phone number"
                {...register("phone", {
                  required: true,
                })}
              />
              {errors.customerPhone && (
                <span className="text-danger">Provide valid phone number</span>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter customer address"
                {...register("address", {
                  required: true,
                  setValueAs: (value) => value.trim(),
                })}
              />
              {errors.address && (
                <span className="text-danger">Address cannot be empty</span>
              )}
            </Form.Group>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Device Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter device name"
                {...register("device", {
                  required: true,
                  setValueAs: (value) => value.trim(),
                })}
              />
              {errors.device && (
                <span className="text-danger">Device Name cannot be empty</span>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="brand">
              <Form.Label>Brand</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter device brand name"
                {...register("brand", {
                  required: true,
                  setValueAs: (value) => value.trim(),
                })}
              />
              {errors.brand && (
                <span className="text-danger">Brand Name cannot be empty</span>
              )}
            </Form.Group>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Problem Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter customer phone"
                {...register("problemDescription", {
                  required: true,
                  setValueAs: (value) => value.trim(),
                })}
              />
              {errors.problemDescription && (
                <span className="text-danger">
                  Problem Description cannot be empty
                </span>
              )}
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button className="shadow" type="submit">
                Submit Repair
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </Main>
  );
}
