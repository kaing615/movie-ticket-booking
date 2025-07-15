import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../redux/features/user.slice";
import { PATH } from "../routes/path";
import { ROLE } from "../constants/role"

export const useRoleNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  // Khôi phục user từ localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        dispatch(setUser(parsedUser));
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        localStorage.removeItem("user");
      }
    }
    setIsUserLoaded(true);
  }, [dispatch]);

  // Điều hướng dựa trên vai trò
  useEffect(() => {
    if (!isUserLoaded) return;

    if (user) {
      // Nếu là admin và không ở trang admin, chuyển đến admin
      if (user.role === ROLE.ADMIN && !location.pathname.startsWith(PATH.ADMIN)) {
        navigate(`${PATH.ADMIN}/dashboard`, { replace: true });
      }
      // Nếu là theater-manager và không ở trang manager, chuyển đến manager
      else if (user.role === ROLE.MANAGER && !location.pathname.startsWith(PATH.MANAGER)) {
        navigate(`${PATH.MANAGER}/dashboard`, { replace: true });
      }
      // Nếu là customer (hoặc các role khác) và đang ở admin/manager thì chuyển về trang customer/home
      else if (
        user.role === ROLE.CUSTOMER &&
        (location.pathname.startsWith(PATH.ADMIN) || location.pathname.startsWith(PATH.MANAGER))
      ) {
        navigate(`${PATH.CUSTOMER}home`, { replace: true });
      }
    } else {
      // Nếu chưa đăng nhập mà vào trang admin hoặc manager, chuyển về trang đăng nhập
      if (
        location.pathname.startsWith(PATH.ADMIN) ||
        location.pathname.startsWith(PATH.MANAGER)
      ) {
        navigate(`${PATH.AUTH}/signin`, { replace: true });
      }
    }
  }, [user, navigate, location.pathname, isUserLoaded]);

  return { user };
};
