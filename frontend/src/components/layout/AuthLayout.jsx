import React from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Loading from "../common/Loading";

function AuthLayout() {
  const isLoading = useSelector((state) => state.loading.isLoading);

  return (
    <>
      {isLoading && <Loading />}
      <Outlet />
    </>
  );
}

export default AuthLayout;
