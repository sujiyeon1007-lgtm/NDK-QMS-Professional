import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { GlobalNav, TitanBanner, TitanWorkspaceHeader } from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import TitanErrorBoundary from "../components/TitanErrorBoundary";
import TitanEditionBootModal from "../components/TitanEditionBootModal";
import { V1_0_SHOW_EDITION_BOOT_MODAL } from "../../config/titanV1DevelopmentDirection";
import {
  ensureV1EditionLock,
  isTitanEditionSelected,
  syncRepositoryWithEdition,
} from "../../utils/titanEditionSession";

function resolveInitialEditionReady() {
  if (!V1_0_SHOW_EDITION_BOOT_MODAL) {
    ensureV1EditionLock();
    return true;
  }
  return isTitanEditionSelected();
}

function MainContent() {
  const location = useLocation();

  return (
    <TitanErrorBoundary resetKey={location.pathname}>
      <Outlet />
    </TitanErrorBoundary>
  );
}

export default function AppShell() {
  const [editionReady, setEditionReady] = useState(resolveInitialEditionReady);

  useEffect(() => {
    if (editionReady) {
      syncRepositoryWithEdition();
    }
  }, [editionReady]);

  return (
    <div className="titan-app-shell">
      <TitanBanner />
      <GlobalNav />
      <div className="titan-app-body">
        <div className="titan-left-frame">
          <Sidebar />
        </div>
        <div className="titan-right-workspace">
          <TitanWorkspaceHeader />
          <main className="titan-main">
            <MainContent />
          </main>
          <Footer />
        </div>
      </div>
      {!editionReady && V1_0_SHOW_EDITION_BOOT_MODAL ? (
        <TitanEditionBootModal onComplete={() => setEditionReady(true)} />
      ) : null}
    </div>
  );
}
