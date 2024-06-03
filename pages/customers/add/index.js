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

    if (!myProfile) {
      return {
        props: {
          notFound: true,
        },
      };
    }

    return {
      props: {
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

export default function Add({ __state, myProfile }) {
  const onSubmit = async (data) => {
    try {
      __state.loading = true;

      const response = await fetch(`/api`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: `/customers`,
          method: "POST",
          body: data,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        return toast.error(json.message);
      }

      toast.success(`Customer ${json.name} has been successfully Added`);
      reset();
    } catch (e) {
      toast.error(e.message);
    } finally {
      __state.loading = false;
    }
  };

  const defaultValues = {
    name: "",
    phone: "",
    email: "",
    address: "",
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
      title={`Customer || Add New `}
      icon="fa-solid fa-users"
      profile={myProfile}
    >
      <div>
        <Card className="shadow-sm p-4">
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label> Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter customer name"
                {...register("name", {
                  required: true,
                  setValueAs: (value) => value.trim(),
                })}
              />
              {errors.name && (
                <span className="text-danger"> Name cannot be empty</span>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="phone">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter customer phone"
                {...register("phone", {
                  required: true,
                  setValueAs: (value) => value.trim(),
                })}
              />
              {errors.phone && (
                <span className="text-danger">Phone cannot be empty</span>
              )}
            </Form.Group>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter customer email"
                {...register("email", {
                  required: true,
                  setValueAs: (value) => value.trim(),
                })}
              />
              {errors.email && (
                <span className="text-danger">Email cannot be empty</span>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="address">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="address"
                placeholder="Enter customer address"
                {...register("address", {
                  required: true,
                  setValueAs: (value) => value.trim(),
                })}
              />
              {errors.address && (
                <span className="text-danger">address cannot be empty</span>
              )}
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button className="shadow" type="submit">
                Add Customer
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </Main>
  );
}
