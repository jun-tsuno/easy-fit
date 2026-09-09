import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import { BodyWeightPage } from "@/pages/BodyWeight/BodyWeight";
import { ExercisesPage } from "@/pages/Exercises/Exercises";
import { HomePage } from "@/pages/Home/Home";
import { LoginPage } from "@/pages/Login/Login";
import { RecordListPage } from "@/pages/Record/Record";
import { RecordExerciseSelectPage } from "@/pages/RecordExerciseSelect/RecordExerciseSelect";
import { RecordSetInputPage } from "@/pages/RecordSetInput/RecordSetInput";
import { AppLayout } from "@/routes/AppLayout/AppLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute/ProtectedRoute";

// 履歴画面はチャートライブラリ(recharts)を含み重いため遅延読み込みする
const HistoryPage = lazy(() =>
  import("@/pages/History/History").then((module) => ({
    default: module.HistoryPage,
  })),
);

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "/",
            element: <HomePage />,
          },
          {
            path: "/exercises",
            element: <ExercisesPage />,
          },
          {
            path: "/history",
            element: (
              <Suspense fallback={null}>
                <HistoryPage />
              </Suspense>
            ),
          },
          {
            path: "/record",
            element: <RecordListPage />,
          },
          {
            path: "/record/new",
            element: <RecordExerciseSelectPage />,
          },
          {
            path: "/record/new/:exerciseId",
            element: <RecordSetInputPage />,
          },
          {
            path: "/body-weight",
            element: <BodyWeightPage />,
          },
        ],
      },
    ],
  },
]);
