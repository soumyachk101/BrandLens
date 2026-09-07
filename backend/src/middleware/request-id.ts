import { FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'node:crypto';

export const requestId = async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
 const requestId =
 (request.headers['x-request-id'] as string | undefined) ||
 request.id ||
 randomUUID();
 (request as unknown as { requestId: string }).requestId = requestId;
};