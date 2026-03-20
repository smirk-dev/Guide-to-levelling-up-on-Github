import type { Quest } from '@/types/database';

export interface ActiveSeasonMeta {
  name: string;
  startsAt?: string;
  endsAt?: string;
}

export function filterActiveSeasonQuests(quests: Quest[], now = new Date()): Quest[] {
  return quests.filter((quest) => {
    if (!quest.season_name) {
      return true;
    }

    const startsAt = quest.season_starts_at ? new Date(quest.season_starts_at) : null;
    const endsAt = quest.season_ends_at ? new Date(quest.season_ends_at) : null;

    const startsValid = !startsAt || startsAt.getTime() <= now.getTime();
    const endsValid = !endsAt || endsAt.getTime() >= now.getTime();

    return startsValid && endsValid;
  });
}

export function getActiveSeasonMeta(quests: Quest[], now = new Date()): ActiveSeasonMeta | null {
  const seasonal = quests.find((quest) => {
    if (!quest.season_name) {
      return false;
    }

    const startsAt = quest.season_starts_at ? new Date(quest.season_starts_at) : null;
    const endsAt = quest.season_ends_at ? new Date(quest.season_ends_at) : null;

    const startsValid = !startsAt || startsAt.getTime() <= now.getTime();
    const endsValid = !endsAt || endsAt.getTime() >= now.getTime();

    return startsValid && endsValid;
  });

  if (!seasonal || !seasonal.season_name) {
    return null;
  }

  return {
    name: seasonal.season_name,
    startsAt: seasonal.season_starts_at || undefined,
    endsAt: seasonal.season_ends_at || undefined,
  };
}
