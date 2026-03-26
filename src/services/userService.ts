import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';

export const userService = {
  async addXP(userId: string, currentProfile: UserProfile, amount: number, statUpdate?: Partial<UserProfile['stats']>, additionalUpdates?: any) {
    const userRef = doc(db, 'users', userId);
    
    let newXP = Math.floor(currentProfile.xp + amount);
    let newLevel = Math.floor(currentProfile.level);
    
    // Level up logic: each level requires level * 1000 XP
    // Using a loop to handle multiple level ups if the XP gain is large
    while (newXP >= newLevel * 1000) {
      newXP -= newLevel * 1000;
      newLevel += 1;
    }

    const updates: any = {
      xp: newXP,
      level: newLevel,
      ...additionalUpdates
    };

    if (statUpdate) {
      Object.entries(statUpdate).forEach(([key, value]) => {
        updates[`stats.${key}`] = increment(value as number);
      });
    }

    await updateDoc(userRef, updates);
  },

  async completeQuest(userId: string, currentProfile: UserProfile, questId: string, xpReward: number, statReward?: Partial<UserProfile['stats']>) {
    const userRef = doc(db, 'users', userId);
    
    // Check if quest is already completed
    if (currentProfile.completedQuests?.includes(questId)) return;

    let newXP = Math.floor(currentProfile.xp + xpReward);
    let newLevel = Math.floor(currentProfile.level);
    
    // Level up logic: each level requires level * 1000 XP
    while (newXP >= newLevel * 1000) {
      newXP -= newLevel * 1000;
      newLevel += 1;
    }

    const completedQuests = [...(currentProfile.completedQuests || []), questId];

    const updates: any = {
      xp: newXP,
      level: newLevel,
      completedQuests: completedQuests,
    };

    if (statReward) {
      Object.entries(statReward).forEach(([key, value]) => {
        updates[`stats.${key}`] = increment(value as number);
      });
    }

    await updateDoc(userRef, updates);
  }
};
