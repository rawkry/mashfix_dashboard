import { Card, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";

import { Button } from "@/ui";
import { Main } from "@/layouts";
import {
  generateFakeEmail,
  generateFakeNumber,
  generateFakePan,
} from "@/helpers/clients";
import getMyProfile from "@/helpers/server/getMyProfile";
import { callFetch } from "@/helpers/server";

export async function getServerSideProps(context) {
  try {
    const myProfile = await getMyProfile(context);
    const [status, { serviceTypes }] = await callFetch(
      context,
      `/serviceType?active=true`,
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
  const onSubmit = async (data) => {
    try {
      __state.loading = true;

      const response = await fetch(`/api`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: `/repair`,
          method: "POST",
          body: data,
        }),
      });

      const json = await response.json();
      if (response.status === 201) {
        toast.success(`Repair  has been successfully added`);
        reset();
      } else {
        toast.error(json.message);
      }
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
                {...register("customerName", {
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
                {...register("customerEmail", {
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
                {...register("customerPhone", {
                  required: true,
                })}
              />
              {errors.customerPhone && (
                <span className="text-danger">Provide valid phone number</span>
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

            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Expected service Charge</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter customer phone"
                {...register("expectedServiceCharge", {
                  required: true,
                  setValueAs: (value) => value.trim(),
                })}
              />
              {errors.expectedServiceCharge && (
                <span className="text-danger">
                  Expected Service Charge cannot be empty
                </span>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Expected date of compilation</Form.Label>
              <Form.Control
                type="date"
                placeholder="Enter customer phone"
                {...register("expectedCompleteDte", {
                  required: true,
                  setValueAs: (value) => value.trim(),
                })}
              />
              {errors.expectedCompleteDte && (
                <span className="text-danger">
                  Expected Service Charge cannot be empty
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
