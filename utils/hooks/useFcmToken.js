import { useEffect, useState } from "react";
import { getMessaging, getToken } from "firebase/messaging";
import firebaseApp from "../firebase/firebase";

const useFcmToken = () => {
  const [token, setToken] = useState("");
  const [notificationPermissionStatus, setNotificationPermissionStatus] =
    useState("");

  useEffect(() => {
    const retrieveToken = async () => {
      try {
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
          // console.log("Attempting to register service worker...");
          const registration = await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js"
          );

          const messaging = getMessaging(firebaseApp);

          // Retrieve the notification permission status
          const permission = await Notification.requestPermission();

          setNotificationPermissionStatus(permission);

          if (permission === "granted") {
            const currentToken = await getToken(messaging, {
              vapidKey:
                "BFM-Rw_hJGj6x0CSJwRzQK-4kIc6iO9A_EYbR92V5seNJ8xdmEbt5cpW0Q5n60KLyG-Nqb3Bhi8VNoIDboq8OLU",
              serviceWorkerRegistration: registration,
            });

            if (currentToken) {
              setToken(currentToken);
            } else {
              // console.log(
              //   "No registration token available. Request permission to generate one."
              // );
            }
          }
        }
      } catch (error) {
        console.log("An error occurred while retrieving token:", error);
      }
    };

    retrieveToken();
  }, []);

  return { fcmToken: token, notificationPermissionStatus };
};

export default useFcmToken;
