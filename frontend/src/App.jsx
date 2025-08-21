
import useRouterElements from "./routes/elements";
import ScrollToTop from "./components/common/ScrollToTop";
import Loading from "./components/common/Loading";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "./redux/features/user.slice";


function App() {
  const elements = useRouterElements();
  const dispatch = useDispatch();

  // Khởi tạo user từ localStorage vào Redux khi app khởi động
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        dispatch(setUser(JSON.parse(storedUser)));
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
  }, [dispatch]);

  return (
    <>
      <ScrollToTop />
      {elements}
      <Loading />
    </>
  );
}

export default App;
