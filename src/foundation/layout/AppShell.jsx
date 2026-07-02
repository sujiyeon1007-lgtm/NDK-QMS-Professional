import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
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

export default function AppShell() {
  const [editionReady, setEditionReady] = useState(resolveInitialEditionReady);

  useEffect(() => {
    if (editionReady) {
      syncRepositoryWithEdition();
    }
  }, [editionReady]);

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
      {!editionReady && V1_0_SHOW_EDITION_BOOT_MODAL ? (
        <TitanEditionBootModal onComplete={() => setEditionReady(true)} />
      ) : null}
    </div>
  );
}
