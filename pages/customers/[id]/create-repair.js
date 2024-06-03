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
    const [[service_status, { serviceTypes }], [customer_status, customer]] =
      await Promise.all([
        callFetch(context, `/serviceTypes?active=true`, "GET"),
        callFetch(context, `/customers/${context.params.id}`, "GET"),
      ]);

    if (service_status !== 200 || customer_status !== 200) {
      return {
        props: {
          fetched: false,
        },
      };
    }

    return {
      props: {
        serviceTypes,
        customer,
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

export default function Add({ __state, myProfile, serviceTypes, customer }) {
  console.log(serviceTypes);
  const onSubmit = async (data) => {
    try {
      __state.loading = true;

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
            customer: customer.id,
            deviceName: data.deviceName,
            model: data.model,
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
    <Main
      title={`Repair || Add - ${customer.name} `}
      icon="fa-solid fa-users"
      profile={myProfile}
    >
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
              <Form.Label>Device Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter customer phone"
                {...register("deviceName", {
                  required: true,
                  setValueAs: (value) => value.trim(),
                })}
              />
              {errors.deviceName && (
                <span className="text-danger">Device Name cannot be empty</span>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Model</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter customer phone"
                {...register("model", {
                  required: true,
                  setValueAs: (value) => value.trim(),
                })}
              />
              {errors.model && (
                <span className="text-danger">Model Name cannot be empty</span>
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
