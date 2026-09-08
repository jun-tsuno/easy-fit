import { createBrowserRouter } from "react-router";
import { BodyWeightPage } from "@/pages/BodyWeight/BodyWeight";
import { ExercisesPage } from "@/pages/Exercises/Exercises";
import { HomePage } from "@/pages/Home/Home";
import { LoginPage } from "@/pages/Login/Login";
import { RecordListPage } from "@/pages/Record/Record";
import { RecordExerciseSelectPage } from "@/pages/RecordExerciseSelect/RecordExerciseSelect";
import { RecordSetInputPage } from "@/pages/RecordSetInput/RecordSetInput";
import { ProtectedRoute } from "@/routes/ProtectedRoute/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
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
]);
