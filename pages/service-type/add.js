import { Card, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";

import { Button } from "@/ui";
import { Main } from "@/layouts";
import getMyProfile from "@/helpers/server/getMyProfile";
import { useRouter } from "next/router";

export async function getServerSideProps(context) {
  try {
    const myProfile = await getMyProfile(context);

    return {
      props: {
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
          path: `/serviceTypes`,
          method: "POST",
          body: data,
        }),
      });

      const json = await response.json();
      if (response.status === 200) {
        toast.success(`Servive named ${json.name} has been successfully added`);
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
    <Main title="Service || Add " icon="fa-solid fa-users" profile={myProfile}>
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
              <Form.Label>Service Name</Form.Label>
              <Form.Control
                className="rounded-pill"
                type="text"
                placeholder="Enter name"
                {...register("name", {
                  required: true,
                  setValueAs: (value) => value.trim(),
                })}
              />
              {errors.name && (
                <span className="text-danger">Name cannot be empty</span>
              )}
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button className="shadow" type="submit" variant={"primary"}>
                Add
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </Main>
  );
}
