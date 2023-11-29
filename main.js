import "./style.css";
import { db } from "./firebase";
import {
  onSnapshot,
  addDoc,
  getDoc,
  doc,
  serverTimestamp,
  collection,
} from "firebase/firestore";

// Selectors
const addButtonEl = document.getElementById("addButton");
const inputFieldEl = document.getElementById("input");
const shoppingList = document.getElementById("shoppingList");

// Global Consts
const shoppingListCollection = "shoppingList";
const shoppingListRef = collection(db, shoppingListCollection);

//////////////////////
// Firebase Calls
/////////////////////
async function addItemToDB(itemBody) {
  try {
    const listItemRef = await addDoc(collection(db, shoppingListCollection), {
      item: itemBody,
      createdAt: serverTimestamp(),
    });
    console.log("Document written with ID: ", listItemRef);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

function fetchListFromDB(query, user) {
  onSnapshot(query, (listSnapshot) => {
    clearList(shoppingList);
    listSnapshot.forEach((doc) => {
      const { item } = doc.data();

      createListItem(item);
    });
  });
}

// Primary Functionality

addButtonEl.addEventListener("click", function () {
  let inputValue = inputFieldEl.value;
  addItemToDB(inputValue);
  clearinput();
  fetchListFromDB(shoppingListRef);
});

// Helper UI Functions

function clearinput() {
  inputFieldEl.value = "";
}

function clearList(element) {
  element.innerHTML = "";
}

function createListItem(itemData) {
  const li = document.createElement("li");
  li.textContent = itemData;
  li.classList.add("shopping-list-item");

  shoppingList.appendChild(li);
}
