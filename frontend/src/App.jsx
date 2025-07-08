import useRouterElements from "./routes/elements";
import ScrollToTop from "./components/common/ScrollToTop";

function App() {
  const elements = useRouterElements();
  return (
    <>
      <ScrollToTop />
      {elements}
    </>
  )
}

export default App;
