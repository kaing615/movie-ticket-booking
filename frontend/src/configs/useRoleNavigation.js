import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../redux/features/user.slice";
import { ROLE } from "../constants/role";
import { PATH } from "../routes/path";

export const useRoleNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        dispatch(setUser(parsedUser));
      } catch (error) {
        console.error("Lỗi khi phân tích user từ localStorage:", error);
        localStorage.removeItem("user");
      }
    }
    setIsUserLoaded(true);
  }, [dispatch]);

  useEffect(() => {
    if (!isUserLoaded) return;

    if (user) {
      if (user.role === ROLE.ADMIN && !location.pathname.startsWith("/admin")) {
        navigate(PATH.ADMIN);
      } else if (
        user.role === ROLE.THEATERMANAGER &&
        !location.pathname.startsWith("/manager")
      ) {
        if (PATH.MANAGER) navigate(PATH.MANAGER);
      } else if (
        user.role === ROLE.CUSTOMER &&
        (location.pathname.startsWith("/admin") ||
          location.pathname.startsWith("/manager"))
      ) {
        navigate(PATH.HOME);
      }
    } else {
      if (
        location.pathname.startsWith("/admin") ||
        location.pathname.startsWith("/manager")
      ) {
        navigate(PATH.SIGNIN);
      }
    }
  }, [user, navigate, location.pathname, isUserLoaded]);

  return { user };
};
