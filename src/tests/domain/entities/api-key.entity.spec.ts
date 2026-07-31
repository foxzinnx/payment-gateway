import { ApiKey } from "@/domain/entities/api-key.entity.js";
import { InvalidArgumentError } from "@/domain/errors/invalid-argument.error.js";
import { describe, expect, it } from "vitest";

describe('ApiKey Entity', () => {
    const makeApiKey = (overrides = {}) =>
        ApiKey.create({
            name: 'CapyFood Production',
            keyHash: 'abc123-hash',
            keyPrefix: 'payflow_live_abc1...',
            ...overrides
        });

    describe('create', () => {
        it('should create an api key with isActive true by default', () => {
            const apiKey = makeApiKey();

            expect(apiKey.isActive).toBe(true);
            expect(apiKey.name).toBe('CapyFood Production');
            expect(apiKey.keyHash).toBe('abc123-hash');
            expect(apiKey.keyPrefix).toBe('payflow_live_abc1...');
            expect(apiKey.lastUsedAt).toBeNull();
        });

        it('should throw for name shorter than 3 chars', () => {
            expect(() => makeApiKey({ name: 'AB' })).toThrowError(InvalidArgumentError);
        });

        it('should trim name whitespace', () => {
            const apiKey = makeApiKey({ name: '  CapyFood Production  ' });
            expect(apiKey.name).toBe('CapyFood Production');
        });
    });

    describe('deactivate', () => {
        it('should deactivate an active api key', () => {
            const apiKey = makeApiKey();
            apiKey.deactivate();

            expect(apiKey.isActive).toBe(false);
        });

        it('should update updatedAt on deactivate', () => {
            const apiKey = makeApiKey();
            const before = apiKey.updatedAt;
            apiKey.deactivate();
            expect(apiKey.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
        });
    });

    describe('recordUsage', () => {
        it('should update lastUsedAt on recordUsage', () => {
            const apiKey = makeApiKey();
            expect(apiKey.lastUsedAt).toBeNull();

            apiKey.recordUsage();

            expect(apiKey.lastUsedAt).not.toBeNull();
        });

        it('should update updatedAt on recordUsage', () => {
            const apiKey = makeApiKey();
            expect(apiKey.lastUsedAt).toBeNull();

            apiKey.recordUsage();

            expect(apiKey.lastUsedAt).not.toBeNull();
        });
    });

    describe('toOutputDTO', () => {
        it('should return correct output DTO', () => {
            const apiKey = makeApiKey();
            const output = apiKey.toOutputDTO();

            expect(output.id).toBe(apiKey.id.value);
            expect(output.name).toBe('CapyFood Production');
            expect(output.keyPrefix).toBe('payflow_live_abc1...');
            expect(output.isActive).toBe(true);
            expect(output.lastUsedAt).toBeNull();
            expect(output).not.toHaveProperty('keyHash');
        })

        it('should not expose keyHash in output', () => {
            const apiKey = makeApiKey();
            const output = apiKey.toOutputDTO();

            expect(output).not.toHaveProperty('keyHash');
        })
    })
})