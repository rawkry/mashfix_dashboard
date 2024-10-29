import { ButtonGroup, Form, Table, FloatingLabel } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import querystring from "querystring";
import debounce from "debounce";
import { Button } from "@/ui";
import { callFetch } from "@/helpers/server";
import * as ExcelJS from "exceljs";

import { Main } from "@/layouts";
import { Limit, Pagination } from "@/components";
import { searchRedirect, toHuman } from "@/helpers/clients";
import { toast } from "react-toastify";
import getMyProfile from "@/helpers/server/getMyProfile";

export async function getServerSideProps(context) {
  try {
    const myProfile = await getMyProfile(context);
    const { limit = 10 } = context.query;
    const [status, { serviceTypes, total, currentPage, pages }] =
      await callFetch(
        context,
        `/serviceTypes?limit=${limit}&${querystring.stringify(context.query)}`,
        "GET"
      );

    return {
      props: {
        serviceTypes,
        total,
        currentPage,
        pages,
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

export default function Index({
  serviceTypes: serviceTypesFromServer,
  currentPage,
  limit,
  pages,
  fetched,
  myProfile,
  total,
  __state,
}) {
  const router = useRouter();

  const [serviceTypes, setserviceTypes] = useState(serviceTypesFromServer);

  const handleDelete = async (id) => {
    try {
      __state.loading = true;

      const response = await fetch(`/api`, {
        method: "POST",
        body: JSON.stringify({
          path: `/forms/career/${id}`,
          method: "DELETE",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.status === 200) {
        toast.info(`Career  deleted successfully`);
        setcareers((prev) =>
          prev.filter((project_inquiry) => project_inquiry.id !== id)
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      __state.loading = false;
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      __state.loading = true;

      const response = await fetch(`/api`, {
        method: "POST",
        body: JSON.stringify({
          path: `/serviceTypes/update-status/${id}`,
          method: "PATCH",
          body: { active: status },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.status === 200) {
        toast.info(`serviceTypes status updated successfully`);
        setserviceTypes((prev) =>
          prev.map((service) =>
            service._id === id ? { ...service, active: status } : service
          )
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      __state.loading = false;
    }
  };

  useEffect(() => {
    setserviceTypes(serviceTypesFromServer);
  }, [serviceTypesFromServer]);

  return (
    <Main
      title={`Services (${!fetched ? "" : total})`}
      icon="fa-solid fa-hand-holding-heart"
      profile={myProfile}
    >
      {!fetched ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
          }}
        >
          <h1>Please check your internet connection and try again... </h1>
        </div>
      ) : (
        <>
          {/* <div className="d-flex justify-content-between">
            <Form onSubmit={(e) => e.preventDefault()}>
              <Form.Group
                className="d-flex align-items-center w-100 gap-5"
                style={{
                  marginBottom: "1rem",
                }}
              >
                <Form.Control
                  type="search"
                  placeholder="Search by name..."
                  defaultValue={router.query.name || ""}
                  onChange={debounce(
                    (e) =>
                      searchRedirect(
                        router.pathname,
                        "name",
                        e.target.value,
                        router
                      ),
                    500
                  )}
                />
              </Form.Group>
            </Form>

            <div className="d-flex gap-2 mb-2">
              <FloatingLabel controlId="floatingSelect" label="Status">
                <select
                  className="form-select form-select-sm"
                  onChange={(e) => {
                    const { value } = e.target;

                    if (value === "All") {
                      const { active, ...query } = router.query;
                      router.push({
                        pathname: router.pathname,
                        query,
                      });
                      return;
                    }

                    router.push({
                      pathname: router.pathname,
                      query: {
                        ...router.query,
                        active: value === "Inactive" ? false : true,
                      },
                    });
                  }}
                >
                  <option value="All">All status</option>
                  {["active", "Inactive"].map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </FloatingLabel>
              <div>
                <Limit limit={limit} />
              </div>
            </div>
          </div> */}
          <div className="d-flex justify-content-end mb-3">
            <Button
              title={"Add Service Type"}
              variant="primary"
              as={Link}
              href="/service-type/add"
              className="btn btn-sm btn-primary"
            >
              <i className="fa-solid fa-plus"></i>
            </Button>
          </div>

          <Table responsive="xl" bordered striped className="shadow">
            <thead className="bg-secondary shadow">
              <tr className="align-middle">
                <th>Name</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody style={{ overflowY: "auto" }}>
              {serviceTypes.length > 0 ? (
                serviceTypes.map((service) => (
                  <tr key={service.id} className="align-middle">
                    <td>{service.name}</td>
                    <td>
                      <Form.Group className="mb-3" controlId="aproved">
                        <Form.Check
                          className="text-success"
                          type="switch"
                          checked={service.active}
                          onChange={(e) => {
                            if (
                              confirm(
                                "Are you sure, you want to change  status of this service?"
                              )
                            ) {
                              handleStatusChange(service._id, e.target.checked);
                            }
                          }}
                        />
                      </Form.Group>
                    </td>
                    <td>{toHuman(service.createdAt)}</td>
                    <td>
                      <ButtonGroup size="sm">
                        <Link href={`/service-type/show/${service._id}`}>
                          <Button size="sm" variant="outline-primary">
                            <i className="fas fa-eye me-1"></i>
                          </Button>
                        </Link>
                        <Link href={`/service-type/edit/${service._id}`}>
                          <Button size="sm" variant="outline-primary">
                            <i className="fas fa-edit me-1 text-primary"></i>
                          </Button>
                        </Link>

                        {/* <Button
                          size="sm"
                          variant="warning"
                          onClick={(e) => {
                            if (
                              confirm(
                                "Are you sure, you want to delete this career?"
                              )
                            ) {
                              handleDelete(service.id);
                            }
                          }}
                        >
                          <i className="fas fa-trash me-1"></i> Delete
                        </Button> */}
                      </ButtonGroup>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          <Pagination
            pathname={router.pathname}
            currentPage={currentPage}
            pages={pages}
          />
        </>
      )}
    </Main>
  );
}
