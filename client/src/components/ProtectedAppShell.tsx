import { Outlet } from "react-router-dom";

import { ActiveProjectProvider } from "../context/ActiveProjectContext";
import { DateRangeProvider } from "../context/DateRangeContext";

export function ProtectedAppShell() {
  return (
    <ActiveProjectProvider>
      <DateRangeProvider>
        <Outlet />
      </DateRangeProvider>
    </ActiveProjectProvider>
  );
}
