import { Query, Resolver } from "@nestjs/graphql";
import { HealthStatus } from "./health-status.type";

const HEALTH_STATUS: HealthStatus = {
  status: "ok",
  service: "wordseed-api",
};

@Resolver(() => HealthStatus)
export class HealthResolver {
  @Query(() => HealthStatus, {
    description: "Checks whether the Wordseed API is available.",
  })
  health(): HealthStatus {
    return HEALTH_STATUS;
  }
}
