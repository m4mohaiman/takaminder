import { PrivateRoute } from "@/components/auth/PrivateRoute";
import { RootLayout } from "@/layout/rootLayout/RootLayout";
import { Budgets } from "@/pages/budgets/Budgets";
import { Dashboard } from "@/pages/dashboard/Dashboard";
import { Login } from "@/pages/login/Login";
import { Profile } from "@/pages/profile/Profile";
import { Register } from "@/pages/register/Register";
import { Reports } from "@/pages/reports/Reports";
import { Settings } from "@/pages/setting/Settings";
import { Transactions } from "@/pages/transactions/Transactions";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/",
    element: (
      <PrivateRoute>
        <RootLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "transactions",
        element: <Transactions />,
      },
      {
        path: "budgets",
        element: <Budgets />,
      },
      {
        path: "reports",
        element: <Reports />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
]);
