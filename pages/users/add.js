import { Card, Col, Form, InputGroup, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useState } from "react";

import { Button } from "@/ui";
import { Main } from "@/layouts";

import getMyProfile from "@/helpers/server/getMyProfile";

import { useRouter } from "next/router";

export async function getServerSideProps(context) {
  try {
    const branch = JSON.parse(process.env.BRANCH);
    const roles = JSON.parse(process.env.ROLES);
    const myProfile = await getMyProfile(context);

    return {
      props: {
        myProfile,
        roles,
        branch,
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

export default function Add({ __state, roles, branch, myProfile }) {
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
          path: `/users`,
          method: "POST",
          body: {
            name: data.name,
            email: data.email,
            password: data.password,
            branch: data.branch,
            role: data.role,
          },
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        return toast.error(json.message);
      }

      toast.success(`User  has been successfully added`);
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

            <Form.Group className="mb-3" controlId="Password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Password "
                {...register("password", {
                  required: true,
                })}
              />
              {errors.password && (
                <span className="text-danger">Provide password</span>
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
              <Button className="shadow" type="submit">
                Create User
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </Main>
  );
}
