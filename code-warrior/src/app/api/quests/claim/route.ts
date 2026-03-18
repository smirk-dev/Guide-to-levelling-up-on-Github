import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getServiceSupabase } from '@/lib/supabase';
import {
  RequestValidationError,
  getOptionalIdempotencyKey,
  getRequiredUuidField,
} from '@/lib/request-validation';
import { errorResponse, internalServerError } from '@/lib/api-response';
import { checkRateLimit, getClientIp, getRateLimitHeaders } from '@/lib/rate-limit';
import type { ApiErrorCode } from '@/types/api';
import { getRequestId, logWithRequestContext } from '@/lib/request-context';

const IDEMPOTENCY_ACTION = 'quest_claim';

interface IdempotencyRecord {
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  response_status: number | null;
  response_body: Record<string, unknown> | null;
}

function getIdempotencyInProgressResponse() {
  return errorResponse({
    status: 409,
    code: 'CONFLICT',
    message: 'An identical quest claim request is already in progress. Please retry shortly.',
    retryable: true,
    retryAfter: 1,
  });
}

function getStoredReplayResponse(data: IdempotencyRecord) {
  if (!data.response_status || !data.response_body) {
    return internalServerError('Stored idempotency response is incomplete');
  }

  return NextResponse.json(data.response_body, {
    status: data.response_status,
    headers: {
      'X-Idempotent-Replay': 'true',
    },
  });
}

function getClaimErrorStatus(message: string): number {
  if (message.includes('not found')) {
    return 404;
  }

  if (
    message.includes('not completed') ||
    message.includes('already claimed') ||
    message.includes('invalid quest')
  ) {
    return 400;
  }

  return 500;
}

/**
 * POST /api/quests/claim
 * Claim a completed quest reward
 */
export async function POST(request: Request) {
  try {
    const requestId = getRequestId(request);
    const clientIp = getClientIp(request);
    const ipLimit = checkRateLimit(`ip:${clientIp}`, 'questClaim');
    if (ipLimit.isLimited) {
      return errorResponse({
        status: 429,
        code: 'RATE_LIMITED',
        message: `Too many requests from this IP. Please try again in ${ipLimit.retryAfter} seconds.`,
        retryable: true,
        retryAfter: ipLimit.retryAfter,
        headers: {
          ...getRateLimitHeaders(ipLimit.remaining, ipLimit.resetIn, ipLimit.retryAfter),
          'X-Request-Id': requestId,
        },
      });
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      logWithRequestContext('warn', 'Quest claim unauthorized - no user session', { requestId });
      return errorResponse({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
        headers: { 'X-Request-Id': requestId },
      });
    }

    const userLimit = checkRateLimit(`user:${session.user.id}`, 'questClaim');
    if (userLimit.isLimited) {
      return errorResponse({
        status: 429,
        code: 'RATE_LIMITED',
        message: `Too many quest claim attempts. Please try again in ${userLimit.retryAfter} seconds.`,
        retryable: true,
        retryAfter: userLimit.retryAfter,
        headers: {
          ...getRateLimitHeaders(userLimit.remaining, userLimit.resetIn, userLimit.retryAfter),
          'X-Request-Id': requestId,
        },
      });
    }

    const questId = await getRequiredUuidField(request, 'questId', 'Quest ID');
    const idempotencyKey = getOptionalIdempotencyKey(request.headers);

    const githubId = session.user.id;
    const supabase = getServiceSupabase();

    if (idempotencyKey) {
      const existingRequest = await supabase
        .from('api_idempotency_keys')
        .select('status, response_status, response_body')
        .eq('github_id', githubId)
        .eq('action', IDEMPOTENCY_ACTION)
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle<IdempotencyRecord>();

      if (existingRequest.error) {
        logWithRequestContext('error', 'Error loading idempotency key state', {
          requestId,
          githubId,
          error: existingRequest.error,
        });
        return internalServerError('Failed to validate idempotency key');
      }

      if (existingRequest.data) {
        if (existingRequest.data.status === 'COMPLETED') {
          return getStoredReplayResponse(existingRequest.data);
        }

        if (existingRequest.data.status === 'PENDING') {
          return getIdempotencyInProgressResponse();
        }
      }

      const reserveRequest = await supabase.from('api_idempotency_keys').insert({
        github_id: githubId,
        action: IDEMPOTENCY_ACTION,
        idempotency_key: idempotencyKey,
        status: 'PENDING',
      });

      if (reserveRequest.error) {
        if (reserveRequest.error.code === '23505') {
          const racedRequest = await supabase
            .from('api_idempotency_keys')
            .select('status, response_status, response_body')
            .eq('github_id', githubId)
            .eq('action', IDEMPOTENCY_ACTION)
            .eq('idempotency_key', idempotencyKey)
            .maybeSingle<IdempotencyRecord>();

          if (racedRequest.error) {
            logWithRequestContext('error', 'Error loading raced idempotency key state', {
              requestId,
              githubId,
              error: racedRequest.error,
            });
            return internalServerError('Failed to validate idempotency key');
          }

          if (racedRequest.data?.status === 'COMPLETED') {
            return getStoredReplayResponse(racedRequest.data);
          }

          return getIdempotencyInProgressResponse();
        }

        logWithRequestContext('error', 'Error reserving idempotency key', {
          requestId,
          githubId,
          error: reserveRequest.error,
        });
        return internalServerError('Failed to reserve idempotency key');
      }
    }

    const { data, error } = await supabase.rpc('claim_quest_reward_atomic', {
      p_github_id: githubId,
      p_quest_id: questId,
    });

    if (error) {
      const status = getClaimErrorStatus(error.message);
      const errorCode: ApiErrorCode =
        status === 404 ? 'NOT_FOUND' : status === 400 ? 'BAD_REQUEST' : 'INTERNAL_ERROR';
      const errorPayload = {
        success: false,
        error: error.message,
        message: error.message,
        code: errorCode,
      };

      if (idempotencyKey && status < 500) {
        const idempotencyUpdate = await supabase
          .from('api_idempotency_keys')
          .update({
            status: 'COMPLETED',
            response_status: status,
            response_body: errorPayload,
          })
          .eq('github_id', githubId)
          .eq('action', IDEMPOTENCY_ACTION)
          .eq('idempotency_key', idempotencyKey);

        if (idempotencyUpdate.error) {
          logWithRequestContext('error', 'Error storing idempotency error response', {
            requestId,
            githubId,
            error: idempotencyUpdate.error,
          });
        }
      }

      return errorResponse({
        status,
        code: errorCode,
        message: errorPayload.message,
        headers: { 'X-Request-Id': requestId },
      });
    }

    const successPayload = {
      success: true,
      xpGained: data?.xpGained ?? 0,
      newTotalXP: data?.newTotalXP ?? 0,
      userQuestId: data?.userQuestId ?? null,
      badgeAwarded: data?.badgeAwarded ?? false,
    };

    if (idempotencyKey) {
      const idempotencyUpdate = await supabase
        .from('api_idempotency_keys')
        .update({
          status: 'COMPLETED',
          response_status: 200,
          response_body: successPayload,
        })
        .eq('github_id', githubId)
        .eq('action', IDEMPOTENCY_ACTION)
        .eq('idempotency_key', idempotencyKey);

      if (idempotencyUpdate.error) {
        logWithRequestContext('error', 'Error storing idempotency success response', {
          requestId,
          githubId,
          error: idempotencyUpdate.error,
        });
      }
    }

    return NextResponse.json(successPayload, {
      headers: {
        'X-Request-Id': requestId,
      },
    });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      const requestId = getRequestId(request);
      return errorResponse({
        status: error.status,
        code: 'BAD_REQUEST',
        message: error.message,
        headers: { 'X-Request-Id': requestId },
      });
    }

    const requestId = getRequestId(request);
    logWithRequestContext('error', 'Error claiming quest reward', { requestId, error });
    return internalServerError('Failed to claim quest reward');
  }
}
