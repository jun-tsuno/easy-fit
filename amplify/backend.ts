import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
});

// Keep users signed in for ~30 days without requiring re-login.
backend.auth.resources.cfnResources.cfnUserPoolClient.refreshTokenValidity = 30;
backend.auth.resources.cfnResources.cfnUserPoolClient.tokenValidityUnits = {
  refreshToken: "days",
};
