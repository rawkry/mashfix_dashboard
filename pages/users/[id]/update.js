import { Card, Col, Form, InputGroup, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useState } from "react";

import { Button } from "@/ui";
import { Main } from "@/layouts";

import getMyProfile from "@/helpers/server/getMyProfile";
import { callFetch } from "@/helpers/server";
import { IssuesFormFields } from "@/reuseables";
import { useRouter } from "next/router";

export async function getServerSideProps(context) {
  try {
    const branch = JSON.parse(process.env.NEXT_PUBLIC_BRANCH);
    const roles = JSON.parse(process.env.ROLES);
    const myProfile = await getMyProfile(context);
    if (myProfile.role != "admin") {
      return {
        notFound: true,
      };
    }
    const [customer_status, customer] = await callFetch(
      context,
      `/users/${context.params.id}`,
      "GET"
    );

    if (customer_status !== 200) {
      return {
        props: {
          fetched: false,
        },
      };
    }

    return {
      props: {
        customer,
        roles,
        branch,
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

export default function Add({ __state, myProfile, customer, roles, branch }) {
  const router = useRouter();
  const onSubmit = async (data) => {
    try {
      __state.loading = true;

      const response = await fetch(`/api`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: `/users/${customer._id}`,
          method: "PUT",
          body: data,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        return toast.error(json.message);
      }

      toast.success(`User  has been successfully updated`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      __state.loading = false;
    }
  };

  const defaultValues = {
    name: customer.name,
    branch: customer.branch,
    role: customer.role,
    email: customer.email,
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
      title={`User || Edit - ${customer.name} `}
      icon="fa-solid fa-users-gear"
      profile={myProfile}
    >
      <div className="container-fluid pb-3 ">
        <Button
          variant="outline-primary"
          size="md"
          onClick={() => router.back()}
        >
          <i className="fa-solid fa-arrow-left mr-2"></i>
        </Button>
      </div>
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
            <Form.Group className="mb-3" controlId="Branch">
              <Form.Label>Branch</Form.Label>
              <Form.Select
                {...register("branch", {
                  required: true,
                })}
              >
                <option value="">Select Branch</option>
                {branch.map((br) => (
                  <option key={br} value={br}>
                    {br}
                  </option>
                ))}
              </Form.Select>
              {errors.branch && (
                <span className="text-danger">Branch is required</span>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="Role">
              <Form.Label>Role</Form.Label>
              <Form.Select
                {...register("role", {
                  required: true,
                })}
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </Form.Select>
              {errors.role && (
                <span className="text-danger">Role is required</span>
              )}
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button className="shadow" type="submit" variant={"primary"}>
                Update
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </Main>
  );
}
