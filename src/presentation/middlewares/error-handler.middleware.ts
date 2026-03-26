import { DomainError } from "@/domain/errors/domain.error.js";
import { InsufficientFundsError } from "@/domain/errors/insufficient-funds.error.js";
import { InvalidArgumentError } from "@/domain/errors/invalid-argument.error.js";
import { NotFoundError } from "@/domain/errors/not-found.error.js";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

export function errorHandler(error: unknown, request: FastifyRequest, reply: FastifyReply): void{
    if(error instanceof ZodError){
        reply.status(400).send({
            status: 'error',
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            issues: error.issues.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            }))
        });

        return;
    }

    if(error instanceof NotFoundError){
        reply.status(404).send({
            status: 'error',
            code: error.code,
            message: error.message
        });
        return;
    }

    if(error instanceof InvalidArgumentError){
        reply.status(409).send({
            status: 'error',
            code: error.code,
            message: error.message
        });
        return;
    }

    if(error instanceof InsufficientFundsError){
        reply.status(422).send({
            status: 'error',
            code: error.code,
            message: error.message
        });
        return;
    }

    if(error instanceof DomainError){
        reply.status(400).send({
            status: 'error',
            code: error.code,
            message: error.message
        });
        return;
    }

      console.error('Unexpected error:', error)

      reply.status(500).send({
        status: 'error',
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      });
}