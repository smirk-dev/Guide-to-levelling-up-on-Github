import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getServiceSupabase } from '@/lib/supabase';
import { MAX_EQUIPPED_BADGES } from '@/lib/constants';
import { RequestValidationError, getRequiredUuidField } from '@/lib/request-validation';
import { errorResponse, internalServerError } from '@/lib/api-response';
import { checkRateLimit, getClientIp, getRateLimitHeaders } from '@/lib/rate-limit';
import { getRequestId, logWithRequestContext } from '@/lib/request-context';

function getEquipErrorStatus(message: string): number {
  if (message.includes('not found')) {
    return 404;
  }

  if (
    message.includes('do not own') ||
    message.includes('already equipped') ||
    message.includes('Maximum')
  ) {
    return 400;
  }

  return 500;
}

/**
 * POST /api/badges/equip
 * Equip a badge to one of the 3 equipment slots
 */
export async function POST(request: Request) {
  try {
    const requestId = getRequestId(request);
    const clientIp = getClientIp(request);
    const ipLimit = checkRateLimit(`ip:${clientIp}`, 'badgeEquip');
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
      logWithRequestContext('warn', 'Badge equip unauthorized - no user session', { requestId });
      return errorResponse({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
        headers: { 'X-Request-Id': requestId },
      });
    }

    const userLimit = checkRateLimit(`user:${session.user.id}`, 'badgeEquip');
    if (userLimit.isLimited) {
      return errorResponse({
        status: 429,
        code: 'RATE_LIMITED',
        message: `Too many badge equip attempts. Please try again in ${userLimit.retryAfter} seconds.`,
        retryable: true,
        retryAfter: userLimit.retryAfter,
        headers: {
          ...getRateLimitHeaders(userLimit.remaining, userLimit.resetIn, userLimit.retryAfter),
          'X-Request-Id': requestId,
        },
      });
    }

    const badgeId = await getRequiredUuidField(request, 'badgeId', 'Badge ID');

    const githubId = session.user.id;
    const supabase = getServiceSupabase();
    const { data, error } = await supabase.rpc('equip_badge_atomic', {
      p_github_id: githubId,
      p_badge_id: badgeId,
      p_max_equipped: MAX_EQUIPPED_BADGES,
    });

    if (error) {
      const status = getEquipErrorStatus(error.message);
      return errorResponse({
        status,
        code:
          status === 404
            ? 'NOT_FOUND'
            : status === 400
            ? 'BAD_REQUEST'
            : 'INTERNAL_ERROR',
        message: error.message,
        headers: { 'X-Request-Id': requestId },
      });
    }

    return NextResponse.json({
      success: true,
      message: `${data?.badgeName || 'Badge'} equipped successfully`,
      badgeId,
      equippedCount: data?.equippedCount ?? MAX_EQUIPPED_BADGES,
    }, {
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
    logWithRequestContext('error', 'Error equipping badge', { requestId, error });
    return internalServerError('Failed to equip badge');
  }
}
