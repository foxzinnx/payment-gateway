import type { IWalletRepository } from '@/domain/repositories/wallet.repository.js'
import type { WalletOutputDTO } from '@/application/dtos/wallet.dto.js'
import { UniqueEntityId } from '@/domain/value-objects/unique-entity-id.vo.js'
import { NotFoundError } from '@/domain/errors/not-found.error.js'

export class GetWalletByIdUseCase {
  constructor(private readonly walletRepository: IWalletRepository) {}

  async execute(id: string): Promise<WalletOutputDTO> {
    const wallet = await this.walletRepository.findById(
      new UniqueEntityId(id)
    )

    if (!wallet) throw new NotFoundError('Wallet')

    return {
      id: wallet.id.value,
      ownerId: wallet.ownerId.value,
      ownerType: wallet.ownerType,
      balanceInCents: wallet.balance.amountInCents,
      balanceFormatted: wallet.balance.formatted,
      currency: wallet.currency,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    }
  }
}