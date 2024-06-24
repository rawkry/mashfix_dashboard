import { Button } from "@/ui";
import { Col, Form, Row } from "react-bootstrap";

function IssuesFormFields({ setIssuesWithPrice, issuesWithPrice }) {
  const handleAddSocial = () => {
    const newKey = Math.floor(Math.random() * 16777215).toString(16);
    setIssuesWithPrice((prev) => ({
      ...prev,
      [newKey]: {
        description: "",
        quantity: "",
        rate: "",
        price: "",
      },
    }));
  };

  const handleChange = (key, field, value) => {
    setIssuesWithPrice((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  // Function to remove a social media entry
  const handleRemoveSocial = (key) => {
    setIssuesWithPrice((prev) => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  };

  return (
    <Form.Group className="mb-3">
      <fieldset className="border rounded p-2 mb-3">
        <legend className="border-bottom pb-1 mb-2">Issues Breakdown</legend>
        {Object.entries(issuesWithPrice).map(([key, issue]) => (
          <div key={key}>
            <Row className="mb-3">
              <Col md={3}>
                <Form.Label className="text-black">Description</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Enter specific issue"
                  className="text-dark"
                  value={issue.description}
                  onChange={(e) =>
                    handleChange(key, "description", e.target.value)
                  }
                />
              </Col>
              <Col md={2}>
                <Form.Label className="text-black">Quantity</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter quantity"
                  value={issue.quantity}
                  onChange={(e) =>
                    handleChange(key, "quantity", e.target.value.trim())
                  }
                  required
                />
              </Col>
              <Col md={2}>
                <Form.Label className="text-black">Rate</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter quantity"
                  value={issue.rate}
                  onChange={(e) => {
                    handleChange(key, "rate", e.target.value.trim());
                    handleChange(
                      key,
                      "price",
                      e.target.value.trim() * issue.quantity
                    );
                  }}
                  required
                />
              </Col>
              <Col md={2}>
                <Form.Label className="text-black">Amount</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter price"
                  value={issue.quantity * issue.rate}
                />
              </Col>
              <Col
                md={1}
                className="text-end d-flex justify-content-center align-items-center"
              >
                <Button
                  variant="primary"
                  size="sm"
                  className="d-inline-block rounded"
                  onClick={() => handleRemoveSocial(key)}
                >
                  <i className="fas fa-times" />
                </Button>
              </Col>
            </Row>
          </div>
        ))}

        {Object.keys(issuesWithPrice).length === 0 && (
          <p className="text-muted">- No issues added yet -</p>
        )}
      </fieldset>
      <Button
        variant="primary"
        className="shadow"
        onClick={handleAddSocial}
        disabled={
          Object.keys(issuesWithPrice).length > 0 &&
          Object.values(issuesWithPrice).some(
            (issue) => !issue.description || !issue.price || !issue.quantity
          )
            ? true
            : false
        }
      >
        Add {Object.keys(issuesWithPrice).length === 0 ? "First" : "Another"}{" "}
        Issue
      </Button>
    </Form.Group>
  );
}

export default IssuesFormFields;
