import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const NotificationManager: React.FC = () => {
  const { profile } = useAuth();

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notification');
      return;
    }

    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      await Notification.requestPermission();
    }
  };

  const sendNotification = (title: string, body: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico', // Adjust icon path if needed
      });
    }
  };

  useEffect(() => {
    requestPermission();
  }, []);

  useEffect(() => {
    if (!profile || profile.notificationsEnabled === false) return;

    // Daily check logic
    const checkDailyReminder = () => {
      try {
        const lastWorkout = profile.lastWorkout ? new Date(profile.lastWorkout) : null;
        const today = new Date();
        
        const hasWorkedOutToday = lastWorkout && 
          lastWorkout.getDate() === today.getDate() &&
          lastWorkout.getMonth() === today.getMonth() &&
          lastWorkout.getFullYear() === today.getFullYear();

        if (!hasWorkedOutToday) {
          sendNotification(
            "System Alert: Daily Quest Available",
            "Your Mana Core is destabilizing. Enter the dungeon now to maintain your rank!"
          );
        }
      } catch (error) {
        console.error("Notification check error:", error);
      }
    };

    // Run check on mount and then every few hours (or just once per session)
    checkDailyReminder();
    const interval = setInterval(checkDailyReminder, 1000 * 60 * 60 * 4); // Every 4 hours

    return () => clearInterval(interval);
  }, [profile]);

  return null;
};

export default NotificationManager;
