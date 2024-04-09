import Link from "next/link";
import { Badge, Button, Dropdown } from "react-bootstrap";

import { Main as MainBaseLayout } from "@/ui/layouts";

import routes from "./routes.json";

function TopRightItem({ profile }) {
  return (
    <>
      {profile ? (
        <Dropdown align="end">
          <Dropdown.Toggle
            variant="outline-light"
            id="top-right-item"
            size="sm"
            className="font-zapp-bold px-3 py-2 rounded-0 shadow-sm"
          >
            <i className="fa fa-user me-2"></i>
            Hello, {profile.name.split(" ")[0]}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item>Profile</Dropdown.Item>
            <Dropdown.Item as={Link} href="/logout">
              Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      ) : null}
    </>
  );
}

export default function Main({ children, icon, title, profile = null }) {
  return (
    <MainBaseLayout
      icon={icon}
      title={title}
      rightItem={<TopRightItem profile={profile} />}
      routes={routes}
    >
      {children}
    </MainBaseLayout>
  );
}
