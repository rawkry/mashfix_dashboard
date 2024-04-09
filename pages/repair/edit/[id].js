import { Card, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";

import { Button } from "@/ui";
import { callFetch } from "@/helpers/server";
import { Main } from "@/layouts";
import getMyProfile from "@/helpers/server/getMyProfile";
import { IsoDateString } from "@/helpers/clients";

export async function getServerSideProps(context) {
  try {
    const myProfile = await getMyProfile(context);

    const response = await Promise.all([
      callFetch(context, `/repair/${context.params.id}`, "GET"),
      callFetch(context, `/serviceType?active=true`, "GET"),
    ]);

    const [[partner_status, repair], [serviceType_status, { serviceTypes }]] =
      response;

    if (partner_status !== 200 || serviceType_status !== 200) {
      return {
        props: {
          fetched: false,
          repair: {},
          serviceTypes: [],
        },
      };
    }

    return {
      props: {
        repair,
        serviceType: serviceTypes,
        fetched: true,
      },
    };
  } catch (err) {
    toast.error(`Error: ${err.message}.`);
    return {
      props: {
        repair: [],
        serviceType: [],
        fetched: false,
      },
    };
  }
}

export default function Edit({ __state, repair: serverrepair, serviceType }) {
  const router = useRouter();

  const defaultValues = {
    serviceTypeId: serverrepair.serviceTypeId?.id || "",
    customerName: serverrepair.customerName,
    customerEmail: serverrepair.customerEmail,
    customerPhone: serverrepair.customerPhone,
    deviceName: serverrepair.deviceName,
    model: serverrepair.model,
    problemDescription: serverrepair.problemDescription,
    expectedServiceCharge: serverrepair.expectedServiceCharge,
    expectedCompleteDte: IsoDateString(serverrepair.expectedCompleteDte),
  };

  const onSubmit = async (data) => {
    try {
      __state.loading = true;

      const response = await fetch(`/api`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: `/repair/${serverrepair.id}`,
          method: "PUT",
          body: data,
        }),
      });
      const json = await response.json();
      if (response.status === 200) {
        toast.success("Application updated successfully");
      } else {
        toast.error(`Error (${response.status}): ${json.message}.`);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      __state.loading = false;
    }
  };

  const {
    watch,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues,
  });
  return (
    <Main
      title={`Repair: ${serverrepair.customerName} || Edit `}
      icon="fa-solid fa-users"
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
                {serviceType.map((service) => (
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
