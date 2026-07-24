import z from "zod";

export const createApiKeySchema = z.object({
    name: z.string().min(3).max(100)
});

export const apiKeyIdSchema = z.object({
    id: z.uuid()
})