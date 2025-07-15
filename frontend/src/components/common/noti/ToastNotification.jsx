import { Bounce, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";

const ToastNotification = ({ message, type = "success", autoClose = 5000, position = "top-right", id }) => {
  useEffect(() => {
    if (message) {
      const toastOptions = {
        position,
        autoClose,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        toastId: id,
      };

      switch (type) {
        case "success":
          toast.success(message, toastOptions);
          break;
        case "error":
          toast.error(message, toastOptions);
          break;
        case "info":
          toast.info(message, toastOptions);
          break;
        case "warning":
          toast.warn(message, toastOptions);
          break;
        default:
          toast(message, toastOptions);
      }
    }
  }, [id]);

  return (
    <ToastContainer
      position={position}
      autoClose={autoClose}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick={false}
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
      transition={Bounce}
    />
  );
};

export default ToastNotification;
