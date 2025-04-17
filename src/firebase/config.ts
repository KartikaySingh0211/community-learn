// lib/firebase.ts
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
	apiKey: "AIzaSyDALiwv3p-TL_OARb6yWQ2N5s4dlC-a5HU",
	authDomain: "community-learn-app.firebaseapp.com",
	projectId: "community-learn-app",
	storageBucket: "community-learn-app.firebasestorage.app",
	messagingSenderId: "282683567103",
	appId: "1:282683567103:web:78dece8352c949ba1395ca",
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (!getApps().length) {
	app = initializeApp(firebaseConfig);
	auth = getAuth(app);
	db = getFirestore(app);
	storage = getStorage(app);
} else {
	app = getApps()[0];
	auth = getAuth(app);
	db = getFirestore(app);
	storage = getStorage(app);
}

export { app, auth, db, storage };
