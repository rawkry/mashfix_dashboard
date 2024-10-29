import React from "react";
import { useForm } from "react-hook-form";
import { Form, Button, Card } from "react-bootstrap";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Image from "next/image";

export async function getServerSideProps(context) {
  try {
    if (
      context.req.cookies.hasOwnProperty("x-auth-headers") &&
      context.req.cookies.hasOwnProperty("x-my-profile")
    ) {
      return {
        redirect: {
          permanent: false,
          destination: "/",
        },
        props: {},
      };
    }
    return { props: {} };
  } catch (err) {
    return { props: {} };
  }
}

const LoginPage = ({ __state }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const router = useRouter();
  const { payload } = router.query;
  const onSubmit = async (data) => {
    try {
      __state.loading = true;
      const response = await fetch(`api/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const json = await response.json();

      if (response.status !== 200) {
        toast.error(json?.message);
      } else {
        if (!payload) {
          router.push("/");
          toast.success("Login Successful");
        } else {
          router.push(`/return-back?payload=${payload}`);
        }
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      __state.loading = false;
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Card style={{ width: "300px" }}>
        <Card.Body>
          <img
            src="/logo.png"
            style={{
              width: "100px",
              height: "100px",
              objectFit: "contain",
              margin: "0 auto",
              display: "block",
            }}
          />
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                className="rounded-pill"
                type="text"
                placeholder="Enter your email"
                {...register("email", {
                  required: true,
                  setValueAs: (value) => value.trim(),
                })}
              />
              {errors.email && (
                <span className="text-danger">Email is required</span>
              )}
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                className="rounded-pill"
                type="password"
                placeholder="Enter your password"
                {...register("password", {
                  required: true,
                  setValueAs: (value) => value.trim(),
                })}
              />
              {errors.password && (
                <span className="text-danger">Password is required</span>
              )}
            </Form.Group>

            <Button type="submit" variant="primary" className="w-100">
              Login
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default LoginPage;
