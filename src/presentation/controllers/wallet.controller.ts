import type { FastifyReply, FastifyRequest } from "fastify";
import { createWalletSchema, creditWalletSchema, debitWalletSchema, ownerIdSchema, walletIdSchema } from "../schemas/wallet.schema.js";
import { container } from "@/infra/container/index.js";
import type { WalletOwnerType } from "@/domain/entities/wallet.entity.js";
import { UnauthorizedError } from "@/domain/errors/unauthorized.error.js";

export class WalletController {
    async create(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const body = createWalletSchema.parse(request.body);

        const ownerId = request.user.sub
        const ownerType = request.user.type as WalletOwnerType

        const output = await container.createWallet.execute({
            ownerId,
            ownerType,
            currency: body.currency
        });

        reply.status(201).send({ status: 'success', data: output });
    }

    async getMyWallet(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const ownerId = request.user.sub;
        
        const output = await container.getWalletByOwnerId.execute(ownerId);

        reply.status(200).send({ status: 'success', data: output });
    }

    async credit(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { id } = walletIdSchema.parse(request.params);
        const body = creditWalletSchema.parse(request.body);

        const wallet = await container.getWalletById.execute(id);

        if(wallet.ownerId !== request.user.sub){
            throw new UnauthorizedError('You can only deposit into your own wallet');
        }

        const output = await container.creditWallet.execute({
            walletId: id,
            amountInCents: body.amountInCents
        });

        reply.status(200).send({ status: 'success', data: output });
    }

    async debit(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { id } = walletIdSchema.parse(request.params);
        const body = debitWalletSchema.parse(request.body);

        const wallet = await container.getWalletById.execute(id);

        if(wallet.ownerId !== request.user.sub){
            throw new UnauthorizedError('You can only withdraw from your own wallet');
        }

        const output = await container.debitWallet.execute({
            walletId: id,
            amountInCents: body.amountInCents
        });

        reply.status(200).send({ status: 'success', data: output });
    }
}