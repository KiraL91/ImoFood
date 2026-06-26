import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, Treatment as PrismaTreatment } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import type { CreateTreatmentDto } from "./dto/create-treatment.dto";
import type { UpdateTreatmentDto } from "./dto/update-treatment.dto";
import {
  TREATMENT_CATEGORIES,
  TREATMENT_STATUSES,
  TREATMENT_TARGETS,
  type Treatment,
  type TreatmentCategory,
  type TreatmentFilters,
  type TreatmentStatus,
  type TreatmentTarget,
} from "./types/treatment";

@Injectable()
export class TreatmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    userId: string,
    filters: TreatmentFilters = {},
  ): Promise<Treatment[]> {
    this.assertValidCategory(filters.category);
    this.assertValidStatus(filters.status);
    this.assertValidTarget(filters.target);

    const search = filters.search?.trim().toLowerCase();
    const where: Prisma.TreatmentWhereInput = {
      userId,
    };

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.target) {
      where.targets = {
        has: filters.target,
      };
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          notes: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          targets: {
            has: search,
          },
        },
      ];
    }

    const treatments = await this.prisma.treatment.findMany({
      orderBy: [
        {
          status: "asc",
        },
        {
          name: "asc",
        },
      ],
      where,
    });

    return treatments.map((treatment) => this.toTreatment(treatment));
  }

  async findOne(id: string, userId: string): Promise<Treatment> {
    const treatment = await this.prisma.treatment.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!treatment) {
      throw new NotFoundException(`Treatment with id "${id}" was not found.`);
    }

    return this.toTreatment(treatment);
  }

  async create(
    createTreatmentDto: CreateTreatmentDto,
    userId: string,
  ): Promise<Treatment> {
    const treatment = await this.prisma.treatment.create({
      data: {
        category: createTreatmentDto.category,
        endDate: this.toOptionalDate(createTreatmentDto.endDate) ?? undefined,
        name: createTreatmentDto.name.trim(),
        notes: createTreatmentDto.notes?.trim() || undefined,
        startDate:
          this.toOptionalDate(createTreatmentDto.startDate) ?? undefined,
        status: createTreatmentDto.status,
        targets: this.normalizeTargets(createTreatmentDto.targets),
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    return this.toTreatment(treatment);
  }

  async update(
    id: string,
    updateTreatmentDto: UpdateTreatmentDto,
    userId: string,
  ): Promise<Treatment> {
    await this.findOne(id, userId);

    const data: Prisma.TreatmentUpdateInput = {
      category: updateTreatmentDto.category,
      endDate: this.toOptionalDate(updateTreatmentDto.endDate),
      name: updateTreatmentDto.name?.trim(),
      notes: this.normalizeOptionalString(updateTreatmentDto.notes),
      startDate: this.toOptionalDate(updateTreatmentDto.startDate),
      status: updateTreatmentDto.status,
      targets: updateTreatmentDto.targets
        ? this.normalizeTargets(updateTreatmentDto.targets)
        : undefined,
    };

    const treatment = await this.prisma.treatment.update({
      data,
      where: {
        id,
      },
    });

    return this.toTreatment(treatment);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);

    await this.prisma.treatment.delete({
      where: {
        id,
      },
    });
  }

  private assertValidCategory(category?: string): void {
    if (
      category &&
      !TREATMENT_CATEGORIES.includes(category as TreatmentCategory)
    ) {
      throw new BadRequestException(
        `Invalid category "${category}". Expected one of: ${TREATMENT_CATEGORIES.join(", ")}.`,
      );
    }
  }

  private assertValidStatus(status?: string): void {
    if (status && !TREATMENT_STATUSES.includes(status as TreatmentStatus)) {
      throw new BadRequestException(
        `Invalid status "${status}". Expected one of: ${TREATMENT_STATUSES.join(", ")}.`,
      );
    }
  }

  private assertValidTarget(target?: string): void {
    if (target && !TREATMENT_TARGETS.includes(target as TreatmentTarget)) {
      throw new BadRequestException(
        `Invalid target "${target}". Expected one of: ${TREATMENT_TARGETS.join(", ")}.`,
      );
    }
  }

  private normalizeOptionalString(
    value?: string | null,
  ): string | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    const trimmedValue = value?.trim();

    return trimmedValue && trimmedValue.length > 0 ? trimmedValue : null;
  }

  private normalizeTargets(targets: TreatmentTarget[]): TreatmentTarget[] {
    return Array.from(
      new Set(
        targets
          .map((target) => target.trim())
          .filter((target) => target.length > 0),
      ),
    ) as TreatmentTarget[];
  }

  private toOptionalDate(value?: string | null): Date | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    const normalizedValue = value?.trim();

    return normalizedValue && normalizedValue.length > 0
      ? new Date(normalizedValue)
      : null;
  }

  private toDateString(value: Date | null): string | undefined {
    return value ? value.toISOString().slice(0, 10) : undefined;
  }

  private toTreatment(treatment: PrismaTreatment): Treatment {
    return {
      category: treatment.category as TreatmentCategory,
      createdAt: treatment.createdAt.toISOString(),
      endDate: this.toDateString(treatment.endDate),
      id: treatment.id,
      name: treatment.name,
      notes: treatment.notes ?? undefined,
      startDate: this.toDateString(treatment.startDate),
      status: treatment.status as TreatmentStatus,
      targets: [...treatment.targets] as TreatmentTarget[],
      updatedAt: treatment.updatedAt.toISOString(),
    };
  }
}
