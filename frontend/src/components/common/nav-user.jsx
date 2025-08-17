import { IconCreditCard, IconLogout, IconNotification, IconUserCircle } from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./dropdown-menu";
import { useDispatch } from "react-redux";
import { clearUser } from "../../redux/features/user.slice";
import { useNavigate } from "react-router-dom";
import { CUSTOMER_PATH, PATH } from "../../routes/path";
import { useSelector } from "react-redux";


export function NavUser() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

    // Hàm lấy 2 chữ cái đầu từ hoTen
    const getInitials = (name) => {
        if (!name) return "CN"; // Giá trị mặc định nếu name rỗng hoặc null
        const words = name.trim().split(" ");
        if (words.length === 1) {
            // Nếu chỉ có 1 từ, lấy 2 chữ cái đầu
            return words[0].slice(0, 2).toUpperCase();
        }
        // Lấy chữ cái đầu của từ đầu tiên và từ cuối cùng
        const firstInitial = words[0][0] || "";
        const lastInitial = words[words.length - 1][0] || "";
        return (firstInitial + lastInitial).toUpperCase();
    };

    const handleLogout = () => {
        // Xóa user khỏi localStorage
        localStorage.removeItem("user");
        // Xóa user khỏi Redux store
        dispatch(clearUser());
        // Chuyển hướng về trang chủ
        navigate(CUSTOMER_PATH.HOME);
    };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer bg-white">
        <Avatar className="h-8 w-8 rounded-lg grayscale">
          {/* <AvatarImage src={user.avatar} alt={user.hoTen} /> */}
          <AvatarFallback className="rounded-lg">{getInitials(user?.userName)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 text-left text-sm leading-tight hidden md:grid">
          <span className="truncate font-medium">{user?.userName}</span>
          <span className="text-muted-foreground truncate text-xs">{user?.email}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg bg-white"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              {/* <AvatarImage src={user.avatar} alt={user.hoTen} /> */}
              <AvatarFallback className="rounded-lg">{getInitials(user?.userName)}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user?.hoTen}</span>
              <span className="text-muted-foreground truncate text-xs">{user?.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer" onClick={() => navigate(CUSTOMER_PATH.PROFILE)}>
            <IconUserCircle className="mr-2" />
            Tài khoản
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={() => navigate(`/my-tickets`)}>
            <IconCreditCard className="mr-2" />
            Vé
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <IconNotification className="mr-2" />
            Thông báo
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
          <IconLogout className="mr-2" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
