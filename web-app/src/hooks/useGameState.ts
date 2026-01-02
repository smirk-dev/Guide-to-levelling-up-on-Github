import { useState, useEffect } from 'react';
import { UserState } from '../types/game';
import { INITIAL_QUESTS } from '../game-data/achievements';

const INITIAL_STATE: UserState = {
    username: 'Guest User',
    level: 1,
    currentXP: 0,
    xpToNextLevel: 100,
    completedQuests: [],
    unlockedAchievements: []
};

export function useGameState() {
    const [gameState, setGameState] = useState<UserState>(() => {
        const saved = localStorage.getItem('github-game-state');
        return saved ? JSON.parse(saved) : INITIAL_STATE;
    });

    useEffect(() => {
        localStorage.setItem('github-game-state', JSON.stringify(gameState));
    }, [gameState]);

    const addXP = (amount: number) => {
        setGameState(prev => {
            let newXP = prev.currentXP + amount;
            let newLevel = prev.level;
            let nextLevelXP = prev.xpToNextLevel;

            // Simple Leveling Curve: Level * 100 XP per level
            // Level 1: 0-100
            // Level 2: 100-300 (200 diff)
            // Level 3: 300-600 (300 diff)

            // Check for level up loop
            while (newXP >= nextLevelXP) {
                newXP -= nextLevelXP;
                newLevel++;
                nextLevelXP = newLevel * 100; // Curve steepens
            }

            return {
                ...prev,
                level: newLevel,
                currentXP: newXP,
                xpToNextLevel: nextLevelXP
            };
        });
    };

    const completeQuest = (questId: string, xpReward: number) => {
        if (gameState.completedQuests.includes(questId)) return;

        setGameState(prev => ({
            ...prev,
            completedQuests: [...prev.completedQuests, questId]
        }));

        addXP(xpReward);
    };

    return {
        gameState,
        addXP,
        completeQuest,
        quests: INITIAL_QUESTS
    };
}
