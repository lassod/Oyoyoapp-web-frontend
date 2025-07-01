//@ts-nocheck
import {
  PrismaClient,
  Admins,
  Prisma,
  Account,
  Session,
  Users,
  VerificationToken,
  AccountType,
  PaymentGatewayType,
  PaymentGateway,
  Events,
  ClickstreamEvent,
} from '@prisma/client';

const prisma = new PrismaClient();

export { prisma, Prisma, PrismaClient };
export type {
  Account,
  Admins,
  Session,
  Users,
  VerificationToken,
  AccountType,
  PaymentGatewayType,
  PaymentGateway,
  Events,
  ClickstreamEvent,
}; 