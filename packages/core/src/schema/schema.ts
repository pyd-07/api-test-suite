import {z} from "zod"

const HTTPMethodsSchema = z.enum([
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "HEAD"
])
export type HTTPMethods = z.infer<typeof HTTPMethodsSchema>


const QueryParamsSchema = z.record( z.string(), z.string().or(z.number()) )
export type  QueryParams = z.infer<typeof QueryParamsSchema>


const HeadersSchema = z.record(z.string(), z.string())
export type Headers = z.infer<typeof HeadersSchema>


const RequestSchema = z.object({
    method: HTTPMethodsSchema,
    url: z.string(),

    query: QueryParamsSchema.optional(),
    headers: HeadersSchema.optional(),
    body: z.any().optional(),
})
export type RequestConfig = z.infer<typeof RequestSchema>


const BodyExpectationSchema = z.object({
    contains: z.string().optional(),
    equals: z.any().optional()
})


const ExpectationSchema = z.object({
    status: z.number(),

    headers: HeadersSchema.optional(),
    body: BodyExpectationSchema.optional(),

    timeout: z.number().optional(),
    responseTime: z.number().optional()
})
export type Expectation = z.infer<typeof ExpectationSchema>

const ExtractSchema = z.record(z.string(), z.string()).optional()
export type ExtractConfig = z.infer<typeof ExtractSchema>

export const TestCaseSchema = z.object({
    name: z.string(),
    description: z.string().optional(),

    request: RequestSchema,
    retries: z.number().optional(),
    retryDelay: z.number().optional(),
    expect: ExpectationSchema,
    extract: ExtractSchema
})
export type TestCase = z.infer<typeof TestCaseSchema>

export const ValidateTestSchema = z.object({
    name: z.string(),
    stat: z.enum(["pass", "fail"]), // can add delay option too, but I'm too lazy to implement that
    responseTime: z.number().optional(),
    failReason: z.string().optional()
})
export type ValidatedTest = z.infer<typeof ValidateTestSchema>

export const ValidateResponseSchema = z.object({
    stat: z.enum(["pass", "fail"]), // can add delay option too, but I'm too lazy to implement that
    failReason: z.string().optional()
})
export type ValidatedResponse = z.infer<typeof ValidateResponseSchema>