import { db } from "../firebase";
import { collection, doc, setDoc, getDoc, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { MealPlan } from "../types";

const MEAL_PLANS_COLLECTION = "mealPlans";

export const saveMealPlan = async (mealPlan: MealPlan) => {
  if (!mealPlan.uid) return;
  const docRef = doc(db, MEAL_PLANS_COLLECTION, `${mealPlan.uid}_${mealPlan.date}`);
  await setDoc(docRef, mealPlan);
};

export const getLatestMealPlan = async (uid: string): Promise<MealPlan | null> => {
  const q = query(
    collection(db, MEAL_PLANS_COLLECTION),
    where("uid", "==", uid),
    orderBy("date", "desc"),
    limit(1)
  );
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data() as MealPlan;
  }
  return null;
};
