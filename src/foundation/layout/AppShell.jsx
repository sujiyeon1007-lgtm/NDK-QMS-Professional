import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

export default function AppShell() {
  return (
    <div className="titan-app-shell">
      <Header />
      <div className="titan-app-body">
        <Sidebar />
        <main className="titan-main">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
