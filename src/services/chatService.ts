import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ChatHistory, ChatMessage } from "../types";

const CHATS_COLLECTION = "chats";

export const saveChatHistory = async (uid: string, messages: ChatMessage[]) => {
  const docRef = doc(db, CHATS_COLLECTION, uid);
  await setDoc(docRef, {
    uid,
    messages,
    lastUpdated: new Date().toISOString(),
  });
};

export const getChatHistory = async (uid: string): Promise<ChatMessage[]> => {
  const docRef = doc(db, CHATS_COLLECTION, uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return (docSnap.data() as ChatHistory).messages;
  }
  return [];
};
