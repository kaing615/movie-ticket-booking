import { Button } from "../common/button";
import { AUTH_PATH, CUSTOMER_PATH, PATH } from "../../routes/path";
import {
  Facebook,
  Instagram,
  Mail,
  Phone,
  Youtube,
  MenuIcon,
  ChevronDown,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, NavLink } from "react-router-dom";
import Logo from "../common/logo";
import logo from "../../assets/img/logo.png";
import btnTicket from "../../assets/img/btn-ticket.webp";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../common/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "../../components/common/sheet";
import { NavUser } from "../../components/common/nav-user";
import { useRoleNavigation } from "../../configs/useRoleNavigation";
import { useQuery } from "@tanstack/react-query";
import { theaterSystemApi } from "../../api/modules/theaterSystem.api";
import { theaterApi } from "../../api/modules/theater.api";

const HomeLayout = () => {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState(null);
  const { user } = useRoleNavigation(); // Sử dụng custom hook

  const { data: theaterSystems } = useQuery({
    queryKey: ["theaterSystems"],
    queryFn: () => theaterSystemApi.getAllTheaterSystems(),
  });
  console.log("Theater Systems: ", theaterSystems);

  const { data: theaters } = useQuery({
    queryKey: ["theaters"],
    queryFn: () => theaterApi.getTheater(),
    enabled: !!theaterSystems,
  });
  console.log("Theaters: ", theaters);

  // Hide scrollbar globally but keep scroll functionality
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      /* Hide scrollbar for Chrome, Safari and Opera */
      body::-webkit-scrollbar {
        display: none;
      }
      
      html::-webkit-scrollbar {
        display: none;
      }
      
      /* Hide scrollbar for IE, Edge and Firefox */
      body {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
      }
      
      html {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
      }
      
      /* Ensure smooth scrolling for manual scrolling only */
      html {
        scroll-behavior: auto;
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const handleLogoClick = () => {
    navigate(PATH.CUSTOMER);
  };

  const handleLogin = () => {
    navigate(`${PATH.AUTH}/${AUTH_PATH.SIGNIN}`);
  };

  const handleRegister = () => {
    navigate(`${PATH.AUTH}/${AUTH_PATH.SIGNUP}`);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="w-full flex items-center">
        <div className="container h-[60px] lg:h-[100px] mx-auto flex items-center justify-between px-4 w-full xl:w-15/20">
          <Logo
            className="w-[50px] lg:w-[115px] cursor-pointer"
            onClick={handleLogoClick}
          />
          <div className="hidden xl:block z-40 ml-10">
            <NavigationMenu viewport={false}>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="px-3 cursor-pointer">
                    Phim
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-4 z-100">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to={`${CUSTOMER_PATH.MOVIES}/showing`}
                            className="hover:text-[#F26B38]"
                          >
                            Phim Đang Chiếu
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            to={`${CUSTOMER_PATH.MOVIES}/coming`}
                            className="hover:text-[#F26B38]"
                          >
                            Phim Sắp Chiếu
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="px-3 cursor-pointer">
                    Sự Kiện
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-4">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link href="#" className="hover:text-[#F26B38]">
                            Ưu Đãi
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="px-3 cursor-pointer">
                    Hệ Thống Rạp
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[300px] gap-2 p-2 max-h-[325px] overflow-y-auto -mr-2">
                      {theaterSystems?.map((system) => (
                        <li key={system._id}>
                          <div className="font-bold text-base pl-1">
                            {system.name}
                          </div>
                          {theaters
                            ?.filter(
                              (rap) => rap.theaterSystemId === system._id
                            )
                            .map((rap) => (
                              <NavigationMenuLink asChild key={rap._id}>
                                <Link
                                  to={`/theater/${rap._id}`}
                                  className="pl-4 hover:text-[#FD841F]"
                                >
                                  {rap.theaterName}
                                </Link>
                              </NavigationMenuLink>
                            ))}
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="flex items-center gap-1 lg:gap-4 pl-0 lg:pl-5">
            <div className="flex items-center gap-0 sm:gap-4">
              <img
                src={btnTicket}
                alt="Ticket"
                className="w-[80px] lg:w-[112px] cursor-pointer mx-2 sm:mx-10"
                onClick={() => navigate(`${CUSTOMER_PATH.BOOKING}`)}
              />
              {user ? (
                <NavUser user={user} />
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={handleLogin}
                    className="px-2 py-1 cursor-pointer hover:text-[#F26B38]"
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    onClick={handleRegister}
                    className="hidden md:block cursor-pointer hover:text-[#F26B38]"
                  >
                    Đăng ký
                  </Button>
                </>
              )}
            </div>
            {/* Mobile Navigation */}
            <div className="flex items-center gap-4 xl:hidden ">
              <Sheet>
                <SheetTrigger>
                  <MenuIcon className="w-6 h-6" />
                </SheetTrigger>
                <SheetContent side="right" className="w-[250px] p-5">
                  <div className="flex flex-col space-y-4 mt-10">
                    {/* Phim Section */}
                    <div className="border-b pb-2">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setOpenSection("phim")}
                      >
                        <p className="font-semibold">Phim</p>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            openSection === "phim" ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                      {openSection === "phim" && (
                        <div className="ml-2 flex flex-col space-y-1 text-sm mt-2">
                          <Link
                            to={PATH.MOVIES}
                            className="hover:text-[#FD841F]"
                          >
                            PHIM ĐANG CHIẾU
                          </Link>
                          <Link
                            to={PATH.COMING_SOON}
                            className="hover:text-[#FD841F]"
                          >
                            PHIM SẮP CHIẾU
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Góc Điện Ảnh Section */}
                    <div className="border-b pb-2">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setOpenSection("gocdienanh")}
                      >
                        <p className="font-semibold">Góc Điện Ảnh</p>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            openSection === "gocdienanh" ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                      {openSection === "gocdienanh" && (
                        <div className="ml-2 flex flex-col space-y-1 text-sm mt-2">
                          <Link to="#" className="hover:text-[#FD841F]">
                            Thể Loại Phim
                          </Link>
                          <Link to="#" className="hover:text-[#FD841F]">
                            Bình Luận Phim
                          </Link>
                          <Link to="#" className="hover:text-[#FD841F]">
                            Blog Điện Ảnh
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Sự Kiện Section */}
                    <div className="border-b pb-2">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setOpenSection("sukien")}
                      >
                        <p className="font-semibold">Sự Kiện</p>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            openSection === "sukien" ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                      {openSection === "sukien" && (
                        <div className="ml-2 flex flex-col space-y-1 text-sm mt-2">
                          <Link to="#" className="hover:text-[#FD841F]">
                            Ưu Đãi
                          </Link>
                          <Link to="#" className="hover:text-[#FD841F]">
                            Phim Hay Tháng
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
      <Outlet />
      <footer id="footer" className="bg-[#333333] text-gray-400">
        <div className="container mx-auto px-4 sm:px-[45px] md:px-4 lg:max-w-4xl xl:max-w-screen-xl">
          <div className="py-8">
            <div className="grid grid-cols-2 gap-y-4 gap-x-4 md:gap-y-2 md:gap-x-2 sm:grid-cols-2 lg:grid-cols-4 ">
              {/* Giới thiệu Section */}
              <div>
                <h3 className="text-white mb-3 md:mb-6 text-sm font-semibold">
                  GIỚI THIỆU
                </h3>
                <ul>
                  <li>
                    <Link
                      to="/ve-chung-toi"
                      className="leading-10 text-gray-300 text-sm hover:text-[#FD841F] transition-all duration-300"
                    >
                      Về chúng tôi
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/thoa-thuan-su-dung"
                      className="leading-10 text-gray-300 text-sm hover:text-[#FD841F] transition-all duration-300"
                    >
                      Thoả thuận sử dụng
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/quy-che-hoat-dong"
                      className="leading-10 text-gray-300 text-sm hover:text-[#FD841F] transition-all duration-300"
                    >
                      Quy chế hoạt động
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/chinh-sach-bao-mat"
                      className="leading-10 text-gray-300 text-sm hover:text-[#FD841F] transition-all duration-300"
                    >
                      Chính sách bảo mật
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Góc điện ảnh Section */}
              <div>
                <h3 className="text-white mb-3 md:mb-6 text-sm font-semibold">
                  GÓC ĐIỆN ẢNH
                </h3>
                <ul>
                  <li>
                    <Link
                      to="/dien-anh"
                      className="leading-10 text-gray-300 text-sm hover:text-[#FD841F] transition-all duration-300"
                    >
                      Thể loại phim
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/binh-luan-phim"
                      className="leading-10 text-gray-300 text-sm hover:text-[#FD841F] transition-all duration-300"
                    >
                      Bình luận phim
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/movie-blog"
                      className="leading-10 text-gray-300 text-sm hover:text-[#FD841F] transition-all duration-300"
                    >
                      Blog điện ảnh
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/phim-hay"
                      className="leading-10 text-gray-300 text-sm hover:text-[#FD841F] transition-all duration-300"
                    >
                      Phim hay tháng
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Hỗ trợ Section */}
              <div>
                <h3 className="text-white mb-3 md:mb-6 text-sm font-semibold">
                  HỖ TRỢ
                </h3>
                <ul>
                  <li>
                    <Link
                      to="/gop-y"
                      className="leading-10 text-gray-300 text-sm hover:text-[#FD841F] transition-all duration-300"
                    >
                      Góp ý
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/sale-and-service"
                      className="leading-10 text-gray-300 text-sm hover:text-[#FD841F] transition-all duration-300"
                    >
                      Sale & Services
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/rap-gia-ve"
                      className="leading-10 text-gray-300 text-sm hover:text-[#FD841F] transition-all duration-300"
                    >
                      Rạp / Giá vé
                    </Link>
                  </li>
                  <li>
                    <a
                      href="https://tuyendung-daotao.galaxystudio.vn/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="leading-10 text-gray-300 text-sm hover:text-[#FD841F] transition-all duration-300"
                    >
                      Tuyển dụng
                    </a>
                  </li>
                  <li>
                    <Link
                      to="/hoi-dap"
                      className="leading-10 text-gray-300 text-sm hover:text-[#FD841F] transition-all duration-300"
                    >
                      FAQ
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Connect Section */}

              <div className="flex flex-col gap-8">
                <img
                  alt="Galaxy - Cinema"
                  loading="lazy"
                  width="94"
                  height="42"
                  src={logo}
                  className="text-transparent grayscale brightness-500 ml-[20px]"
                />

                <ul className="flex gap-4">
                  <li>
                    <a href="https://www.facebook.com/999999" target="_blank">
                      <Facebook className="w-8 h-8 text-gray-400 hover:text-[#FD841F] transition-all duration-300" />
                    </a>
                  </li>
                  <li>
                    <a href="https://www.youtube.com/999999" target="_blank">
                      <Youtube className="w-8 h-8 text-gray-400 hover:text-[#FD841F] transition-all duration-300" />
                    </a>
                  </li>
                  <li>
                    <a href="https://www.instagram.com/999999" target="_blank">
                      <Instagram className="w-8 h-8 text-gray-400 hover:text-[#FD841F] transition-all duration-300" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-gray-700 py-4">
            <div className="flex flex-col md:flex-row justify-start items-center gap-5">
              <div className="footer__logo">
                <img
                  alt="Galaxy - Cinema"
                  loading="lazy"
                  width="94"
                  height="42"
                  src={logo}
                  className="text-transparent grayscale brightness-500"
                />
              </div>
              <div className="text-left text-xs space-y-1">
                <h3 className="text-white text-lg font-semibold">
                  CÔNG TY CỔ PHẦN PHIM CINEMA GATE
                </h3>
                <p>999 Đường Tôn Đức Thắng, P.Bến Nghé, Q.1, TP.HCM</p>
                <p className="flex items-center gap-2 flex-wrap">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <a
                    href="tel:0999999999"
                    className="hover:text-[#FD841F] transition-all duration-300"
                  >
                    0.999.999.999
                  </a>
                  <span>-</span>
                  <Phone className="w-5 h-5 text-gray-400" />
                  <a
                    href="tel:19009999"
                    className="hover:text-[#FD841F] transition-all duration-300"
                  >
                    19009999 (9:00 - 22:00)
                  </a>
                  <span>-</span>
                  <Mail className="w-5 h-5 text-gray-400" />
                  <a
                    href="mailto:hotro@dalaxystudio.vn"
                    target="_blank"
                    className="hover:text-[#FD841F] transition-all duration-300"
                  >
                    hotro@cinemagate.vn
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeLayout;
