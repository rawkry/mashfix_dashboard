import {
  ButtonGroup,
  Form,
  Table,
  FloatingLabel,
  Modal,
} from "react-bootstrap";
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
import { IssuesFormFields } from "@/reuseables";

export async function getServerSideProps(context) {
  try {
    const myProfile = await getMyProfile(context);
    const { limit = 10 } = context.query;
    const [status, { users, total, currentPage, pages }] = await callFetch(
      context,
      `/user?limit=${limit}&${querystring.stringify(context.query)}`,
      "GET"
    );

    return {
      props: {
        users,
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
const { url, headers } = JSON.parse(process.env.NEXT_PUBLIC_BASE_SERVICE);
export default function Index({
  users: customersFromServer,
  currentPage,
  limit,
  pages,
  fetched,
  myProfile,
  total,
  __state,
}) {
  const router = useRouter();

  const [customers, setcustomers] = useState(customersFromServer);

  const [showIssue, setShowIssue] = useState({
    id: "",
    show: false,
  });
  const [issuesWithPrice, setIssuesWithPrice] = useState({});

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
        setcareers((prev) => prev.filter((customer) => customer.id !== id));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      __state.loading = false;
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      __state.loading = true;

      const response = await fetch(`/api`, {
        method: "POST",
        body: JSON.stringify({
          path: `/user/update-role/${id}`,
          method: "PATCH",
          body: { role },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.status === 200) {
        toast.info(`User role has been changed to ${role} successfully`);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      __state.loading = false;
    }
  };

  const handleIssueWithPrice = async () => {
    try {
      __state.loading = true;
      const issueswithprice = Object.entries(issuesWithPrice).map(
        ([key, issue]) => ({
          description: issue.description,
          quantity: issue.quantity,
          rate: issue.rate,
          price: issue.price,
        })
      );

      const response = await fetch(`/api`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: `/customers/${showIssue.id}/update-issuesWithPrice`,
          method: "PATCH",
          body: { issuesWithPrice: issueswithprice },
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        toast.info(`customers issues updated successfully`);
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
    setcustomers(customersFromServer);
  }, [customersFromServer]);

  return (
    <Main
      title={`Mashfix Users (${!fetched ? "" : total})`}
      icon="fa-solid fa-useres"
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
          <div className="d-flex justify-content-between">
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
                <Form.Control
                  type="search"
                  placeholder="Search by email..."
                  defaultValue={router.query.email || ""}
                  onChange={debounce(
                    (e) =>
                      searchRedirect(
                        router.pathname,
                        "email",
                        e.target.value,
                        router
                      ),
                    500
                  )}
                />
              </Form.Group>
            </Form>

            <div className="d-flex gap-2 mb-2">
              <div>
                <Limit limit={limit} />
              </div>
            </div>
          </div>

          <Table responsive="xl" bordered striped className="shadow">
            <thead className="bg-secondary shadow">
              <tr className="align-middle">
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created At</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody style={{ overflowY: "auto" }}>
              {customers.length > 0 ? (
                customers.map((user) => (
                  <tr key={user.id} className="align-middle">
                    <td>{user.name}</td>

                    <td>{user.email}</td>
                    <td>
                      <Form.Group controlId="active">
                        <FloatingLabel
                          controlId="floatingSelect"
                          className="mb-3"
                        >
                          <select
                            className="form-select form-select-sm"
                            defaultValue={user.role}
                            onChange={(e) => {
                              handleRoleChange(user.id, e.target.value);
                            }}
                          >
                            {["user", "admin"].map((item, index) => (
                              <option
                                key={index}
                                value={item}
                                style={{ width: "100%" }}
                              >
                                {item}
                              </option>
                            ))}
                          </select>
                        </FloatingLabel>
                      </Form.Group>
                    </td>

                    <td>{toHuman(user.createdAt)}</td>

                    <td>
                      <ButtonGroup size="sm">
                        <Link href={`/users/show/${user.id}`}>
                          <Button size="sm">
                            <i className="fas fa-eye me-1"></i> View
                          </Button>
                        </Link>

                        <Button
                          size="sm"
                          variant="warning"
                          as={Link}
                          href={`/users/edit/${user.id}`}
                        >
                          <i className="fas fa-pen me-1"></i> Edit
                        </Button>

                        <Button size="sm" variant="success">
                          <i className="fas fa-pen me-1"></i> update password
                        </Button>
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
          <Modal
            size="xl"
            show={showIssue.show}
            onHide={() => {
              setShowIssue({
                id: "",
                show: false,
              });
            }}
          >
            <Modal.Header closeButton>
              <Modal.Title>Update Issue</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <IssuesFormFields
                issuesWithPrice={issuesWithPrice}
                setIssuesWithPrice={setIssuesWithPrice}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() =>
                  setShowIssue({
                    id: "",
                    show: false,
                  })
                }
                className="shadow-sm"
              >
                Close
              </Button>
              <Button
                variant="primary"
                className="shadow-sm"
                onClick={handleIssueWithPrice}
              >
                Save
              </Button>
            </Modal.Footer>
          </Modal>

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
