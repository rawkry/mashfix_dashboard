import Link from "next/link";
import { Badge, Button, Dropdown } from "react-bootstrap";

import { Main as MainBaseLayout } from "@/ui/layouts";

import routes from "./routes.json";
import { useEffect, useState } from "react";
import { getMessaging, onMessage } from "firebase/messaging";
import useFcmToken from "@/utils/hooks/useFcmToken";
import firebaseApp from "@/utils/firebase/firebase";

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
  const { fcmToken, notificationPermissionStatus } = useFcmToken();
  // Use the token as needed
  // fcmToken && console.log("FCM token:", fcmToken);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const subscribeToTopic = async () => {
        try {
          const messaging = getMessaging(firebaseApp);
          if (fcmToken) {
            await messaging.subscribeToTopic(fcmToken, "allStudents");
            // console.log("Subscribed to allStudents topic");
          } else {
            // console.log(
            //   "No token available. Please check Firebase configuration."
            // );
          }
        } catch (error) {
          console.error("Error subscribing to topic:", error);
        }
      };
      subscribeToTopic();

      const messaging = getMessaging(firebaseApp);
      const unsubscribe = onMessage(messaging, (payload) => {
        // Handle the received push notification while the app is in the foreground
        // You can display a notification or update the UI based on the payload
      });

      return () => {
        unsubscribe(); // Unsubscribe from the onMessage event
      };
    }
  }, []);
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
