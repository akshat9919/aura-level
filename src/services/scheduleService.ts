import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { TrainingDay } from "../types";

const SCHEDULES_COLLECTION = "trainingSchedules";

export const saveTrainingSchedule = async (uid: string, days: TrainingDay[]) => {
  const docRef = doc(db, SCHEDULES_COLLECTION, uid);
  await setDoc(docRef, { uid, days });
};

export const getTrainingSchedule = async (uid: string): Promise<TrainingDay[]> => {
  const docRef = doc(db, SCHEDULES_COLLECTION, uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return (docSnap.data() as { days: TrainingDay[] }).days;
  }
  return [];
};
