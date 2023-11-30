import "./style.css";
import { db } from "./firebase";
import {
  onSnapshot,
  addDoc,
  getDoc,
  doc,
  serverTimestamp,
  collection,
  deleteDoc,
} from "firebase/firestore";

/////////////////////////
// Selectors
/////////////////////////
const addButtonEl = document.getElementById("addButton");
const inputFieldEl = document.getElementById("input");
const shoppingList = document.getElementById("shoppingList");

/////////////////////////
// Global Consts
/////////////////////////
const shoppingListCollection = "shoppingList";
const shoppingListRef = collection(db, shoppingListCollection);

//////////////////////
// Firebase Calls
/////////////////////
document.addEventListener("DOMContentLoaded", fetchListFromDB(shoppingListRef));

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

async function deleteItemFromList(docId) {
  await deleteDoc(doc(db, shoppingListCollection, docId));
}

/////////////////////////
// Primary Functionality
/////////////////////////
addButtonEl.addEventListener("click", function () {
  let inputValue = inputFieldEl.value;
  if (!inputValue) return;

  addItemToDB(inputValue);
  clearinput();
});

shoppingList.addEventListener("click", async (event) => {
  const curItemId = event.target.getAttribute("data-id");
  deleteItemFromList(curItemId);
});

/////////////////////////
// Helper UI Functions
/////////////////////////
function clearinput() {
  inputFieldEl.value = "";
}

function clearList(element) {
  element.innerHTML = "";
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
