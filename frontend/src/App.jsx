import useRouterElements from "./routes/elements";
import ScrollToTop from "./components/common/ScrollToTop";
import Loading from "./components/common/Loading";

function App() {
  const elements = useRouterElements();
  return (
    <>
      <ScrollToTop />
      {elements}
      <Loading />
    </>
  )
}

export default App;
