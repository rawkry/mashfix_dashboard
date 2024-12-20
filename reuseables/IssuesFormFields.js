import { Button } from "@/ui";
import { Card, Col, Form, Row } from "react-bootstrap";

function IssuesFormFields({
  setIssuesWithPrice,
  issuesWithPrice,
  withCostPrice = false,
  withSellerDetails = false,
}) {
  const handleAddIssues = () => {
    const newKey = Math.floor(Math.random() * 16777215).toString(16);
    setIssuesWithPrice((prev) => ({
      ...prev,
      [newKey]: {
        description: "",
        quantity: "",
        rate: "",
        price: "",
        actualPrice: "",
        sellerDetails: "",
      },
    }));
  };

  const handleChange = (key, field, value) => {
    if (field === "rate") {
      const newRate = parseFloat(value.trim());
      const newPrice = isNaN(newRate)
        ? 0
        : newRate * parseFloat(issuesWithPrice[key].quantity);
      setIssuesWithPrice((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          rate: newRate.toString(),
          price: newPrice.toString(),
        },
      }));
    } else {
      setIssuesWithPrice((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          [field]: value,
        },
      }));
    }
  };

  // Function to remove a social media entry
  const handleRemoveIssue = (key) => {
    setIssuesWithPrice((prev) => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  };

  const total = Object.values(issuesWithPrice)
    .reduce((acc, issue) => acc + parseFloat(issue.price || 0), 0)
    .toFixed(2);

  // Calculate Tax
  const tax = (
    Object.values(issuesWithPrice).reduce(
      (acc, issue) => acc + parseFloat(issue.price || 0),
      0
    ) * 0.0825
  ).toFixed(2);

  const grandTotal = (parseFloat(total) + parseFloat(tax)).toFixed(2);

  return (
    <Form.Group className="mb-3">
      <fieldset className="border rounded p-2 mb-3">
        <legend className="border-bottom pb-1 mb-2">Issues Breakdown</legend>
        {Object.entries(issuesWithPrice).map(([key, issue]) => (
          <div key={key}>
            <Row className="mb-3 align-items-center">
              <Col xs={12} md={3} className="mb-2 mb-md-0">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  readOnly={withCostPrice}
                  className="rounded-pill"
                  required
                  type="text"
                  placeholder="Enter specific issue"
                  value={issue.description}
                  onChange={(e) =>
                    handleChange(key, "description", e.target.value)
                  }
                />
              </Col>
              <Col xs={6} md={2} className="mb-2 mb-md-0">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  readOnly={withCostPrice}
                  type="number"
                  className="rounded-pill"
                  placeholder="Enter quantity"
                  value={issue.quantity}
                  onChange={(e) =>
                    handleChange(key, "quantity", e.target.value.trim())
                  }
                  required
                />
              </Col>
              <Col xs={6} md={2} className="mb-2 mb-md-0">
                <Form.Label>Rate</Form.Label>
                <Form.Control
                  readOnly={withCostPrice}
                  className="rounded-pill"
                  type="number"
                  placeholder="Enter rate"
                  value={issue.rate}
                  onChange={(e) =>
                    handleChange(key, "rate", e.target.value.trim())
                  }
                  required
                />
              </Col>
              <Col xs={6} md={2} className="mb-2 mb-md-0">
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  readOnly
                  className="rounded-pill"
                  type="number"
                  placeholder="Enter price"
                  defaultValue={issue.price}
                />
              </Col>
              {withCostPrice && (
                <Col xs={12} md={6} className="mt-2 mb-md-0">
                  <Form.Label>Actual Price</Form.Label>
                  <Form.Control
                    className="rounded-pill"
                    type="number"
                    placeholder="Enter price"
                    value={issue.actualPrice}
                    onChange={(e) =>
                      handleChange(key, "actualPrice", e.target.value.trim())
                    }
                  />
                </Col>
              )}
              {withSellerDetails && (
                <Col xs={12} md={6} className="mt-2 mb-md-0">
                  <Form.Label>Seller Details</Form.Label>
                  <Form.Control
                    className="rounded-pill"
                    type="text"
                    placeholder="Enter seller details"
                    value={issue.sellerDetails}
                    onChange={(e) =>
                      handleChange(key, "sellerDetails", e.target.value.trim())
                    }
                  />
                </Col>
              )}
              {!withCostPrice && (
                <Col
                  xs={12}
                  md={1}
                  className="text-center text-md-end d-flex justify-content-center align-items-center"
                >
                  <Button
                    variant="danger"
                    size="sm"
                    className="d-inline-block rounded"
                    onClick={() => handleRemoveIssue(key)}
                  >
                    <i className="fas fa-times text-white" />
                  </Button>
                </Col>
              )}
            </Row>
            <div
              className="bg-light mb-4 mb-sm-5"
              style={{
                height: "1px",
              }}
            ></div>
          </div>
        ))}
        {Object.keys(issuesWithPrice).length === 0 && (
          <p className="text-muted text-center">- No issues added yet -</p>
        )}
      </fieldset>

      {!withCostPrice && (
        <div className="d-flex justify-content-between align-items-center">
          <Button
            variant="primary"
            className="shadow"
            onClick={handleAddIssues}
            disabled={Object.values(issuesWithPrice).some(
              (issue) =>
                !issue.description ||
                issue.price === "" ||
                issue.quantity === ""
            )}
          >
            Add{" "}
            {Object.keys(issuesWithPrice).length === 0 ? "First" : "Another"}{" "}
            Issue
          </Button>

          <div>
            <Card.Text className="text-muted">Total: ${total}</Card.Text>
            <Card.Text className="text-muted">Tax (8.25%): ${tax}</Card.Text>
            <Card.Text className="text-muted">
              Grand Total: ${grandTotal}
            </Card.Text>
          </div>
        </div>
      )}
    </Form.Group>
  );
}

export default IssuesFormFields;
