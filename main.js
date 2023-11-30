import "./style.css";

import { db } from "./firebase";
import { auth } from "./firebase";
import {
  GoogleAuthProvider,
  signInWithRedirect,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  onSnapshot,
  addDoc,
  getDoc,
  doc,
  serverTimestamp,
  collection,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";

/////////////////////////
// Selectors
/////////////////////////
const addButtonEl = document.getElementById("addButton");
const inputFieldEl = document.getElementById("input");
const shoppingList = document.getElementById("shoppingList");
const googleProviderButton = document.getElementById("sign-in-with-google-btn");
const logOutBtn = document.getElementById("log-out-btn");

const logInEmailEl = document.getElementById("email-input");
const logInPasswordEl = document.getElementById("password-input");
const logInButton = document.getElementById("sign-in-btn");
const createAcccountSwitchButton =
  document.getElementById("create-account-btn");

const signUpButton = document.getElementById("sign-up-btn");
const logInSwithButton = document.getElementById("login-account-btn");
const registerEmailEl = document.getElementById("register-email-input");
const registerPasswordEl = document.getElementById("register-password-input");
const registerConfirmPasswordEl = document.getElementById(
  "confirm-register-password-input"
);

const userProfilePicture = document.getElementById("user-avatar");
const userGreetingEl = document.getElementById("user-greeting");
const viewLoggedOut = document.getElementById("logged-out-view");
const viewLoggedIn = document.getElementById("logged-in-view");
const viewRegister = document.getElementById("create-account-view");

/////////////////////////
// Global Consts
/////////////////////////
const shoppingListCollection = "shoppingList";
const shoppingListRef = collection(db, shoppingListCollection);
const googleProvider = new GoogleAuthProvider();

let isLogInView = true;

//////////////////////
// Auth
/////////////////////
onAuthStateChanged(auth, (user) => {
  if (user) {
    showLoggedInView();
    fetchFullList(user);
    showProfilePicture(userProfilePicture, user);
    showUserGreeting(userGreetingEl, user);
  } else {
    showLoggedOutView();
  }
});

function authSignInGoogle() {
  signInWithRedirect(auth, googleProvider)
    .then((result) => {
      console.log("signed in with google");
    })
    .catch((error) => {
      console.log(error.message);
    });
}

function authSignInWithEmail() {
  const email = logInEmailEl.value;
  const password = logInPasswordEl.value;

  if (!email || !password) return;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("sign in with email and password");
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage);
    });
}

function authCreateAccountWithEmail() {
  const email = registerEmailEl.value;
  const password = registerPasswordEl.value;
  const confirmPassword = registerConfirmPasswordEl.value;

  if (password !== confirmPassword || !email || !password || !confirmPassword)
    return;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log(userCredential);
      clearRegisterFields();
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage);
    });
}

//////////////////////
// Firebase Calls
/////////////////////

// List calls

function fetchListFromDB(query, user) {
  onSnapshot(query, (listSnapshot) => {
    clearList(shoppingList);

    if (listSnapshot.size === 0) {
      return showEmptyListElement();
    }
    listSnapshot.forEach((doc) => {
      const { item } = doc.data();
      const itemId = doc.id;

      createListItem(item, itemId);
    });
  });
}

function fetchFullList(user) {
  const q = query(shoppingListRef, where("user", "==", user.uid));
  fetchListFromDB(q, user);
}

async function addItemToDB(itemBody, user) {
  try {
    const listItemRef = await addDoc(collection(db, shoppingListCollection), {
      item: itemBody,
      user: user.uid,
      createdAt: serverTimestamp(),
    });
    console.log("Document written with ID: ", listItemRef);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

async function deleteItemFromList(docId) {
  await deleteDoc(doc(db, shoppingListCollection, docId));
}

function authSignOut() {
  signOut(auth)
    .then(() => {
      clearAuthFields();
    })
    .catch((error) => {
      console.log(error.message);
    });
}

/////////////////////////
// UI Functionality - event listeners
/////////////////////////
addButtonEl.addEventListener("click", function () {
  let inputValue = inputFieldEl.value;
  const user = auth.currentUser;
  if (!inputValue || !user) return;

  addItemToDB(inputValue, user);
  clearinput(inputFieldEl);
  fetchFullList(user);
});

shoppingList.addEventListener("click", async (event) => {
  const curItemId = event.target.getAttribute("data-id");
  deleteItemFromList(curItemId);
});

googleProviderButton.addEventListener("click", authSignInGoogle);

logOutBtn.addEventListener("click", authSignOut);

createAcccountSwitchButton.addEventListener("click", showRegisterView);

logInSwithButton.addEventListener("click", showLoggedOutView);

logInButton.addEventListener("click", authSignInWithEmail);

signUpButton.addEventListener("click", authCreateAccountWithEmail);
/////////////////////////
// Helper UI Functions
/////////////////////////
function showRegisterView() {
  isLogInView = false;
  hideView(viewLoggedOut);
  hideView(viewLoggedIn);
  showView(viewRegister);
}

function showLoggedInView() {
  isLogInView = true;
  hideView(viewLoggedOut);
  hideView(viewRegister);
  showView(viewLoggedIn);
}

function showLoggedOutView() {
  hideView(viewLoggedIn);
  hideView(viewRegister);
  showView(viewLoggedOut);
}

function showView(view) {
  view.style.display = "flex";
}
function hideView(view) {
  view.style.display = "none";
}

function clearinput(field) {
  field.value = "";
}

function clearAuthFields() {
  clearinput(logInEmailEl);
  clearinput(logInPasswordEl);
}

function clearRegisterFields() {
  clearinput(registerEmailEl);
  clearinput(registerPasswordEl);
  clearinput(registerConfirmPasswordEl);
}

function clearList(element) {
  element.innerHTML = "";
}

function showProfilePicture(imgElement, user) {
  const photoURL = user.photoURL;
  if (photoURL) {
    imgElement.src = photoURL;
  } else {
    imgElement.src = "/avatar-placeholder.png";
  }
}

function showUserGreeting(userGreetingEl, user) {
  const displayName = user.displayName;
  if (displayName) {
    const userFirstName = displayName.split(" ")[0];
    userGreetingEl.textContent = `Hey ${userFirstName} 👋`;
  } else {
    userGreetingEl.textContent = `Hey Friend 👋`;
  }
}

function createListItem(itemData, itemId) {
  if (itemData && itemId) {
    const li = document.createElement("li");
    li.textContent = itemData;
    li.classList.add("shopping-list-item");
    li.setAttribute("data-id", itemId);

    shoppingList.appendChild(li);
  }
}
function showEmptyListElement() {
  const emptyList = document.createElement("h2");
  emptyList.textContent =
    "Looks like you have no items here 🤔 It`s time do add something!";
  emptyList.classList.add("empty-list");
  shoppingList.appendChild(emptyList);
}

// Carousel
