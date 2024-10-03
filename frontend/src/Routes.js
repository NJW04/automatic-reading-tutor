import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import LoginForm from "./components/LoginForm/LoginForm";
import RegisterForm from "./components/RegisterForm/RegisterForm";
import Library from "./pages/BookSelection";
import ReadingBoard from "./pages/ReadingBoard";
import CompletionStatistics from "./pages/CompletionStatistics";
import LifetimeStatistics from "./pages/LifetimeStatistics";
import ProtectedAdminRoute from "./components/Admin/ProtectedAdminRoute";
import AdminHome from "./pages/AdminHome";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminStatistics from "./pages/AdminStatistics";
import AdminStoryManagement from "./pages/AdminStoryManagement";

import "mdb-react-ui-kit/dist/css/mdb.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/library" element={<Library />} />
        <Route path="/board" element={<ReadingBoard />} />

        <Route
          path="/completion_statistics"
          element={<CompletionStatistics />}
        />
        <Route path="/lifetime_statistics" element={<LifetimeStatistics />} />

        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin-home" element={<AdminHome />} />
          <Route
            path="/admin-user-management"
            element={<AdminUserManagement />}
          />
          <Route
            path="/admin-statistics-management"
            element={<AdminStatistics />}
          />
          <Route
            path="/admin-story-management"
            element={<AdminStoryManagement />}
          />
        </Route>

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
