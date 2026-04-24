import { z } from "zod";

const bearerAuthSchema = z.object({
    type: z.literal("bearer"),
    token: z.string().min(1, "Bearer token is required"),
})

const apiKeyAuthSchema = z.object({
    type: z.literal("apiKey"),
    key: z.string().min(1, "API key name is required"),
    value: z.string().min(1, "API key value is required"),
    in: z.enum(["header", "query"])
})

const basicAuthSchema = z.object({
    type: z.literal("basic"),
    username: z.string().min(1, "Basic username is required"),
    password: z.string().min(1, "Basic password is required"),
})

export const authSchema = z.discriminatedUnion("type", [
    bearerAuthSchema,
    apiKeyAuthSchema,
    basicAuthSchema,
])

export type AuthConfig = z.infer<typeof authSchema>
