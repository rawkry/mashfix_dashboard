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
      callFetch(context, `/repairs/${context.params.id}`, "GET"),
      callFetch(context, `/serviceTypes?active=true`, "GET"),
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

export default function Edit({ __state, repair, serviceType }) {
  const router = useRouter();

  const defaultValues = {
    serviceTypeId: repair.serviceTypeId.id,
    customer: repair.customer.id,
    device: repair.device,
    brand: repair.brand,
    problemDescription: repair.problemDescription,
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
          path: `/repairs/${repair.id}`,
          method: "PUT",
          body: data,
        }),
      });
      const json = await response.json();
      if (response.status === 200) {
        toast.success("Repair updated successfully");
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
      title={`Repair: ${repair.customer.name} || Edit `}
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
              <Form.Label>Device Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter device name"
                {...register("device", {
                  required: true,
                  setValueAs: (value) => value.trim(),
                })}
              />
              {errors.deviceName && (
                <span className="text-danger">Device Name cannot be empty</span>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Brand</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter device brand"
                {...register("brand", {
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
                Update Repair
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </Main>
  );
}
