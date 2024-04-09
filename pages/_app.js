import "@/ui/styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { proxy, useSnapshot } from "valtio";
import { SSRProvider } from "react-bootstrap";

import { Loading } from "@/ui";

const __state = proxy({ loading: false });

function MyApp({ Component, pageProps }) {
  const snap = useSnapshot(__state);
  return (
    <SSRProvider>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Component {...{ ...pageProps, __state }} />
      <Loading show={snap.loading} />
    </SSRProvider>
  );
}

export default MyApp;
