import type { FastifyReply, FastifyRequest } from "fastify";
import { createWalletSchema, creditWalletSchema, debitWalletSchema, ownerIdSchema, walletIdSchema } from "../schemas/wallet.schema.js";
import { container } from "@/infra/container/index.js";

export class WalletController {
    async create(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const body = createWalletSchema.parse(request.body);

        const output = await container.createWallet.execute(body);

        reply.status(201).send({ status: 'success', data: output });
    }

    async getByOwnerId(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { ownerId } = ownerIdSchema.parse(request.params);

        const output = await container.getWalletById.execute(ownerId);

        reply.status(200).send({ status: 'success', data: output });
    }

    async credit(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { id } = walletIdSchema.parse(request.params);
        const body = creditWalletSchema.parse(request.body);

        const output = await container.creditWallet.execute({
            walletId: id,
            amountInCents: body.amountInCents
        });

        reply.status(200).send({ status: 'success', data: output });
    }

    async debit(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { id } = walletIdSchema.parse(request.params);
        const body = debitWalletSchema.parse(request.body);

        const output = await container.debitWallet.execute({
            walletId: id,
            amountInCents: body.amountInCents
        });

        reply.status(200).send({ status: 'success', data: output });
    }
}