import { Card, Col, Form, InputGroup, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useState } from "react";

import { Button } from "@/ui";
import { Main } from "@/layouts";

import getMyProfile from "@/helpers/server/getMyProfile";

import { useRouter } from "next/router";
import { callFetch } from "@/helpers/server";

export async function getServerSideProps(context) {
  const myProfile = await getMyProfile(context);
  if (myProfile.role != "admin") {
    return {
      notFound: true,
    };
  }
  const [status, user] = await callFetch(
    context,
    `/users/${context.params.id}`,
    "GET"
  );

  if (status === 404) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      myProfile,
      user,
    },
  };
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
          path: `/users/update-password/${router.query.id}`,
          method: "PATCH",
          body: {
            password: data.password,
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
    <Main
      title="User || Update Password "
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
      <div>
        <Card className="shadow-sm p-4">
          <Form onSubmit={handleSubmit(onSubmit)}>
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

            <div className="d-flex justify-content-end">
              <Button className="shadow" type="submit">
                update
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </Main>
  );
}
