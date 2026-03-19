import { z } from "zod";

import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
    server: {
        DATABASE_URL: z.string().min(1),
    },
    experimental__runtimeEnv: {},
    // This is to allow us to skip env validation in certain environments, such as production, 
    // where we might be using a different method to inject environment variables (e.g., Cloudflare Workers' environment variables). 
    // In development, we want to ensure that all required environment variables are set, so we don't skip validation.
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});