/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "stepforge",
      removal: input.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: "eu-central-1",
        },
      },
    };
  },
  async run() {
    // Core infrastructure
    // const { table, bucket } = await import("./infra/core");

    // Building blocks
    // const { blocks } = await import("./infra/blocks");

    // Workflows
    // await import("./infra/workflows/hello-world");
  },
});
