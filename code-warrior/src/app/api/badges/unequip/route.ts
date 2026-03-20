import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getServiceSupabase } from '@/lib/supabase';
import { RequestValidationError, getRequiredUuidField } from '@/lib/request-validation';
import { errorResponse, internalServerError } from '@/lib/api-response';
import { checkRateLimit, getClientIp, getRateLimitHeaders } from '@/lib/rate-limit';

/**
 * POST /api/badges/unequip
 * Unequip a badge from equipment slots
 */
export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const ipLimit = checkRateLimit(`ip:${clientIp}`, 'badgeUnequip');
    if (ipLimit.isLimited) {
      return errorResponse({
        status: 429,
        code: 'RATE_LIMITED',
        message: `Too many requests from this IP. Please try again in ${ipLimit.retryAfter} seconds.`,
        retryable: true,
        retryAfter: ipLimit.retryAfter,
        headers: getRateLimitHeaders(ipLimit.remaining, ipLimit.resetIn, ipLimit.retryAfter),
      });
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.error('Badge unequip: No session or user ID found');
      return errorResponse({
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
      });
    }

    const userLimit = checkRateLimit(`user:${session.user.id}`, 'badgeUnequip');
    if (userLimit.isLimited) {
      return errorResponse({
        status: 429,
        code: 'RATE_LIMITED',
        message: `Too many badge unequip attempts. Please try again in ${userLimit.retryAfter} seconds.`,
        retryable: true,
        retryAfter: userLimit.retryAfter,
        headers: getRateLimitHeaders(userLimit.remaining, userLimit.resetIn, userLimit.retryAfter),
      });
    }

    const badgeId = await getRequiredUuidField(request, 'badgeId', 'Badge ID');

    const githubId = session.user.id;
    const supabase = getServiceSupabase();

    // Fetch user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('github_id', githubId)
      .single();

    if (userError || !user) {
      return errorResponse({
        status: 404,
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    // Check if user owns this badge and it's equipped
    const { data: userBadge, error: userBadgeError } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', user.id)
      .eq('badge_id', badgeId)
      .single();

    if (userBadgeError || !userBadge) {
      return errorResponse({
        status: 403,
        code: 'FORBIDDEN',
        message: 'You do not own this badge',
      });
    }

    // Check if badge is equipped
    if (!userBadge.equipped) {
      return errorResponse({
        status: 400,
        code: 'BAD_REQUEST',
        message: 'Badge is not equipped',
      });
    }

    // Unequip the badge
    const { error: unequipError } = await supabase
      .from('user_badges')
      .update({ equipped: false })
      .eq('user_id', user.id)
      .eq('badge_id', badgeId);

    if (unequipError) {
      throw unequipError;
    }

    // Fetch the badge details
    const { data: badge } = await supabase
      .from('badges')
      .select('*')
      .eq('id', badgeId)
      .single();

    return NextResponse.json({
      success: true,
      message: `${badge?.name || 'Badge'} unequipped successfully`,
      badge,
    });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return errorResponse({
        status: error.status,
        code: 'BAD_REQUEST',
        message: error.message,
      });
    }

    console.error('Error unequipping badge:', error);
    return internalServerError('Failed to unequip badge');
  }
}
