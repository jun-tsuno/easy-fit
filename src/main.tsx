import { ChakraProvider } from "@chakra-ui/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { AppToaster } from "@/components/Toaster/Toaster";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { router } from "@/routes/router";
import "./index.css";
import "./lib/amplify-config";
import { queryClient } from "./lib/query-client";
import { system } from "./theme";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <StrictMode>
    <ChakraProvider value={system}>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RouterProvider router={router} />
            <AppToaster />
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ChakraProvider>
  </StrictMode>,
);
