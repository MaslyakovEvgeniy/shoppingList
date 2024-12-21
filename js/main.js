"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const formButton = document.querySelector(".form__button");
  const parentList = document.querySelector(".product-list");
  const confirmModal = document.querySelector(".modal");

  const SERVER = `http://localhost:3000/request`;

  let shoppinglist = [];

  //add in list

  function addProductInList(value, id) {
    let formItem = document.createElement("li");
    formItem.classList.add("product-list_item");
    formItem.setAttribute("id", `${id}`);
    formItem.textContent = `${value}`;
    parentList.append(formItem);
  }

  formButton.addEventListener("click", (e) => {
    e.preventDefault();

    shoppinglist.push();
    parentList.innerHTML = "";

    getData();

    let form = document.querySelector(".form");
    let formData = new FormData(form);

    let formDataObject = JSON.stringify(Object.fromEntries(formData));

    fetch(SERVER, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: formDataObject,
    })
      .then((response) => {
        if (!response.ok) {
          return null;
        }
        return response.json();
      })
      .then((response) => {
        addProductInList(response.product, response.id);
      })
      .catch((error) => {
        console.log(new Error(error));
      })
      .finally(form.reset());
  });

  //get list from DB

  async function getData() {
    const response = await fetch(SERVER);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const json = response.json();
    json
      .then((data) => {
        data.forEach((elements) => {
          addProductInList(elements.product, elements.id);
          shoppinglist.push(elements);
        });
      })
      .catch((error) => {
        console.log(new Error(error));
      })
      .finally(() => {
        document.dispatchEvent(new CustomEvent("busy", { detail: false }));
      });

    return json;
  }
  getData();

  //remove from list

  async function deleteProductFromDB(id) {
    await fetch(SERVER + `/${id}`, {
      method: "DELETE",
    });
  }

  parentList.addEventListener("click", (event) => {
    if (event.target.classList.contains("product-list_item")) {
      event.target.remove();
      let id = event.target.getAttribute("id");

      deleteProductFromDB(id);
    }
  });

  //clear list // TODO remove from DB

  function showModal() {
    confirmModal.style.display = "block";
    confirmModal.addEventListener("click", (e) => {
      if (e.target && e.target.classList.contains("true")) {
        confirmModal.style.display = "none";

        let products = document.querySelectorAll(".product-list_item");
        products.forEach((item) => {
          deleteProductFromDB(item.id);
        });

        while (parentList.firstChild) {
          parentList.removeChild(parentList.firstChild);
        }
      } else if (e.target && e.target.classList.contains("false")) {
        confirmModal.style.display = "none";
      }
    });
  }

  document.querySelector(".clear-list_btn").addEventListener("click", () => {
    showModal();
  });

  //loader

  const loader = document.querySelector(".loader");

  document.dispatchEvent(new CustomEvent("busy", { detail: true }));

  function showSpinner() {
    loader.classList.remove("hidden");
    loader.classList.add("show");
  }

  function hideSpinner() {
    loader.classList.remove("show");
    loader.classList.add("hidden");
  }
  function preloaderRun() {
    document.addEventListener("busy", (e) => {
      if (e.detail) {
        showSpinner();
      } else {
        hideSpinner();
      }
    });
  }
  preloaderRun();
});
