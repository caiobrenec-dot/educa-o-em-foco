import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { KioskView } from "../components/ponto/KioskView";

export const Route = createFileRoute("/quiosque")({
  component: KioskPageRoute,
});

function KioskPageRoute() {
  const navigate = useNavigate();

  return (
    <KioskView
      onExitKiosk={() => navigate({ to: "/" })}
      defaultStoreId="store-catuai"
    />
  );
}
